// Streak-shield consumption against a real Postgres (P1.2). Skips unless
// TEST_DATABASE_URL is set (see api/__tests__/setup.ts). Exercises
// updateStreakForActivity's shield branch end to end:
//   - 1 missed day + 1 shield → streak continues, shield burned, audit row
//   - 3 missed days + 1 shield → plain break, shield NOT wasted
//   - 1 missed day + 0 shields → existing break + pre_break recovery path
//   - shield purchase delivery: 0→1→2, cap rejection without debit

import { describe, it, expect, beforeEach, afterEach, afterAll } from 'vitest'
import { pool, query, queryOne, withTransaction } from '../../db.js'
import { updateStreakForActivity } from '../../services/gamification/streakUpdater.js'
import { ensureProfile } from '../../services/gamification/profileUpdater.js'
import { purchaseItem } from '../../services/shop/purchase.js'
import { wibDateString } from '../../lib/wib.js'
import { createFixtures, cleanupFixtures, type Fixtures } from '../helpers/fixtures.js'

const RUN = Boolean(process.env.TEST_DATABASE_URL)

function wibDateAgo(daysAgo: number): string {
  return wibDateString(new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000))
}

async function setProfileState(
  childId: string,
  state: { streak: number; lastActivityDaysAgo: number; shields: number; coins?: number },
): Promise<void> {
  await withTransaction((c) => ensureProfile(c, childId))
  await query(
    `UPDATE gamification_profiles
        SET current_streak_days = $1,
            longest_streak_days = GREATEST(longest_streak_days, $1),
            last_activity_date = $2,
            pre_break_streak_days = 0,
            streak_shields = $3,
            coin_balance = $4
        WHERE child_id = $5`,
    [state.streak, wibDateAgo(state.lastActivityDaysAgo), state.shields, state.coins ?? 0, childId],
  )
}

async function readProfile(childId: string) {
  const row = await queryOne<{
    current_streak_days: number
    pre_break_streak_days: number
    streak_shields: number
    coin_balance: number
  }>(
    `SELECT current_streak_days, pre_break_streak_days, streak_shields, coin_balance
       FROM gamification_profiles WHERE child_id = $1`,
    [childId],
  )
  return {
    streak: Number(row?.current_streak_days ?? -1),
    preBreak: Number(row?.pre_break_streak_days ?? -1),
    shields: Number(row?.streak_shields ?? -1),
    coins: Number(row?.coin_balance ?? -1),
  }
}

