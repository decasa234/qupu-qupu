// Duplicate-submission race: two concurrent POSTs for the same fresh
// (child, video) must not both take the first-time reward path. The
// per-child FOR UPDATE in submitVideoScore serializes them so the second
// sees the first's unlock and lands on the correction branch.
//
// Runs only against TEST_DATABASE_URL (see api/__tests__/setup.ts).

import { describe, it, expect, beforeEach, afterEach, afterAll } from 'vitest'
import { pool, query } from '../../db.js'
import { submitVideoScore } from '../../services/member.js'
import { createFixtures, cleanupFixtures, type Fixtures } from '../helpers/fixtures.js'

const RUN = Boolean(process.env.TEST_DATABASE_URL)

describe.skipIf(!RUN)('score submission race + correction response', () => {
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

  it('two concurrent first submissions grant completion XP exactly once', async () => {
    const input = {
      userId: fx.userId,
      childId: fx.childId,
      videoId: fx.videoId,
      correctAnswers: 7,
    }
    const [a, b] = await Promise.all([submitVideoScore(input), submitVideoScore(input)])

    // Exactly one of the two saw no prior unlock.
    expect([a.isCorrection, b.isCorrection].filter(Boolean)).toHaveLength(1)

    const rows = await query<{ xp_delta: number }>(
      `SELECT xp_delta FROM reward_ledger
         WHERE child_id = $1 AND reward_type = 'QUIZ_COMPLETION_XP'`,
      [fx.childId],
    )
    expect(rows).toHaveLength(1)
  })

  it('a downward correction reports the kept best badge, not a downgrade', async () => {
    const first = await submitVideoScore({
      userId: fx.userId,
      childId: fx.childId,
      videoId: fx.videoId,
      correctAnswers: 10,
    })
    const corrected = await submitVideoScore({
      userId: fx.userId,
      childId: fx.childId,
      videoId: fx.videoId,
      correctAnswers: 5,
    })

    expect(corrected.isCorrection).toBe(true)
    expect(corrected.isUpgrade).toBe(false)
    // Upgrade-only storage: the response must reflect the stored best tier.
    expect(corrected.finalBadgeCount).toBe(first.finalBadgeCount)
    expect(corrected.previousCorrectAnswers).toBe(10)
  })
})
