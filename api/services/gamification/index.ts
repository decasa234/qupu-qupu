// api/services/gamification/index.ts
//
// Gamification orchestrator. Called from `submitVideoScore` INSIDE the
// same withTransaction block (decision E1 from the eng review).
//
// Plan 1 scope: handle quiz completion + score improvement events, append
// XP to the reward ledger, and update the cached profile. Quest and
// achievement evaluators ship in Plans 2 and 3.
//
// XP values (Plan 1, hard-coded — Plan 6 admin tuning will move these to
// quest/achievement template tables):
//   - QUIZ_COMPLETION_XP    : 25 per first-time submission
//   - SCORE_IMPROVED_XP     : 10 when a correction beats prior best
//   - HIGH_SCORE_XP         : 15 when score >= 80% (first-time only)
//   - PERFECT_SCORE_XP      : 25 when score == 100% (first-time only)
//
// Idempotency: every ledger and event row carries a UNIQUE key on the
// score_attempt id, so HTTP retries can't double-grant.

import type { PoolClient } from 'pg'
import { emitEvent } from './events.js'
import { appendLedger } from './ledger.js'
import { updateProfileWithDelta, type ProfileSnapshot } from './profileUpdater.js'
import type { LevelTier } from './levelCurve.js'

export interface ProcessScoreInput {
  childId: string
  scoreAttemptId: string
  videoId: string
  correctAnswers: number
  totalQuestions: number
  scorePercentage: number     // 0-100, rounded by caller
  isCorrection: boolean        // member.ts already computes this
  previousCorrectAnswers: number | null
}

export interface RewardLedgerEntry {
  rewardType: string
  xpDelta: number
}

export interface ProcessScoreResult {
  xpEarned: number
  ledgerEntries: RewardLedgerEntry[]
  profile: ProfileSnapshot
  levelUp: { previousLevel: number; currentLevel: number; tier: LevelTier } | null
}

// XP constants (subject to tuning when Plan 6 admin lands)
const XP_QUIZ_COMPLETION = 25
const XP_SCORE_IMPROVED = 10
const XP_HIGH_SCORE = 15
const XP_PERFECT_SCORE = 25
const HIGH_SCORE_THRESHOLD = 80

