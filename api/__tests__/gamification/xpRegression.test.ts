// api/__tests__/gamification/xpRegression.test.ts
//
// CRITICAL regression suite. The coins work edits appendLedger,
// updateProfileWithDelta, and processScoreSubmission — shared functions the
// XP path depends on. These tests assert the XP path is unchanged: a coin
// change that breaks XP must turn a test red here.
//
// Runs only against TEST_DATABASE_URL (see api/__tests__/setup.ts).

import { describe, it, expect, beforeEach, afterEach, afterAll } from 'vitest'
import { pool, query, queryOne } from '../../db.js'
import { submitVideoScore } from '../../services/member.js'
import { createFixtures, cleanupFixtures, type Fixtures } from '../helpers/fixtures.js'

const RUN = Boolean(process.env.TEST_DATABASE_URL)

describe.skipIf(!RUN)('XP regression — coins must not break the XP path', () => {
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

  it('a first quiz completion still grants completion XP', async () => {
    const result = await submitVideoScore({
      userId: fx.userId,
      childId: fx.childId,
      videoId: fx.videoId,
      correctAnswers: 7,
    })
    expect(result.gamification.xpEarned).toBeGreaterThanOrEqual(25)

    const completion = await queryOne<{ xp_delta: number }>(
      `SELECT xp_delta FROM reward_ledger
         WHERE child_id = $1 AND reward_type = 'QUIZ_COMPLETION_XP'`,
      [fx.childId],
    )
    expect(completion).not.toBeNull()
    expect(Number(completion!.xp_delta)).toBe(25)
  })

  it('total_xp reconciles with the reward ledger', async () => {
    await submitVideoScore({
      userId: fx.userId,
      childId: fx.childId,
      videoId: fx.videoId,
      correctAnswers: 8,
    })

    const profile = await queryOne<{ total_xp: number }>(
      `SELECT total_xp FROM gamification_profiles WHERE child_id = $1`,
      [fx.childId],
    )
    const ledger = await queryOne<{ total: string }>(
      `SELECT COALESCE(SUM(xp_delta), 0) AS total FROM reward_ledger
         WHERE child_id = $1`,
      [fx.childId],
    )
    expect(Number(profile!.total_xp)).toBe(Number(ledger!.total))
  })

  it('a perfect score grants perfect XP and zero coins on that row', async () => {
    await submitVideoScore({
      userId: fx.userId,
      childId: fx.childId,
      videoId: fx.videoId,
      correctAnswers: 10,
    })

    const perfect = await queryOne<{ xp_delta: number; coin_delta: number }>(
      `SELECT xp_delta, coin_delta FROM reward_ledger
         WHERE child_id = $1 AND reward_type = 'PERFECT_SCORE_XP'`,
      [fx.childId],
    )
    expect(perfect).not.toBeNull()
    expect(Number(perfect!.xp_delta)).toBe(25)
    // Coins are scoped to quiz-completion and quests only — never the
    // perfect/high/improved bonus rows.
    expect(Number(perfect!.coin_delta)).toBe(0)
  })

  it('a score correction does not re-grant completion XP', async () => {
    await submitVideoScore({
      userId: fx.userId,
      childId: fx.childId,
      videoId: fx.videoId,
      correctAnswers: 5,
    })
    const correction = await submitVideoScore({
      userId: fx.userId,
      childId: fx.childId,
      videoId: fx.videoId,
      correctAnswers: 8,
    })
    expect(correction.isCorrection).toBe(true)

    const rows = await query<{ xp_delta: number }>(
      `SELECT xp_delta FROM reward_ledger
         WHERE child_id = $1 AND reward_type = 'QUIZ_COMPLETION_XP'`,
      [fx.childId],
    )
    expect(rows.length).toBe(1)
  })

  it('a submission increments the streak', async () => {
    await submitVideoScore({
      userId: fx.userId,
      childId: fx.childId,
      videoId: fx.videoId,
      correctAnswers: 6,
    })

    const profile = await queryOne<{ current_streak_days: number }>(
      `SELECT current_streak_days FROM gamification_profiles WHERE child_id = $1`,
      [fx.childId],
    )
    expect(Number(profile!.current_streak_days)).toBeGreaterThanOrEqual(1)
  })
})
