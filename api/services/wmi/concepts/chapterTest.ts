import type { PoolClient } from 'pg'
import { pool, query, withTransaction } from '../../../db.js'
import { assertChildOwnership } from '../../../lib/childOwnership.js'
import { isCorrectAnswer } from '../answerMatch.js'

const TEST_SIZE = 6
const PASS_PCT = 70
const SEED_TIER = 2          // Berlatih head-start on pass
const SEED_PCT = 35

export interface ChapterTestQuestion {
  concept_instance_id: string
  concept_slug: string
  body_id: string
  body_en: string
  answer_type: 'multiple_choice' | 'fill_in'
  choices_id: unknown
  choices_en: unknown
}

export async function startChapterTest(
  parentUserId: string, childId: string, subjectKey: string,
): Promise<{ questions: ChapterTestQuestion[] }> {
  const client = await pool.connect()
  try { await assertChildOwnership(client, parentUserId, childId) } finally { client.release() }
  const questions = await query<ChapterTestQuestion>(
    `SELECT DISTINCT ON (i.concept_slug)
            i.id AS concept_instance_id, i.concept_slug, i.body_id, i.body_en,
            i.answer_type, i.choices_id, i.choices_en
     FROM wmi_concept_instances i
     JOIN wmi_concepts c ON c.slug = i.concept_slug
     WHERE c.subject_key = $1 AND c.enabled = TRUE AND i.is_culled = FALSE
     ORDER BY i.concept_slug, random()
     LIMIT 100`,
    [subjectKey],
  )
  const shuffled = questions.sort(() => Math.random() - 0.5).slice(0, TEST_SIZE)
  return { questions: shuffled }
}

export async function submitChapterTest(
  parentUserId: string, childId: string, subjectKey: string,
  answers: { concept_instance_id: string; selected_answer: string }[],
): Promise<{ passed: boolean; score_pct: number; correct: number; total: number }> {
  return withTransaction(async (client: PoolClient) => {
    await assertChildOwnership(client, parentUserId, childId)
    if (answers.length === 0) throw new Error('No answers submitted')

    // Eligible concepts for this chapter — the server decides the denominator,
    // so a client cannot inflate the score by submitting fewer answers.
    const eligible = await client.query<{ slug: string }>(
      `SELECT slug FROM wmi_concepts
       WHERE subject_key = $1 AND enabled = TRUE`,
      [subjectKey],
    )
    const eligibleSlugs = new Set(eligible.rows.map((r) => r.slug))
    const expectedCount = Math.min(TEST_SIZE, eligibleSlugs.size)
    if (expectedCount === 0) throw new Error('No concepts available for this chapter')

    // Pull canonical answers + concept_slug for the submitted instances.
    const ids = answers.map((a) => a.concept_instance_id)
    const rows = await client.query<{ id: string; answer: string; concept_slug: string }>(
      'SELECT id, answer, concept_slug FROM wmi_concept_instances WHERE id = ANY($1::uuid[])',
      [ids],
    )
    const metaById = new Map(rows.rows.map((r) => [r.id, r]))

    // Credit at most one correct answer per ELIGIBLE concept (ignore off-subject
    // instances and duplicate submissions of the same concept).
    const creditedConcepts = new Set<string>()
    for (const a of answers) {
      const meta = metaById.get(a.concept_instance_id)
      if (!meta) continue
      if (!eligibleSlugs.has(meta.concept_slug)) continue
      if (creditedConcepts.has(meta.concept_slug)) continue
      if (isCorrectAnswer(meta.answer, a.selected_answer)) creditedConcepts.add(meta.concept_slug)
    }

    const correct = creditedConcepts.size
    const total = expectedCount
    const scorePct = Math.round((correct / total) * 100)
    const passed = scorePct >= PASS_PCT

    await client.query(
      `INSERT INTO wmi_chapter_tests (child_id, subject_key, score_pct, passed)
       VALUES ($1,$2,$3,$4)`,
      [childId, subjectKey, scorePct, passed],
    )

    if (passed) {
      await client.query(
        `INSERT INTO wmi_concept_progress (child_id, concept_slug, best_tier, comprehension_pct, updated_at)
         SELECT $1, c.slug, $3, $4, NOW() FROM wmi_concepts c
         WHERE c.subject_key = $2 AND c.enabled = TRUE
         ON CONFLICT (child_id, concept_slug) DO UPDATE SET
           best_tier = GREATEST(wmi_concept_progress.best_tier, EXCLUDED.best_tier),
           comprehension_pct = GREATEST(wmi_concept_progress.comprehension_pct, EXCLUDED.comprehension_pct),
           updated_at = NOW()`,
        [childId, subjectKey, SEED_TIER, SEED_PCT],
      )
    }
    return { passed, score_pct: scorePct, correct, total }
  })
}
