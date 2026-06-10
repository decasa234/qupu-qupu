// api/__tests__/gamification/familyQuest.test.ts
//
// Misi Keluarga (P2.3) — the weekly account-scoped co-op quest — plus the
// Papan Keluarga sibling leaderboard. Runs only against TEST_DATABASE_URL
// (see api/__tests__/setup.ts).
//
// The contract under test:
//   - a >= 2-children account gets exactly ONE quest per WIB week, no
//     matter how many times the status endpoint is read;
//   - a single-child account never gets a quest (leaderboard/quest hidden);
//   - completion pays EVERY child exactly once — across concurrent settles
//     AND replayed session commits (rewarded_at winner gate + per-(quest,
//     child) deterministic ledger keys);
//   - the konsep-commit hook settles the quest in the same transaction and
//     folds the committing child's coin share into the stored result.

import { describe, test, expect, beforeAll, beforeEach, afterEach, afterAll } from 'vitest'
import { randomUUID } from 'node:crypto'
import request from 'supertest'
import { signToken } from '../../lib/jwt.js'
import { pool, query, queryOne } from '../../db.js'
import app from '../../app.js'
import { wibWeek } from '../../lib/wib.js'
import {
  ensureFamilyQuest,
  getFamilyQuestStatus,
  FAMILY_QUEST_TARGET_XP,
  FAMILY_QUEST_REWARD_COINS,
} from '../../services/gamification/familyQuest.js'
import { getFamilyLeaderboard } from '../../services/gamification/familyLeaderboard.js'
import { commitKonsepSession } from '../../services/wmi/concepts/session.js'
import {
  ensureBootstrapped,
  _resetBootstrapForTesting,
} from '../../services/wmi/concepts/bootstrap.js'

const runIntegration = Boolean(process.env.TEST_DATABASE_URL)

