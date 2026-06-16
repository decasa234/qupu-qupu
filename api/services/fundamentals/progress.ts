// api/services/fundamentals/progress.ts
//
// Per-child lesson completion. Idempotent on (child, lesson): re-completing a
// lesson keeps the first completed_at and the best check score. Completing a
// draft/unknown lesson is rejected. Returns the refreshed outline so the client
// can update progress + unlock state in one round-trip.

import { pool, query, queryOne } from '../../db.js'
import { assertChildOwnership } from '../../lib/childOwnership.js'
import { getOutline, type FundamentalsOutline } from './lessons.js'

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

  const lesson = await queryOne<{ slug: string }>(
    `
    SELECT l.slug
    FROM fundamentals_lessons l
    JOIN fundamentals_modules m ON m.slug = l.module_slug
    WHERE l.slug = $1 AND l.status = 'published' AND m.status = 'published'
    `,
    [input.lessonSlug],
  )
  if (!lesson) throw new Error('Lesson not found')

  const correct = Math.max(0, Math.trunc(input.checkCorrect ?? 0))
  const total = Math.max(0, Math.trunc(input.checkTotal ?? 0))

  await query(
    `
    INSERT INTO fundamentals_progress (child_id, lesson_slug, check_correct, check_total)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (child_id, lesson_slug) DO UPDATE SET
      check_correct = GREATEST(fundamentals_progress.check_correct, EXCLUDED.check_correct),
      check_total   = GREATEST(fundamentals_progress.check_total,   EXCLUDED.check_total)
    `,
    [input.childId, input.lessonSlug, correct, total],
  )

  return getOutline(parentUserId, input.childId)
}
