// api/services/wmi/concepts/progress.ts
//
// Per-child progress across every enabled concept, for the Latihan course
// catalog and the learning report. A concept is "mastered" (cleared) once the
// child has answered MASTERY_TARGET of its questions correctly; "in_progress"
// once attempted; "not_started" otherwise. Progress is correct/MASTERY_TARGET.

import { pool, query } from '../../../db.js'
import { assertChildOwnership } from '../../../lib/childOwnership.js'
import { ensureBootstrapped } from './bootstrap.js'

// Correct answers needed before a concept counts as "cleared". Tunable.
export const MASTERY_TARGET = 5

export type ConceptStatus = 'mastered' | 'in_progress' | 'not_started'

export interface ConceptProgress {
  slug: string
  nameEn: string
  nameId: string
  descriptionId: string | null
  grades: number[]
  attempts: number
  correct: number
  status: ConceptStatus
  progress: number // 0..1, correct / MASTERY_TARGET capped at 1
  lastAttemptAt: string | null
}

export interface ConceptProgressSummary {
  masteryTarget: number
  totalConcepts: number
  mastered: number
  inProgress: number
  notStarted: number
  totalCorrect: number
  totalAttempts: number
  overallProgress: number // mastered / totalConcepts, 0..1
  concepts: ConceptProgress[]
}

interface ProgressRow {
  slug: string
  name_en: string
  name_id: string
  description_id: string | null
  grades: number[]
  attempts: string
  correct: string
  last_attempt_at: string | null
}

export async function getConceptProgress(
  parentUserId: string,
  childId: string,
): Promise<ConceptProgressSummary> {
  await ensureBootstrapped()
  // Ownership check shares the pool (no transaction needed for a read).
  const client = await pool.connect()
  try {
    await assertChildOwnership(client, parentUserId, childId)
  } finally {
    client.release()
  }

  const rows = await query<ProgressRow>(
    `
    SELECT c.slug, c.name_en, c.name_id, c.description_id, c.grades,
           COALESCE(s.attempts, 0)        AS attempts,
           COALESCE(s.correct, 0)         AS correct,
           s.last_attempt_at
    FROM wmi_concepts c
    LEFT JOIN (
      SELECT i.concept_slug,
             COUNT(*)                                   AS attempts,
             COUNT(*) FILTER (WHERE a.is_correct)       AS correct,
             MAX(a.created_at)                          AS last_attempt_at
      FROM wmi_attempts a
      JOIN wmi_concept_instances i ON i.id = a.concept_instance_id
      WHERE a.child_id = $1 AND a.mode = 'concept'
      GROUP BY i.concept_slug
    ) s ON s.concept_slug = c.slug
    WHERE c.enabled = TRUE
    ORDER BY c.grades[1] NULLS LAST, c.name_id
    `,
    [childId],
  )

  const concepts: ConceptProgress[] = rows.map((r) => {
    const attempts = Number(r.attempts)
    const correct = Number(r.correct)
    const status: ConceptStatus =
      correct >= MASTERY_TARGET ? 'mastered' : attempts > 0 ? 'in_progress' : 'not_started'
    return {
      slug: r.slug,
      nameEn: r.name_en,
      nameId: r.name_id,
      descriptionId: r.description_id,
      grades: (r.grades ?? []).map(Number),
      attempts,
      correct,
      status,
      progress: Math.min(1, correct / MASTERY_TARGET),
      lastAttemptAt: r.last_attempt_at,
    }
  })

  const mastered = concepts.filter((c) => c.status === 'mastered').length
  const inProgress = concepts.filter((c) => c.status === 'in_progress').length
  const notStarted = concepts.filter((c) => c.status === 'not_started').length

  return {
    masteryTarget: MASTERY_TARGET,
    totalConcepts: concepts.length,
    mastered,
    inProgress,
    notStarted,
    totalCorrect: concepts.reduce((sum, c) => sum + c.correct, 0),
    totalAttempts: concepts.reduce((sum, c) => sum + c.attempts, 0),
    overallProgress: concepts.length ? mastered / concepts.length : 0,
    concepts,
  }
}
