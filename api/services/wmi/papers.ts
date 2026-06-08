import { query, queryOne, withTransaction, type DbExecutor } from '../../db.js'
import { assertChildOwnership } from '../../lib/childOwnership.js'
import { questionCode } from './paperCode.js'
import type { Breakdown } from './concepts/types.js'

export interface WmiChoice {
  label: string
  text: string
}

export interface WmiQuestionDto {
  id: string
  paper_id: string
  number: number
  body_en: string
  body_id: string
  answer_type: 'multiple_choice' | 'fill_in'
  choices_en: WmiChoice[] | null
  choices_id: WmiChoice[] | null
  figure_url: string | null
  hint_en: string | null
  hint_id: string | null
  difficulty: number | null
  hint_steps_en: string[] | null
  hint_steps_id: string[] | null
  breakdown: Breakdown | null
  code?: string
}

export interface WmiPaperRow {
  id: string
  year: number
  grade: number
  round: 'semifinal' | 'final'
  variant: 'A' | 'B'
  title: string
  source_url: string | null
  recommended_duration_min: number
  question_count: number
}

function normalizeQuestion(row: WmiQuestionDto): WmiQuestionDto {
  return {
    ...row,
    choices_en: row.choices_en ?? null,
    choices_id: row.choices_id ?? null,
  }
}

export async function listWmiPapers(
  parentUserId: string,
  childId: string,
  grade: number,
) {
  return withTransaction(async (client) => {
    await assertChildOwnership(client, parentUserId, childId)
    return query<WmiPaperRow & { best_score: string | null }>(
      `
        SELECT p.id, p.year, p.grade, p.round, p.variant, p.title, p.source_url,
               p.recommended_duration_min, p.question_count,
               MAX(
                 CASE
                   WHEN s.completed_at IS NOT NULL AND s.total_questions > 0
                   THEN (s.correct_count::numeric / s.total_questions::numeric) * 100
                   ELSE NULL
                 END
               )::text AS best_score
        FROM wmi_papers p
        LEFT JOIN wmi_exam_sessions s ON s.paper_id = p.id AND s.child_id = $1
        WHERE p.grade = $2
        GROUP BY p.id
        ORDER BY p.year DESC, p.round ASC, p.variant ASC
      `,
      [childId, grade],
      client,
    )
  })
}

export async function getWmiPaperDetail(
  parentUserId: string,
  childId: string,
  paperId: string,
) {
  return withTransaction(async (client) => {
    await assertChildOwnership(client, parentUserId, childId)
    const paper = await queryOne<WmiPaperRow>(
      `
        SELECT id, year, grade, round, variant, title, source_url, recommended_duration_min, question_count
        FROM wmi_papers
        WHERE id = $1
      `,
      [paperId],
      client,
    )
    if (!paper) throw new Error('Paper not found')

    const questions = await listWmiQuestionsForPaper(paper.id, client)
    return { ...paper, questions }
  })
}

export async function listWmiQuestionsForPaper(
  paperId: string,
  executor?: DbExecutor,
): Promise<WmiQuestionDto[]> {
  const rows = await query<WmiQuestionDto & { year: number; round: 'semifinal' | 'final'; grade: number; variant: 'A' | 'B' }>(
    `
      SELECT q.id, q.paper_id, q.number, q.body_en, q.body_id, q.answer_type, q.choices_en, q.choices_id,
             q.figure_url, q.hint_en, q.hint_id, q.difficulty, q.hint_steps_en, q.hint_steps_id, q.breakdown,
             p.year, p.round, p.grade, p.variant
      FROM wmi_questions q
      JOIN wmi_papers p ON p.id = q.paper_id
      WHERE q.paper_id = $1
      ORDER BY q.number ASC
    `,
    [paperId],
    executor,
  )
  return rows.map(({ year, round, grade, variant, ...q }) => ({
    ...normalizeQuestion(q),
    code: questionCode({ year, round, grade, variant }, q.number),
  }))
}

export async function getWmiDrillQuestion(
  parentUserId: string,
  childId: string,
  grade: number,
) {
  return withTransaction(async (client) => {
    await assertChildOwnership(client, parentUserId, childId)

    let question = await queryOne<WmiQuestionDto & { year: number; round: 'semifinal' | 'final'; grade: number; variant: 'A' | 'B' }>(
      `
        WITH recent AS (
          SELECT question_id
          FROM wmi_attempts
          WHERE child_id = $1 AND mode = 'drill'
          ORDER BY created_at DESC
          LIMIT 20
        )
        SELECT q.id, q.paper_id, q.number, q.body_en, q.body_id, q.answer_type,
               q.choices_en, q.choices_id, q.figure_url, q.hint_en, q.hint_id, q.difficulty, q.hint_steps_en, q.hint_steps_id, q.breakdown,
               p.year, p.round, p.grade, p.variant
        FROM wmi_questions q
        JOIN wmi_papers p ON p.id = q.paper_id
        WHERE p.grade = $2
          AND q.id NOT IN (SELECT question_id FROM recent)
        ORDER BY random()
        LIMIT 1
      `,
      [childId, grade],
      client,
    )

    if (!question) {
      question = await queryOne<WmiQuestionDto & { year: number; round: 'semifinal' | 'final'; grade: number; variant: 'A' | 'B' }>(
        `
          SELECT q.id, q.paper_id, q.number, q.body_en, q.body_id, q.answer_type,
                 q.choices_en, q.choices_id, q.figure_url, q.hint_en, q.hint_id, q.difficulty, q.hint_steps_en, q.hint_steps_id, q.breakdown,
                 p.year, p.round, p.grade, p.variant
          FROM wmi_questions q
          JOIN wmi_papers p ON p.id = q.paper_id
          WHERE p.grade = $1
          ORDER BY random()
          LIMIT 1
        `,
        [grade],
        client,
      )
    }

    if (!question) throw new Error('No WMI questions found for this grade')
    const { year, round, grade: g, variant, ...q } = question
    return { ...normalizeQuestion(q), code: questionCode({ year, round, grade: g, variant }, q.number) }
  })
}

export async function getWmiQuestionAnswer(
  questionId: string,
  executor?: DbExecutor,
): Promise<{ answer: string; hint_en: string | null; hint_id: string | null } | null> {
  return queryOne<{ answer: string; hint_en: string | null; hint_id: string | null }>(
    'SELECT answer, hint_en, hint_id FROM wmi_questions WHERE id = $1',
    [questionId],
    executor,
  )
}
