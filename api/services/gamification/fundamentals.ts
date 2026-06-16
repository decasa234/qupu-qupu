// api/services/gamification/fundamentals.ts
//
// One-time reward for completing a Fundamentals lesson. Mirrors the konsep
// grant (awardConceptReward) but, because lessons are FINITE (not farmable),
// uses a larger one-time grant keyed on the lesson slug — so re-completing a
// lesson never grants XP twice (appendLedger idempotency on
// (child, reward_type, source_type, source_id)).

import type { PoolClient } from 'pg'
import { wibDateString } from '../../lib/wib.js'
import { appendLedger } from './ledger.js'
import { ensureProfile, updateProfileWithDelta } from './profileUpdater.js'
import { updateStreakForActivity } from './streakUpdater.js'

const LESSON_XP = 15
const LESSON_COINS = 3

export interface FundamentalsRewardResult {
  xpEarned: number
  coinsEarned: number
  totalXp: number
  coinBalance: number
  level: number
}

export async function awardFundamentalsReward(
  client: PoolClient,
  input: { childId: string; progressId: string; lessonSlug: string },
): Promise<FundamentalsRewardResult> {
  const today = wibDateString(new Date())

  await ensureProfile(client, input.childId)
  // Completing a lesson counts as activity for the day's streak.
  await updateStreakForActivity(client, input.childId, today)

  // reward_ledger.source_id is UUID; the lesson's progress-row id is the stable,
  // one-per-(child, lesson) key (lesson slugs are TEXT, so they can't be used).
  const led = await appendLedger(client, {
    childId: input.childId,
    rewardType: 'FUNDAMENTALS_LESSON_XP',
    sourceType: 'fundamentals_lesson',
    sourceId: input.progressId,
    xpDelta: LESSON_XP,
    coinDelta: LESSON_COINS,
    metadata: { lessonSlug: input.lessonSlug },
  })

  // appended === false on a re-completion → 0/0 delta, but we still stamp
  // today's activity date so the streak gap stays correct.
  const profile = await updateProfileWithDelta(client, {
    childId: input.childId,
    xpDelta: led.appended ? led.xpDelta : 0,
    coinDelta: led.appended ? led.coinDelta : 0,
    activityDate: today,
  })

  return {
    xpEarned: led.appended ? led.xpDelta : 0,
    coinsEarned: led.appended ? led.coinDelta : 0,
    totalXp: profile.after.totalXp,
    coinBalance: profile.after.coinBalance,
    level: profile.after.currentLevel,
  }
}