function wibDateString(now: Date): string {
  // Plan 0 locked WIB everywhere. event_date and last_activity_date are
  // DATE columns; we emit the WIB calendar day as YYYY-MM-DD.
  const HOUR_MS = 60 * 60 * 1000
  const wibShifted = new Date(now.getTime() + 7 * HOUR_MS)
  const year = wibShifted.getUTCFullYear()
  const month = String(wibShifted.getUTCMonth() + 1).padStart(2, '0')
  const day = String(wibShifted.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export async function processScoreSubmission(
  client: PoolClient,
  input: ProcessScoreInput,
): Promise<ProcessScoreResult> {
  const eventDate = wibDateString(new Date())
  const ledgerEntries: RewardLedgerEntry[] = []
  let totalDelta = 0

  // QUIZ_SCORE_SUBMITTED is always emitted (idempotent on score_attempt id);
  // serves as the audit anchor even when no XP is granted (e.g., correction).
  await emitEvent(client, {
    childId: input.childId,
    eventType: 'QUIZ_SCORE_SUBMITTED',
    sourceType: 'score_attempt',
    sourceId: input.scoreAttemptId,
    eventDate,
    metadata: {
      videoId: input.videoId,
      correctAnswers: input.correctAnswers,
      totalQuestions: input.totalQuestions,
      scorePercentage: input.scorePercentage,
      isCorrection: input.isCorrection,
    },
  })

  // First-time completion: completion XP + threshold rewards.
  // Decision D2 (CEO review): corrections never re-grant completion XP.
  if (!input.isCorrection) {
    await emitEvent(client, {
      childId: input.childId,
      eventType: 'VIDEO_FIRST_COMPLETED',
      sourceType: 'score_attempt',
      sourceId: input.scoreAttemptId,
      eventDate,
      metadata: { videoId: input.videoId },
    })

    const completion = await appendLedger(client, {
      childId: input.childId,
      rewardType: 'QUIZ_COMPLETION_XP',
      sourceType: 'score_attempt',
      sourceId: input.scoreAttemptId,
      xpDelta: XP_QUIZ_COMPLETION,
      metadata: { videoId: input.videoId },
    })
    if (completion.appended) {
      totalDelta += completion.xpDelta
      ledgerEntries.push({ rewardType: 'QUIZ_COMPLETION_XP', xpDelta: completion.xpDelta })
    }

    if (input.scorePercentage === 100) {
      await emitEvent(client, {
        childId: input.childId,
        eventType: 'PERFECT_SCORE_REACHED',
        sourceType: 'score_attempt',
        sourceId: input.scoreAttemptId,
        eventDate,
      })
      const perfect = await appendLedger(client, {
        childId: input.childId,
        rewardType: 'PERFECT_SCORE_XP',
        sourceType: 'score_attempt',
        sourceId: input.scoreAttemptId,
        xpDelta: XP_PERFECT_SCORE,
      })
      if (perfect.appended) {
        totalDelta += perfect.xpDelta
        ledgerEntries.push({ rewardType: 'PERFECT_SCORE_XP', xpDelta: perfect.xpDelta })
      }
    } else if (input.scorePercentage >= HIGH_SCORE_THRESHOLD) {
      await emitEvent(client, {
        childId: input.childId,
        eventType: 'HIGH_SCORE_REACHED',
        sourceType: 'score_attempt',
        sourceId: input.scoreAttemptId,
        eventDate,
      })
      const high = await appendLedger(client, {
        childId: input.childId,
        rewardType: 'HIGH_SCORE_XP',
        sourceType: 'score_attempt',
        sourceId: input.scoreAttemptId,
        xpDelta: XP_HIGH_SCORE,
      })
      if (high.appended) {
        totalDelta += high.xpDelta
        ledgerEntries.push({ rewardType: 'HIGH_SCORE_XP', xpDelta: high.xpDelta })
      }
    }
  } else {
    // Correction path: only IMPROVED rewards if new best.
    // Decision D2: SCORE_IMPROVED fires iff new correct > previous best.
    const prior = input.previousCorrectAnswers ?? -1
    if (input.correctAnswers > prior) {
      await emitEvent(client, {
        childId: input.childId,
        eventType: 'SCORE_IMPROVED',
        sourceType: 'score_attempt',
        sourceId: input.scoreAttemptId,
        eventDate,
        metadata: {
          videoId: input.videoId,
          previous: prior,
          current: input.correctAnswers,
        },
      })
      const improved = await appendLedger(client, {
        childId: input.childId,
        rewardType: 'SCORE_IMPROVED_XP',
        sourceType: 'score_attempt',
        sourceId: input.scoreAttemptId,
        xpDelta: XP_SCORE_IMPROVED,
        metadata: { previous: prior, current: input.correctAnswers },
      })
      if (improved.appended) {
        totalDelta += improved.xpDelta
        ledgerEntries.push({ rewardType: 'SCORE_IMPROVED_XP', xpDelta: improved.xpDelta })
      }
    }
    // Corrections that LOWER or match the prior best earn no XP and
    // fire no event. The unlock row is still updated by member.ts.
  }

  // Profile update is atomic via UPDATE ... SET total_xp = total_xp + $1
  // (eng review decision F1). Single transaction with the score itself.
  const profileResult = await updateProfileWithDelta(client, {
    childId: input.childId,
    xpDelta: totalDelta,
    activityDate: eventDate,
  })

  return {
    xpEarned: totalDelta,
    ledgerEntries,
    profile: profileResult.after,
    levelUp: profileResult.levelUp,
  }
}
