// api/__tests__/gamification/coins.test.ts
//
// Coin earning — the v1 "earn-only" currency. Covers the ledger grant +
// idempotency, the atomic balance update under concurrency, and the
// end-to-end earn path through submitVideoScore.
//
// Runs only against TEST_DATABASE_URL (see api/__tests__/setup.ts).

import { describe, it, expect, beforeEach, afterEach, afterAll } from 'vitest'
import { randomUUID } from 'node:crypto'
import { pool, query, queryOne, withTransaction } from '../../db.js'
import { submitVideoScore } from '../../services/member.js'
import { appendLedger } from '../../services/gamification/ledger.js'
import {
  ensureProfile,
  updateProfileWithDelta,
} from '../../services/gamification/profileUpdater.js'
import { wibDateString } from '../../lib/wib.js'
import { createFixtures, cleanupFixtures, type Fixtures } from '../helpers/fixtures.js'

const RUN = Boolean(process.env.TEST_DATABASE_URL)

describe.skipIf(!RUN)('coin earning', () => {
  let fx: Fixtures

  beforeEach(async () => {
    fx = await createFixtures()
  })
  afterEach(async () => {
    await cleanupFixtures(fx)
  })
  afterAll(async () => {
    await pool.end()
  })

  it('appendLedger grants coins once and is idempotent on a retry', async () => {
    const sourceId = randomUUID()
    const input = {
      childId: fx.childId,
      rewardType: 'QUIZ_COMPLETION_XP' as const,
      sourceType: 'score_attempt',
      sourceId,
      xpDelta: 25,
      coinDelta: 5,
    }

    const first = await withTransaction((c) => appendLedger(c, input))
    expect(first.appended).toBe(true)
    expect(first.coinDelta).toBe(5)

    // Same idempotency key — a retried submission must not double-grant.
    const retry = await withTransaction((c) => appendLedger(c, input))
    expect(retry.appended).toBe(false)
    expect(retry.coinDelta).toBe(5) // canonical value of the existing row

    const rows = await query<{ n: string }>(
      `SELECT COUNT(*) AS n FROM reward_ledger
         WHERE child_id = $1 AND reward_type = 'QUIZ_COMPLETION_XP' AND source_id = $2`,
      [fx.childId, sourceId],
    )
    expect(Number(rows[0].n)).toBe(1)
  })

  it('updateProfileWithDelta increments coin_balance atomically under concurrency', async () => {
    await withTransaction((c) => ensureProfile(c, fx.childId))
    const concurrency = 15
    const today = wibDateString(new Date())

    await Promise.all(
      Array.from({ length: concurrency }, () =>
        withTransaction((c) =>
          updateProfileWithDelta(c, {
            childId: fx.childId,
            xpDelta: 0,
            coinDelta: 10,
            activityDate: today,
          }),
        ),
      ),
    )

    const profile = await queryOne<{ coin_balance: number }>(
      `SELECT coin_balance FROM gamification_profiles WHERE child_id = $1`,
      [fx.childId],
    )
    // Read-then-write would lose increments; the atomic delta must not.
    expect(Number(profile!.coin_balance)).toBe(concurrency * 10)
  })

  it('a first quiz completion grants coins', async () => {
    const result = await submitVideoScore({
      userId: fx.userId,
      childId: fx.childId,
      videoId: fx.videoId,
      correctAnswers: 8,
    })

    // Quiz completion grants COIN_QUIZ_COMPLETION (5); quests may add more.
    expect(result.gamification.coinsEarned).toBeGreaterThanOrEqual(5)
    // First-ever submission: the running balance equals what was just earned.
    expect(result.gamification.coinBalance).toBe(result.gamification.coinsEarned)

    const completion = await queryOne<{ coin_delta: number }>(
      `SELECT coin_delta FROM reward_ledger
         WHERE child_id = $1 AND reward_type = 'QUIZ_COMPLETION_XP'`,
      [fx.childId],
    )
    expect(completion).not.toBeNull()
    expect(Number(completion!.coin_delta)).toBe(5)
  })

  it('coin_balance reconciles with the reward ledger', async () => {
    await submitVideoScore({
      userId: fx.userId,
      childId: fx.childId,
      videoId: fx.videoId,
      correctAnswers: 9,
    })

    const profile = await queryOne<{ coin_balance: number }>(
      `SELECT coin_balance FROM gamification_profiles WHERE child_id = $1`,
      [fx.childId],
    )
    const ledger = await queryOne<{ total: string }>(
      `SELECT COALESCE(SUM(coin_delta), 0) AS total FROM reward_ledger
         WHERE child_id = $1`,
      [fx.childId],
    )
    // The cached balance must equal the sum of every coin grant.
    expect(Number(profile!.coin_balance)).toBe(Number(ledger!.total))
  })

  it('a score correction does not grant completion coins again', async () => {
    await submitVideoScore({
      userId: fx.userId,
      childId: fx.childId,
      videoId: fx.videoId,
      correctAnswers: 6,
    })
    const afterFirst = await queryOne<{ n: string }>(
      `SELECT COUNT(*) AS n FROM reward_ledger
         WHERE child_id = $1 AND reward_type = 'QUIZ_COMPLETION_XP'`,
      [fx.childId],
    )
    expect(Number(afterFirst!.n)).toBe(1)

    // A second submission for the same video is a correction.
    const correction = await submitVideoScore({
      userId: fx.userId,
      childId: fx.childId,
      videoId: fx.videoId,
      correctAnswers: 9,
    })
    expect(correction.isCorrection).toBe(true)

    const afterCorrection = await queryOne<{ n: string }>(
      `SELECT COUNT(*) AS n FROM reward_ledger
         WHERE child_id = $1 AND reward_type = 'QUIZ_COMPLETION_XP'`,
      [fx.childId],
    )
    expect(Number(afterCorrection!.n)).toBe(1) // still one — no re-grant
  })
})
