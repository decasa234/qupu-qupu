// api/services/fundamentals/progress.ts
//
// Per-child lesson completion. Idempotent on (child, lesson): re-completing a
// lesson keeps the first completed_at and the best check score. Completing a
// draft/unknown lesson is rejected. Returns the refreshed outline so the client
// can update progress + unlock state in one round-trip.

import { pool, queryOne, withTransaction } from '../../db.js'
import { assertChildOwnership } from '../../lib/childOwnership.js'
import { awardFundamentalsReward } from '../gamification/fundamentals.js'
import { assertLessonUnlocked, getOutline, type FundamentalsOutline } from './lessons.js'

export interface MarkCompleteInput {
  childId: string
  lessonSlug: string
  checkCorrect?: number
  checkTotal?: number
}

export async function markComplete(
  parentUserId: string,
  input: MarkCompleteInput,
): Promise<FundamentalsOutline> {
  await assertChildOwnership(pool, parentUserId, input.childId)

  // Enforce linear unlock server-side: rejects a draft/missing lesson
  // ('Lesson not found') and out-of-order completion ('Lesson is locked'),
  // so a member can't self-unlock ahead or grant the reward early.
  await assertLessonUnlocked(input.childId, input.lessonSlug)

  const correct = Math.max(0, Math.trunc(input.checkCorrect ?? 0))
  const total = Math.max(0, Math.trunc(input.checkTotal ?? 0))

  // RETURNING gives the stable progress-row id (same row on re-completion via
  // ON CONFLICT DO UPDATE) — used as the reward's idempotency key.
  const progressRow = await queryOne<{ id: string }>(
    `
    INSERT INTO fundamentals_progress (child_id, lesson_slug, check_correct, check_total)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (child_id, lesson_slug) DO UPDATE SET
      check_correct = GREATEST(fundamentals_progress.check_correct, EXCLUDED.check_correct),
      check_total   = GREATEST(fundamentals_progress.check_total,   EXCLUDED.check_total)
    RETURNING id
    `,
    [input.childId, input.lessonSlug, correct, total],
  )

  // Award a one-time XP/coin grant for the lesson. Best-effort and idempotent
  // (re-completion grants nothing) — progress is already saved, so a reward
  // hiccup must never fail the request.
  if (progressRow) {
    try {
      await withTransaction((client) =>
        awardFundamentalsReward(client, {
          childId: input.childId,
          progressId: progressRow.id,
          lessonSlug: input.lessonSlug,
        }),
      )
    } catch (e) {
      console.error('Fundamentals reward error:', e)
    }
  }

  return getOutline(parentUserId, input.childId)
}
