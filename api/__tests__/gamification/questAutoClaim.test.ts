// Auto-claim of completed-but-unclaimed quest instances from PAST windows
// (P2 review item 1). The panel only lists today's instances, so a quest
// completed late yesterday used to be forfeited at WIB midnight. Now the
// first quest generation of a new WIB day sweeps those instances: the
// claim path's ledger-idempotent grant runs (same DAILY_QUEST_XP key = the
// instance id), claimed_at is stamped, and balances move WITHOUT touching
// the streak. Runs only against TEST_DATABASE_URL (api/__tests__/setup.ts).

import { describe, test, expect, beforeEach, afterEach, afterAll } from 'vitest'
import { randomUUID } from 'node:crypto'
import { pool, query, queryOne } from '../../db.js'
import { wibDateString } from '../../lib/wib.js'
import { getDailyQuestsForChild } from '../../services/gamification/quests.js'

const runIntegration = Boolean(process.env.TEST_DATABASE_URL)
const DAY_MS = 24 * 60 * 60 * 1000

;(runIntegration ? describe : describe.skip)('quest auto-claim at WIB day rollover', () => {
  let parentUserId: string
  let childId: string
  const createdUserIds: string[] = []

  beforeEach(async () => {
    const tag = randomUUID().slice(0, 8)
    const user = await queryOne<{ id: string }>(
      `INSERT INTO users (email, name, role) VALUES ($1, $2, 'parent') RETURNING id`,
      [`auto-claim-${tag}@example.com`, `AutoClaim Test ${tag}`],
    )
    parentUserId = user!.id
    createdUserIds.push(parentUserId)
    const child = await queryOne<{ id: string }>(
      `INSERT INTO children (parent_user_id, name) VALUES ($1, $2) RETURNING id`,
      [parentUserId, `Kid ${tag}`],
    )
    childId = child!.id
  })

  afterEach(async () => {
    await query(`DELETE FROM users WHERE id = ANY($1::uuid[])`, [createdUserIds])
    createdUserIds.length = 0
  })

  afterAll(async () => {
    await pool.end()
  })

  // A completed-but-unclaimed instance in a PAST window (default: yesterday).
  async function insertPastCompletedQuest(daysAgo = 1) {
    const template = await queryOne<{ id: string; xp_reward: number; coin_reward: number }>(
      `SELECT id, xp_reward, coin_reward FROM quest_templates WHERE code = 'konsep_session_1'`,
    )
    expect(template).toBeTruthy()
    const windowStart = wibDateString(new Date(Date.now() - daysAgo * DAY_MS))
    const inst = await queryOne<{ id: string }>(
      `INSERT INTO child_quest_instances
         (child_id, quest_template_id, window_start, window_end, status,
          progress_value, target_value, title_rendered, completed_at)
       VALUES ($1, $2, $3, $3, 'completed', 1, 1, 'Selesaikan 1 sesi latihan', NOW())
       RETURNING id`,
      [childId, template!.id, windowStart],
    )
    return {
      instanceId: inst!.id,
      xp: Number(template!.xp_reward),
      coins: Number(template!.coin_reward),
    }
  }

  async function questLedgerRows(forInstanceId: string) {
    return query<{ xp_delta: string; coin_delta: string }>(
      `SELECT xp_delta::text, coin_delta::text FROM reward_ledger
        WHERE child_id = $1 AND reward_type = 'DAILY_QUEST_XP'
          AND source_type = 'child_quest_instance' AND source_id = $2`,
      [childId, forInstanceId],
    )
  }

  async function profileRow() {
    return queryOne<{
      total_xp: string
      coin_balance: string
      current_streak_days: string
      last_activity_date: string | null
    }>(
      `SELECT total_xp::text, coin_balance::text, current_streak_days::text,
              last_activity_date::text AS last_activity_date
         FROM gamification_profiles WHERE child_id = $1`,
      [childId],
    )
  }

  test("yesterday's completed-unclaimed quest pays out on today's first read", async () => {
    const past = await insertPastCompletedQuest()

    // First touch of the day: generates today's slots AND sweeps the past
    // instance. The panel shows only today's (active) quests.
    const { quests } = await getDailyQuestsForChild(parentUserId, childId)
    expect(quests.length).toBeGreaterThan(0)
    expect(quests.some((q) => q.id === past.instanceId)).toBe(false)

    // Exactly one ledger row, keyed to the instance, with the template amounts.
    const ledger = await questLedgerRows(past.instanceId)
    expect(ledger).toHaveLength(1)
    expect(Number(ledger[0].xp_delta)).toBe(past.xp)
    expect(Number(ledger[0].coin_delta)).toBe(past.coins)

    // Instance stamped claimed; balances moved; streak untouched (an
    // auto-claim is not learning activity).
    const inst = await queryOne<{ status: string; claimed_at: string | null }>(
      `SELECT status, claimed_at FROM child_quest_instances WHERE id = $1`,
      [past.instanceId],
    )
    expect(inst!.status).toBe('claimed')
    expect(inst!.claimed_at).not.toBeNull()

    const profile = await profileRow()
    expect(Number(profile!.total_xp)).toBe(past.xp)
    expect(Number(profile!.coin_balance)).toBe(past.coins)
    expect(Number(profile!.current_streak_days)).toBe(0)
    expect(profile!.last_activity_date).toBeNull()

    // Re-reads take the cheap exit — nothing pays twice.
    await getDailyQuestsForChild(parentUserId, childId)
    expect(await questLedgerRows(past.instanceId)).toHaveLength(1)
    const after = await profileRow()
    expect(Number(after!.total_xp)).toBe(past.xp)
    expect(Number(after!.coin_balance)).toBe(past.coins)
  })

  test('an instance already paid (old auto-grant key) is stamped but never re-paid', async () => {
    const past = await insertPastCompletedQuest()
    // Simulate the retired auto-grant: same ledger key, paid long ago.
    await query(
      `INSERT INTO reward_ledger
         (child_id, reward_type, source_type, source_id, xp_delta, coin_delta, metadata)
       VALUES ($1, 'DAILY_QUEST_XP', 'child_quest_instance', $2, $3, $4, '{}'::jsonb)`,
      [childId, past.instanceId, past.xp, past.coins],
    )

    await getDailyQuestsForChild(parentUserId, childId)

    // Stamped claimed, but the collided ledger row credited nothing new.
    const inst = await queryOne<{ status: string; claimed_at: string | null }>(
      `SELECT status, claimed_at FROM child_quest_instances WHERE id = $1`,
      [past.instanceId],
    )
    expect(inst!.status).toBe('claimed')
    expect(inst!.claimed_at).not.toBeNull()
    expect(await questLedgerRows(past.instanceId)).toHaveLength(1)
    const profile = await profileRow()
    expect(Number(profile!.total_xp)).toBe(0)
    expect(Number(profile!.coin_balance)).toBe(0)
  })

  test('sweeps MULTIPLE past windows in one pass', async () => {
    const a = await insertPastCompletedQuest(1)
    // Same template two days ago — different window, same child.
    const template = await queryOne<{ id: string }>(
      `SELECT id FROM quest_templates WHERE code = 'konsep_answers_10'`,
    )
    const windowStart = wibDateString(new Date(Date.now() - 2 * DAY_MS))
    const b = await queryOne<{ id: string }>(
      `INSERT INTO child_quest_instances
         (child_id, quest_template_id, window_start, window_end, status,
          progress_value, target_value, title_rendered, completed_at)
       VALUES ($1, $2, $3, $3, 'completed', 10, 10, 'Jawab 10 soal konsep', NOW())
       RETURNING id`,
      [childId, template!.id, windowStart],
    )

    await getDailyQuestsForChild(parentUserId, childId)

    expect(await questLedgerRows(a.instanceId)).toHaveLength(1)
    expect(await questLedgerRows(b!.id)).toHaveLength(1)
    const claimed = await query<{ id: string }>(
      `SELECT id FROM child_quest_instances
        WHERE child_id = $1 AND claimed_at IS NOT NULL`,
      [childId],
    )
    expect(claimed.map((r) => r.id).sort()).toEqual([a.instanceId, b!.id].sort())
  })
})
