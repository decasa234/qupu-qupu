// api/services/gamification/familyQuest.ts
//
// "Misi Keluarga" — one weekly co-op quest per ACCOUNT (parent user):
// "Kumpulkan 300 XP bersama minggu ini". Progress is the sum of every
// child's reward_ledger xp_delta inside the WIB week; on completion EVERY
// child is paid 30 coins.
//
// Lifecycle:
//   - created lazily on the GET /me/family/quest read when the account has
//     >= 2 children (one INSERT ... ON CONFLICT round-trip);
//   - completion + payout evaluated lazily on that read AND at konsep
//     session commit (settleFamilyQuestAtCommit — see the round-trip note).
//
// Payout race design (three layers, outermost first):
//   1. the probe locks the quest row FOR UPDATE SKIP LOCKED — a concurrent
//      settler simply sees "no row" and skips, so two sibling commits can
//      never deadlock through (own profile row) ↔ (quest row);
//   2. rewarded_at is stamped via UPDATE ... WHERE rewarded_at IS NULL
//      RETURNING — only the winner proceeds to pay;
//   3. each child's payout ledger row is keyed
//      deterministicUuid('family-quest:<questId>:<childId>'), so even a
//      double payout attempt is absorbed by the ledger UNIQUE, and the
//      profile credit only counts APPENDED rows.

import type { PoolClient } from 'pg'
import { query, queryOne, withTransaction, type DbExecutor } from '../../db.js'
import { deterministicUuid } from '../../lib/deterministicUuid.js'
import { wibWeek } from '../../lib/wib.js'

// Quest economy constants (P2.3): a combined target a 2-child family clears
// with a few sessions each, and a flat per-child coin reward.
export const FAMILY_QUEST_TARGET_XP = 300
export const FAMILY_QUEST_REWARD_COINS = 30

/**
 * Lazily creates this week's family quest. No-op for accounts with fewer
 * than 2 children (Misi Keluarga is a sibling co-op feature) and for weeks
 * that already have a quest (UNIQUE (user_id, week_start) absorbs races).
 * One round-trip: the children count is a subquery of the INSERT.
 */
export async function ensureFamilyQuest(
  executor: DbExecutor,
  userId: string,
  weekStart: string,
): Promise<void> {
  await query(
    `INSERT INTO family_quests (user_id, week_start, target_xp, reward_coins)
     SELECT $1, $2, $3, $4
      WHERE (SELECT COUNT(*) FROM children WHERE parent_user_id = $1) >= 2
     ON CONFLICT (user_id, week_start) DO NOTHING`,
    [userId, weekStart, FAMILY_QUEST_TARGET_XP, FAMILY_QUEST_REWARD_COINS],
    executor,
  )
}

// This week's XP across ALL of the account's children. Inside a commit
// transaction this includes the commit's own just-inserted ledger rows
// (same transaction, created_at = NOW()).
async function weeklyFamilyXp(
  executor: DbExecutor,
  userId: string,
  weekStartUtc: Date,
): Promise<number> {
  const row = await queryOne<{ xp: string }>(
    `SELECT COALESCE(SUM(rl.xp_delta), 0)::text AS xp
       FROM reward_ledger rl
       JOIN children c ON c.id = rl.child_id
      WHERE c.parent_user_id = $1 AND rl.created_at >= $2`,
    [userId, weekStartUtc],
    executor,
  )
  return Number(row?.xp ?? 0)
}

interface QuestRow {
  id: string
  target_xp: number
  reward_coins: number
}

// Stamp completion + pay every child. Caller must hold the quest row lock
// (FOR UPDATE SKIP LOCKED probe). Returns coins paid per child — APPENDED
// ledger rows only, so a replayed payout credits nothing twice.
async function completeAndPay(
  client: PoolClient,
  userId: string,
  quest: QuestRow,
): Promise<Map<string, number>> {
  // Winner gate: only the transaction that flips rewarded_at pays out.
  const won = await queryOne<{ id: string }>(
    `UPDATE family_quests
        SET completed_at = COALESCE(completed_at, NOW()), rewarded_at = NOW()
      WHERE id = $1 AND rewarded_at IS NULL
      RETURNING id`,
    [quest.id],
    client,
  )
  if (!won) return new Map()

  const children = await query<{ id: string }>(
    'SELECT id FROM children WHERE parent_user_id = $1 ORDER BY created_at ASC',
    [userId],
    client,
  )
  const childIds = children.map((c) => c.id)
  if (childIds.length === 0) return new Map()
  const sourceIds = childIds.map((id) => deterministicUuid(`family-quest:${quest.id}:${id}`))

  // Brand-new siblings may have no profile row yet — batch-ensure first.
  await client.query(
    `INSERT INTO gamification_profiles (child_id)
     SELECT unnest($1::uuid[]) ON CONFLICT (child_id) DO NOTHING`,
    [childIds],
  )

  // One batched, idempotent ledger insert: one FAMILY_QUEST_COIN row per
  // child, keyed on the deterministic per-(quest, child) source id.
  const ledgerRes = await client.query<{ child_id: string; coin_delta: number }>(
    `INSERT INTO reward_ledger
       (child_id, reward_type, source_type, source_id, xp_delta, coin_delta, metadata)
     SELECT src.child_id, 'FAMILY_QUEST_COIN', 'family_quest', src.source_id, 0, $3, $4::jsonb
       FROM unnest($1::uuid[], $2::uuid[]) AS src(child_id, source_id)
     ON CONFLICT (child_id, reward_type, source_type, source_id) DO NOTHING
     RETURNING child_id, coin_delta`,
    [childIds, sourceIds, quest.reward_coins, JSON.stringify({ questId: quest.id })],
  )

  const paid = new Map<string, number>()
  for (const row of ledgerRes.rows) paid.set(row.child_id, Number(row.coin_delta))

  // Coins only (no XP, no level math): one atomic batched balance UPDATE for
  // the children whose ledger rows actually appended.
  if (paid.size > 0) {
    await client.query(
      `UPDATE gamification_profiles
          SET coin_balance = coin_balance + $2, updated_at = NOW()
        WHERE child_id = ANY($1::uuid[])`,
      [[...paid.keys()], quest.reward_coins],
    )
  }
  return paid
}