async function countShieldAuditRows(childId: string): Promise<number> {
  const rows = await query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM reward_ledger
       WHERE child_id = $1 AND reward_type = 'STREAK_SHIELD_CONSUMED'`,
    [childId],
  )
  return Number(rows[0]?.count ?? 0)
}

async function shieldItemId(): Promise<string> {
  const row = await queryOne<{ id: string }>(
    `SELECT id FROM shop_items WHERE slug = 'streak_shield'`,
  )
  if (!row) throw new Error('streak_shield seed missing — apply migration 0038 to the test DB')
  return row.id
}

// File-level: close the shared pool after BOTH describe blocks finish.
afterAll(async () => {
  if (RUN) await pool.end()
})

describe.skipIf(!RUN)('streak shield consumption', () => {
  let fx: Fixtures
  const today = wibDateString(new Date())

  beforeEach(async () => {
    fx = await createFixtures()
  })

  afterEach(async () => {
    await cleanupFixtures(fx)
  })

  it('1 missed day + 1 shield → streak continues, shield burned, audit row', async () => {
    await setProfileState(fx.childId, { streak: 5, lastActivityDaysAgo: 2, shields: 1 })

    const state = await withTransaction((c) => updateStreakForActivity(c, fx.childId, today))
    expect(state.currentStreakDays).toBe(6) // as if consecutive
    expect(state.preBreakStreakDays).toBe(0)
    expect(state.recoveryEligible).toBe(false)

    const profile = await readProfile(fx.childId)
    expect(profile.streak).toBe(6)
    expect(profile.shields).toBe(0)
    expect(profile.preBreak).toBe(0)
    expect(await countShieldAuditRows(fx.childId)).toBe(1)

    const audit = await queryOne<{ metadata: { coveredDates: string[]; shieldsConsumed: number } }>(
      `SELECT metadata FROM reward_ledger
         WHERE child_id = $1 AND reward_type = 'STREAK_SHIELD_CONSUMED'`,
      [fx.childId],
    )
    expect(audit?.metadata.shieldsConsumed).toBe(1)
    expect(audit?.metadata.coveredDates).toEqual([wibDateAgo(1)])
  })

  it('2 missed days + 2 shields → streak continues, both shields burned', async () => {
    await setProfileState(fx.childId, { streak: 7, lastActivityDaysAgo: 3, shields: 2 })

    const state = await withTransaction((c) => updateStreakForActivity(c, fx.childId, today))
    expect(state.currentStreakDays).toBe(8)

    const profile = await readProfile(fx.childId)
    expect(profile.shields).toBe(0)
    expect(await countShieldAuditRows(fx.childId)).toBe(1)
  })

  it('3 missed days + 1 shield → plain break, shield NOT wasted, no audit row', async () => {
    await setProfileState(fx.childId, { streak: 9, lastActivityDaysAgo: 4, shields: 1 })

    const state = await withTransaction((c) => updateStreakForActivity(c, fx.childId, today))
    expect(state.currentStreakDays).toBe(1)
    expect(state.recoveryEligible).toBe(false) // gap > 2 → no recovery either

    const profile = await readProfile(fx.childId)
    expect(profile.streak).toBe(1)
    expect(profile.shields).toBe(1) // kept for a salvageable miss later
    expect(await countShieldAuditRows(fx.childId)).toBe(0)
  })

  it('1 missed day + 0 shields → recovery fallback still offered', async () => {
    await setProfileState(fx.childId, { streak: 4, lastActivityDaysAgo: 2, shields: 0 })

    const state = await withTransaction((c) => updateStreakForActivity(c, fx.childId, today))
    expect(state.currentStreakDays).toBe(1)
    expect(state.preBreakStreakDays).toBe(4)
    expect(state.recoveryEligible).toBe(true)
    expect(await countShieldAuditRows(fx.childId)).toBe(0)
  })
})

describe.skipIf(!RUN)('streak shield purchase', () => {
  let fx: Fixtures

  beforeEach(async () => {
    fx = await createFixtures()
  })

  afterEach(async () => {
    await cleanupFixtures(fx)
  })

  it('delivers 0→1, then 1→2, then rejects at cap WITHOUT debiting', async () => {
    const itemId = await shieldItemId()
    await setProfileState(fx.childId, { streak: 1, lastActivityDaysAgo: 0, shields: 0, coins: 400 })

    const first = await purchaseItem(fx.childId, itemId)
    expect(first.status).toBe('purchased')
    if (first.status === 'purchased') {
      expect(first.streakShields).toBe(1)
      expect(first.inventoryId).toBeNull()
      expect(first.balance).toBe(400 - first.item.coinPrice)
    }

    const second = await purchaseItem(fx.childId, itemId)
    expect(second.status).toBe('purchased')
    if (second.status === 'purchased') expect(second.streakShields).toBe(2)

    const balanceAtCap = (await readProfile(fx.childId)).coins
    const third = await purchaseItem(fx.childId, itemId)
    expect(third.status).toBe('shield_cap')
    if (third.status === 'shield_cap') {
      expect(third.shields).toBe(2)
      expect(third.balance).toBe(balanceAtCap)
    }

    const profile = await readProfile(fx.childId)
    expect(profile.shields).toBe(2)
    expect(profile.coins).toBe(balanceAtCap) // no debit on the rejection

    // No inventory rows for the shield — delivery is the profile counter.
    const inv = await query(
      `SELECT id FROM child_inventory WHERE child_id = $1 AND shop_item_id = $2`,
      [fx.childId, itemId],
    )
    expect(inv).toHaveLength(0)

    // Two SHOP_PURCHASE ledger debits, one per delivered shield.
    const ledger = await query<{ coin_delta: number }>(
      `SELECT coin_delta FROM reward_ledger
         WHERE child_id = $1 AND reward_type = 'SHOP_PURCHASE'`,
      [fx.childId],
    )
    expect(ledger).toHaveLength(2)
  })

  it('insufficient coins → no shield delivered', async () => {
    const itemId = await shieldItemId()
    await setProfileState(fx.childId, { streak: 1, lastActivityDaysAgo: 0, shields: 0, coins: 10 })

    const result = await purchaseItem(fx.childId, itemId)
    expect(result.status).toBe('insufficient_funds')

    const profile = await readProfile(fx.childId)
    expect(profile.shields).toBe(0)
    expect(profile.coins).toBe(10)
  })
})