;(runIntegration ? describe : describe.skip)('Misi Keluarga + Papan Keluarga (P2.3)', () => {
  let parentUserId: string
  let childA: string
  let childB: string
  let token: string
  const createdUserIds: string[] = []

  beforeAll(async () => {
    _resetBootstrapForTesting()
    await ensureBootstrapped()
  })

  beforeEach(async () => {
    const tag = randomUUID().slice(0, 8)
    const user = await queryOne<{ id: string }>(
      `INSERT INTO users (email, name, role) VALUES ($1, $2, 'parent') RETURNING id`,
      [`family-quest-${tag}@example.com`, `Family Test ${tag}`],
    )
    parentUserId = user!.id
    createdUserIds.push(parentUserId)
    const a = await queryOne<{ id: string }>(
      `INSERT INTO children (parent_user_id, name) VALUES ($1, $2) RETURNING id`,
      [parentUserId, `Kakak ${tag}`],
    )
    childA = a!.id
    const b = await queryOne<{ id: string }>(
      `INSERT INTO children (parent_user_id, name) VALUES ($1, $2) RETURNING id`,
      [parentUserId, `Adik ${tag}`],
    )
    childB = b!.id
    token = signToken(
      { id: parentUserId, email: `family-quest-${tag}@example.com`, role: 'parent' },
      { expiresIn: '7d' },
    )
  })

  afterEach(async () => {
    // users → children → ledger/profiles/quests cascade.
    await query(`DELETE FROM users WHERE id = ANY($1::uuid[])`, [createdUserIds])
    createdUserIds.length = 0
  })

  afterAll(async () => {
    await pool.end()
  })

  async function makeSingleChildParent() {
    const tag = randomUUID().slice(0, 8)
    const user = await queryOne<{ id: string }>(
      `INSERT INTO users (email, name, role) VALUES ($1, $2, 'parent') RETURNING id`,
      [`solo-${tag}@example.com`, `Solo ${tag}`],
    )
    createdUserIds.push(user!.id)
    await query(`INSERT INTO children (parent_user_id, name) VALUES ($1, $2)`, [
      user!.id,
      `Tunggal ${tag}`,
    ])
    return user!.id
  }

  // Direct ledger XP for a child (unique random source ids), defaulting to
  // "now" — i.e. inside the current WIB week.
  async function grantXp(childId: string, xp: number, createdAt?: Date) {
    await query(
      `INSERT INTO reward_ledger
         (child_id, reward_type, source_type, source_id, xp_delta, coin_delta, metadata, created_at)
       VALUES ($1, 'CONCEPT_COMPLETION_XP', 'test_grant', $2, $3, 0, '{}'::jsonb, COALESCE($4, NOW()))`,
      [childId, randomUUID(), xp, createdAt ?? null],
    )
  }

  async function questRows(userId: string) {
    return query<{ id: string; target_xp: number; reward_coins: number; completed_at: string | null; rewarded_at: string | null }>(
      `SELECT id, target_xp, reward_coins, completed_at, rewarded_at
         FROM family_quests WHERE user_id = $1`,
      [userId],
    )
  }

  async function payoutRows(childId: string) {
    return query<{ coin_delta: string }>(
      `SELECT coin_delta::text FROM reward_ledger
        WHERE child_id = $1 AND reward_type = 'FAMILY_QUEST_COIN'`,
      [childId],
    )
  }

  async function coinBalance(childId: string) {
    const row = await queryOne<{ coin_balance: string }>(
      `SELECT coin_balance::text FROM gamification_profiles WHERE child_id = $1`,
      [childId],
    )
    return Number(row?.coin_balance ?? 0)
  }

  test('a 2-children account gets exactly one quest per week, lazily', async () => {
    const first = await getFamilyQuestStatus(parentUserId)
    expect(first.quest).not.toBeNull()
    expect(first.quest!.targetXp).toBe(FAMILY_QUEST_TARGET_XP)
    expect(first.quest!.rewardCoinsPerChild).toBe(FAMILY_QUEST_REWARD_COINS)
    expect(first.quest!.weekStart).toBe(wibWeek(new Date()).start)
    expect(first.quest!.completed).toBe(false)

    // Re-reads (and concurrent ensures) never create a second row.
    await Promise.all([
      getFamilyQuestStatus(parentUserId),
      getFamilyQuestStatus(parentUserId),
      ensureFamilyQuest(pool, parentUserId, wibWeek(new Date()).start),
    ])
    const rows = await questRows(parentUserId)
    expect(rows).toHaveLength(1)
    expect(rows[0].id).toBe(first.quest!.id)
  })

  test('a single-child account gets no quest and an empty-feeling family surface', async () => {
    const soloUserId = await makeSingleChildParent()
    const status = await getFamilyQuestStatus(soloUserId)
    expect(status.quest).toBeNull()
    expect(await questRows(soloUserId)).toHaveLength(0)
  })

  test('progress sums BOTH children within the WIB week and ignores older rows', async () => {
    await grantXp(childA, 40)
    await grantXp(childB, 25)
    // Pre-week row: one second before Monday 00:00 WIB.
    const beforeWeek = new Date(wibWeek(new Date()).startUtc.getTime() - 1000)
    await grantXp(childA, 999, beforeWeek)

    const status = await getFamilyQuestStatus(parentUserId)
    expect(status.quest!.progressXp).toBe(65)
    expect(status.quest!.completed).toBe(false)

    // Leaderboard sees the same weekly window — childA leads, no ties.
    const board = await getFamilyLeaderboard(parentUserId)
    expect(board.week.start).toBe(wibWeek(new Date()).start)
    expect(board.entries).toHaveLength(2)
    expect(board.entries[0]).toMatchObject({ childId: childA, weeklyXp: 40, rank: 1 })
    expect(board.entries[1]).toMatchObject({ childId: childB, weeklyXp: 25, rank: 2 })
  })

  test('leaderboard ties share the crown rank', async () => {
    await grantXp(childA, 30)
    await grantXp(childB, 30)
    const board = await getFamilyLeaderboard(parentUserId)
    expect(board.entries.map((e) => e.rank)).toEqual([1, 1])
  })

  test('GET /api/me/family/* routes are parent-auth and account-scoped', async () => {
    await grantXp(childA, 10)
    const lb = await request(app)
      .get('/api/me/family/leaderboard')
      .set('Authorization', `Bearer ${token}`)
    expect(lb.status).toBe(200)
    expect(lb.body.data.entries).toHaveLength(2)

    const fq = await request(app)
      .get('/api/me/family/quest')
      .set('Authorization', `Bearer ${token}`)
    expect(fq.status).toBe(200)
    expect(fq.body.data.quest.targetXp).toBe(FAMILY_QUEST_TARGET_XP)

    const anon = await request(app).get('/api/me/family/leaderboard')
    expect(anon.status).toBe(401)
  })

  test('payout pays each child exactly once across CONCURRENT settles', async () => {
    await getFamilyQuestStatus(parentUserId) // create the quest
    await grantXp(childA, FAMILY_QUEST_TARGET_XP - 50)
    await grantXp(childB, 50)

    // 5 concurrent lazy settles race for the rewarded_at stamp.
    const statuses = await Promise.all(
      Array.from({ length: 5 }, () => getFamilyQuestStatus(parentUserId)),
    )
    for (const s of statuses) expect(s.quest!.completed).toBe(true)

    const rows = await questRows(parentUserId)
    expect(rows).toHaveLength(1)
    expect(rows[0].completed_at).not.toBeNull()
    expect(rows[0].rewarded_at).not.toBeNull()

    // EXACTLY one 30-coin payout row per child, balances credited once.
    for (const childId of [childA, childB]) {
      const payouts = await payoutRows(childId)
      expect(payouts).toHaveLength(1)
      expect(Number(payouts[0].coin_delta)).toBe(FAMILY_QUEST_REWARD_COINS)
      expect(await coinBalance(childId)).toBe(FAMILY_QUEST_REWARD_COINS)
    }
  })

  // ── The konsep-commit hook (synthetic chapter, same pattern as
  //    konsepCommit.test.ts) ──────────────────────────────────────────────

  async function createSyntheticConcept() {
    const tag = randomUUID().slice(0, 8)
    const subjectKey = `g1-family-${tag}`
    await query(
      `INSERT INTO wmi_subjects (subject_key, grade, name_id, name_en, color_hex, icon_key, sort_order)
       VALUES ($1, 1, 'Bab Keluarga', 'Family Chapter', '#123456', 'star', 998)`,
      [subjectKey],
    )
    const slug = `family-${tag}`
    await query(
      `INSERT INTO wmi_concepts (slug, name_en, name_id, grades, enabled, subject_key, difficulty, sort_order)
       VALUES ($1, 'Family', 'Keluarga', ARRAY[1]::smallint[], TRUE, $2, 1, 1)`,
      [slug, subjectKey],
    )
    const inst = await queryOne<{ id: string }>(
      `INSERT INTO wmi_concept_instances
         (concept_slug, params, body_en, body_id, answer_type, answer)
       VALUES ($1, $2::jsonb, 'What is 3+4?', 'Berapa 3+4?', 'fill_in', '7')
       RETURNING id`,
      [slug, JSON.stringify({ tag })],
    )
    return { subjectKey, instanceId: inst!.id }
  }

  function answersFor(instanceId: string, selected: string) {
    return Array.from({ length: 20 }, () => ({
      conceptInstanceId: instanceId,
      selectedAnswer: selected,
    }))
  }

  test('commit hook settles the quest, pays both children once, and replays safely', async () => {
    // A low-target quest this commit will certainly cross (20 correct on a
    // fresh concept banks 5 base XP + 65 tier-up bonus XP = 70).
    await query(
      `INSERT INTO family_quests (user_id, week_start, target_xp, reward_coins)
       VALUES ($1, $2, 50, $3)`,
      [parentUserId, wibWeek(new Date()).start, FAMILY_QUEST_REWARD_COINS],
    )

    const { subjectKey, instanceId } = await createSyntheticConcept()
    const sessionId = randomUUID()
    const result = await commitKonsepSession(
      parentUserId,
      childA,
      subjectKey,
      sessionId,
      answersFor(instanceId, '7'),
    )

    expect(result.familyQuestCompleted).toBe(true)
    const aPayouts = await payoutRows(childA)
    expect(aPayouts).toHaveLength(1)
    // This is childA's FIRST-EVER activity, so the result's coinsEarned must
    // equal the full coin ledger sum — which includes the FAMILY_QUEST_COIN
    // row. That proves the committing child's +30 share was folded in.
    const aLedgerCoins = await queryOne<{ coins: string }>(
      `SELECT COALESCE(SUM(coin_delta), 0)::text AS coins
         FROM reward_ledger WHERE child_id = $1`,
      [childA],
    )
    expect(result.coinsEarned).toBe(Number(aLedgerCoins!.coins))
    expect(result.coinsEarned).toBeGreaterThanOrEqual(FAMILY_QUEST_REWARD_COINS)
    expect(result.coinBalance).toBe(await coinBalance(childA))

    // The idle sibling was paid too — exactly once.
    const bPayouts = await payoutRows(childB)
    expect(bPayouts).toHaveLength(1)
    expect(await coinBalance(childB)).toBe(FAMILY_QUEST_REWARD_COINS)

    // Replay: stored result verbatim, NO second payout for anyone.
    const replay = await commitKonsepSession(
      parentUserId,
      childA,
      subjectKey,
      sessionId,
      answersFor(instanceId, '7'),
    )
    expect(replay).toEqual({ ...result, replayed: true })
    expect(await payoutRows(childA)).toHaveLength(1)
    expect(await payoutRows(childB)).toHaveLength(1)

    // A FRESH session after the payout probes once and pays nothing more.
    const second = await commitKonsepSession(
      parentUserId,
      childA,
      subjectKey,
      randomUUID(),
      answersFor(instanceId, '7'),
    )
    expect(second.familyQuestCompleted).toBeUndefined()
    expect(await payoutRows(childA)).toHaveLength(1)

    // Cached balances still reconcile with the full ledger.
    for (const childId of [childA, childB]) {
      const sums = await queryOne<{ coins: string }>(
        `SELECT COALESCE(SUM(coin_delta), 0)::text AS coins
           FROM reward_ledger WHERE child_id = $1`,
        [childId],
      )
      expect(await coinBalance(childId)).toBe(Number(sums!.coins))
    }
  })
})