// Probe this week's unrewarded quest, taking its row lock. SKIP LOCKED:
// when another transaction is mid-settle we skip instead of queueing —
// lazy evaluation self-heals on the next read/commit if that one aborts.
async function probeUnrewardedQuest(
  client: PoolClient,
  userId: string,
  weekStart: string,
): Promise<QuestRow | null> {
  return queryOne<QuestRow>(
    `SELECT id, target_xp, reward_coins FROM family_quests
      WHERE user_id = $1 AND week_start = $2 AND rewarded_at IS NULL
      FOR UPDATE SKIP LOCKED`,
    [userId, weekStart],
    client,
  )
}

export interface FamilyQuestSettlement {
  questId: string
  // Coins credited per child BY THIS CALL (appended ledger rows only).
  coinsByChild: Map<string, number>
}

/**
 * Konsep-session-commit hook (runs on the commit's transaction client).
 * Round-trip cost on a typical commit: exactly ONE probe (returns nothing
 * when no quest exists, the quest is already rewarded, or another settler
 * holds it). When an active quest exists: +1 weekly-sum query; the full
 * stamp+payout block (+4) runs at most once per account-week ever.
 */
export async function settleFamilyQuestAtCommit(
  client: PoolClient,
  userId: string,
  now: Date,
): Promise<FamilyQuestSettlement | null> {
  const week = wibWeek(now)
  const quest = await probeUnrewardedQuest(client, userId, week.start)
  if (!quest) return null
  const progress = await weeklyFamilyXp(client, userId, week.startUtc)
  if (progress < Number(quest.target_xp)) return null
  const coinsByChild = await completeAndPay(client, userId, quest)
  return { questId: quest.id, coinsByChild }
}

export interface FamilyQuestStatus {
  quest: {
    id: string
    weekStart: string
    weekEnd: string
    targetXp: number
    rewardCoinsPerChild: number
    progressXp: number
    completed: boolean
  } | null
}

/**
 * GET /api/me/family/quest. Ensures this week's quest exists (>= 2 children),
 * reports progress, and lazily settles completion + payout when the target
 * was crossed by activity that never ran the commit hook (e.g. drill XP).
 */
export async function getFamilyQuestStatus(userId: string): Promise<FamilyQuestStatus> {
  const week = wibWeek(new Date())
  return withTransaction(async (client) => {
    await ensureFamilyQuest(client, userId, week.start)
    const quest = await queryOne<QuestRow & { completed_at: string | null; rewarded_at: string | null }>(
      `SELECT id, target_xp, reward_coins, completed_at, rewarded_at
         FROM family_quests WHERE user_id = $1 AND week_start = $2`,
      [userId, week.start],
      client,
    )
    if (!quest) return { quest: null } // single-child account (or no children)

    const progress = await weeklyFamilyXp(client, userId, week.startUtc)
    // "Completed" is the progress math, not the payout stamp: a reader
    // racing a concurrent settler (whose lock makes our settle a SKIP
    // LOCKED no-op) must still see the finished state — the payout is
    // guaranteed to land via that settler or the next lazy evaluation.
    const completed = quest.completed_at !== null || progress >= Number(quest.target_xp)
    if (!quest.rewarded_at && progress >= Number(quest.target_xp)) {
      // Lazy settle: re-probe WITH the row lock (same SKIP LOCKED contract
      // as the commit hook), then stamp + pay if we won it.
      const locked = await probeUnrewardedQuest(client, userId, week.start)
      if (locked) await completeAndPay(client, userId, locked)
    }

    return {
      quest: {
        id: quest.id,
        weekStart: week.start,
        weekEnd: week.end,
        targetXp: Number(quest.target_xp),
        rewardCoinsPerChild: Number(quest.reward_coins),
        progressXp: progress,
        completed,
      },
    }
  })
}
