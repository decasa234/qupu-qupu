// api/services/gamification/concept.ts
//
// Reward grant for the WMI "konsep" concept drill. Unlike the video quiz
// (a one-shot completion handled by the full orchestrator in index.ts),
// konsep is an endless stream of auto-generated questions, so this is a
// small flat per-answer grant that composes the same primitives the
// orchestrator uses: ensureProfile → updateStreakForActivity → appendLedger
// → updateProfileWithDelta. All child_id-keyed, all inside the caller's
// transaction.
//
// Rules (product decisions):
//   - Answering ANY konsep question counts as activity for the day, so the
//     daily streak advances on correct AND wrong answers (showing up counts).
//   - XP + coins are granted ONLY on a correct answer.
//   - NO daily cap. konsep questions are infinite, so this is intentionally
//     farmable — accepted trade-off. Idempotency on the (child, reward_type,
//     source_type, concept_instance_id) natural key still prevents a retried
//     submission of the SAME question from double-granting.

import type { PoolClient } from 'pg'
import { wibDateString } from '../../lib/wib.js'
import { appendLedger } from './ledger.js'
import { ensureProfile, updateProfileWithDelta } from './profileUpdater.js'
import { updateStreakForActivity } from './streakUpdater.js'

// Flat per-correct-answer grant. Deliberately much smaller than a video quiz
// completion (25 XP + 5 coins, one-time) since konsep is unbounded.
// Exported: the batched session commit (wmi/concepts/session.ts) writes the
// same per-instance ledger rows in one multi-VALUES insert — amounts and
// idempotency keys MUST stay in lockstep with awardConceptReward.
export const CONCEPT_CORRECT_XP = 5
export const CONCEPT_CORRECT_COINS = 1

export interface ConceptRewardResult {
  xpEarned: number
  coinsEarned: number
  totalXp: number
  coinBalance: number
  level: number
  tierName: string
  levelUp: { previousLevel: number; currentLevel: number; tierName: string } | null
  streak: { current: number; longest: number }
}

export async function awardConceptReward(
  client: PoolClient,
  input: { childId: string; conceptInstanceId: string; isCorrect: boolean },
): Promise<ConceptRewardResult> {
  const today = wibDateString(new Date())

  await ensureProfile(client, input.childId)

  // Advance the daily streak first — it reads the OLD last_activity_date to
  // compute the day gap, before updateProfileWithDelta stamps today's date.
  // Idempotent within a WIB day (gap === 0 is a no-op on the counter).
  const streak = await updateStreakForActivity(client, input.childId, today)

  let xpDelta = 0
  let coinDelta = 0
  if (input.isCorrect) {
    const led = await appendLedger(client, {
      childId: input.childId,
      rewardType: 'CONCEPT_COMPLETION_XP',
      sourceType: 'concept_attempt',
      sourceId: input.conceptInstanceId,
      xpDelta: CONCEPT_CORRECT_XP,
      coinDelta: CONCEPT_CORRECT_COINS,
    })
    if (led.appended) {
      xpDelta = led.xpDelta
      coinDelta = led.coinDelta
    }
  }

  // Always run the profile delta — even at 0/0 it stamps last_activity_date =
  // today (so tomorrow's streak gap is correct) and returns the canonical
  // balances/level for the top stat strip.
  const profile = await updateProfileWithDelta(client, {
    childId: input.childId,
    xpDelta,
    coinDelta,
    activityDate: today,
  })

  return {
    xpEarned: xpDelta,
    coinsEarned: coinDelta,
    totalXp: profile.after.totalXp,
    coinBalance: profile.after.coinBalance,
    level: profile.after.currentLevel,
    tierName: profile.after.currentTierName,
    levelUp: profile.levelUp
      ? {
          previousLevel: profile.levelUp.previousLevel,
          currentLevel: profile.levelUp.currentLevel,
          tierName: profile.levelUp.tier.tierName,
        }
      : null,
    streak: { current: streak.currentStreakDays, longest: streak.longestStreakDays },
  }
}
