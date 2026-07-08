// WMI Claire mock exams — isolated, niche feature (gated to Claire's account).
//
// Assembles a fresh mock final from real WMI Final/Semifinal Grade-2 questions:
// 15 Paper-A (multiple_choice) + 10 Paper-B (fill_in). Questions are chosen
// round-robin per child (least-used first, random tiebreak) so the kid works a
// new set each time and only repeats once the pool is exhausted. Fully isolated
// — no wmi_attempts / progress / gamification writes; the only persistence is
// claire_mock_exams (+ the per-question use ledger).
//
// Questions are served with the SAME shape as a real paper (WmiQuestionDto,
// including the bespoke-illustration `code`, `visual`, `breakdown`) minus the
// answer, so WmiQuestionView renders them identically (figures included).
//
// Phase 2 will add generated "variant" questions to the wmi_questions pool and
// point this engine at them — no engine change needed.

import { pool, query, queryOne, withTransaction } from '../../db.js'
import { assertChildOwnership } from '../../lib/childOwnership.js'
import { isCorrectAnswer } from './answerMatch.js'
import { getWmiQuestionAnswer, type WmiChoice, type WmiQuestionDto } from './papers.js'
import { questionCode } from './paperCode.js'
import type { Breakdown } from './concepts/types.js'

export type MockRound = 'final' | 'semifinal'
export const MOCK_ROUNDS: MockRound[] = ['final', 'semifinal']

const MOCK_GRADE = 2
// Real WMI G2 paper shapes differ by round: the Final is 15 Paper-A
// (multiple_choice) + 10 Paper-B (fill_in); the Semifinal is 25 multiple_choice
// with no fill_in. Mirror that so a mock matches the round it simulates.
const ROUND_SHAPE: Record<MockRound, { paperA: number; paperB: number }> = {
  final: { paperA: 15, paperB: 10 },
  semifinal: { paperA: 25, paperB: 0 },
}

// A served mock question is the paper DTO (answer withheld) plus its slot index
// and A/B part.
export type MockQuestion = WmiQuestionDto & { index: number; part: 'A' | 'B' }

export interface MockAnswerResult {
  is_correct: boolean
  correct_answer: string
  hint_en: string | null
  hint_id: string | null
  done: boolean
  score: number | null
}

export interface MockExamSummary {
  id: string
  round: string
  score: number | null
  total: number
  created_at: string
  completed_at: string | null
}

// Raw row: the full DTO columns plus paper metadata needed to build `code`.
type QuestionRow = WmiQuestionDto & {
  year: number
  round: string
  grade: number
  variant: string
  brand: string
  level_code: string
}

// Same column list as listWmiQuestionsForPaper — keep in sync so codes/visuals match.
const QUESTION_COLUMNS = `
  q.id, q.paper_id, q.number, q.body_en, q.body_id, q.answer_type, q.choices_en, q.choices_id,
  q.figure_url, q.hint_en, q.hint_id, q.difficulty, q.hint_steps_en, q.hint_steps_id, q.breakdown, q.visual,
  p.year, p.round, p.grade, p.variant, p.brand, p.level_code`

function toDto(row: QuestionRow): WmiQuestionDto {
  const { year, round, grade, variant, brand, level_code, ...q } = row
  void grade
  void variant
  return {
    ...q,
    choices_en: q.choices_en ?? null,
    choices_id: q.choices_id ?? null,
    code: questionCode({ brand, year, round, level: level_code }, q.number),
  }
}

function toMockQuestion(row: QuestionRow, index: number): MockQuestion {
  return {
    ...toDto(row),
    index,
    part: row.answer_type === 'multiple_choice' ? 'A' : 'B',
  }
}

// Picture-option questions store placeholder choice text because their real A–E
// options are figures rendered by a per-code CHOICE_RENDERERS component on the
// client. For ~10 G2 questions those option figures were never built (originals
// lost), so the choices show as indistinguishable placeholders and the question
// is unpickable. The placeholder text comes in several forms across the seed:
// "(A)" / "A", but also "Option A" / "Gambar A" / "Pilihan A". Match all of them
// (case-insensitive, optional picture-ref prefix) and exclude any MC whose every
// choice is such a placeholder, so every served question is answerable.
// ponytail: this also drops the ~2 picture-option questions that DO render
// (their choices are placeholders too); acceptable — the pool has 100+ MC to
// spare. Upgrade path if we want them back: thread the renderable-code allow-list
// from the frontend registry into this filter.
const PLAYABLE_MC = `NOT (
  q.answer_type = 'multiple_choice'
  AND q.choices_id IS NOT NULL
  AND jsonb_array_length(q.choices_id) > 0
  AND NOT EXISTS (
    SELECT 1 FROM jsonb_array_elements(q.choices_id) e
    WHERE btrim(e->>'text') !~* '^(option|gambar|pilihan|pilih|choice)?\\s*\\(?[A-E]\\)?$'
  )
)`

// Round-robin pick: least-used questions of one answer_type for this child.
async function pickLeastUsed(
  client: import('pg').PoolClient,
  childId: string,
  round: MockRound,
  answerType: 'multiple_choice' | 'fill_in',
  limit: number,
): Promise<QuestionRow[]> {
  return query<QuestionRow>(
    `SELECT ${QUESTION_COLUMNS}
       FROM wmi_questions q
       JOIN wmi_papers p ON p.id = q.paper_id
       LEFT JOIN claire_mock_question_uses u
         ON u.child_id = $1 AND u.question_id = q.id
      WHERE lower(p.brand) = 'wmi' AND p.round = $2 AND p.grade = $3
        AND q.answer_type = $4
        AND ${PLAYABLE_MC}
      ORDER BY COALESCE(u.uses, 0) ASC, random()
      LIMIT $5`,
    [childId, round, MOCK_GRADE, answerType, limit],
    client,
  )
}

export async function startMockExam(
  parentUserId: string,
  childId: string,
  round: MockRound,
): Promise<{ examId: string; round: MockRound; questions: MockQuestion[] }> {
  return withTransaction(async (client) => {
    await assertChildOwnership(client, parentUserId, childId)

    const shape = ROUND_SHAPE[round]
    const paperA = shape.paperA
      ? await pickLeastUsed(client, childId, round, 'multiple_choice', shape.paperA)
      : []
    const paperB = shape.paperB
      ? await pickLeastUsed(client, childId, round, 'fill_in', shape.paperB)
      : []
    const rows = [...paperA, ...paperB]
    if (rows.length === 0) {
      throw new Error('Belum ada soal untuk mode ini.')
    }

    const ids = rows.map((r) => r.id)
    // Bump the round-robin ledger for every served question.
    await client.query(
      `INSERT INTO claire_mock_question_uses (child_id, question_id, uses, last_used_at)
       SELECT $1, x, 1, NOW() FROM unnest($2::uuid[]) AS x
       ON CONFLICT (child_id, question_id)
       DO UPDATE SET uses = claire_mock_question_uses.uses + 1, last_used_at = NOW()`,
      [childId, ids],
    )

    const inserted = await queryOne<{ id: string }>(
      `INSERT INTO claire_mock_exams (child_id, round, question_ids, total)
       VALUES ($1, $2, $3::jsonb, $4)
       RETURNING id`,
      [childId, round, JSON.stringify(ids), rows.length],
      client,
    )
    if (!inserted) throw new Error('Gagal memulai mock exam.')

    return {
      examId: inserted.id,
      round,
      questions: rows.map((r, i) => toMockQuestion(r, i)),
    }
  })
}

interface ExamRow {
  child_id: string
  question_ids: string[]
  responses: Record<string, { selected: string; is_correct: boolean }>
}

export async function answerMockExam(
  parentUserId: string,
  childId: string,
  examId: string,
  index: number,
  selected: string,
): Promise<MockAnswerResult> {
  return withTransaction(async (client) => {
    await assertChildOwnership(client, parentUserId, childId)

    const exam = await queryOne<ExamRow>(
      `SELECT child_id, question_ids, responses
         FROM claire_mock_exams WHERE id = $1 FOR UPDATE`,
      [examId],
      client,
    )
    if (!exam || exam.child_id !== childId) throw new Error('Mock exam tidak ditemukan.')
    if (index < 0 || index >= exam.question_ids.length) throw new Error('Soal tidak valid.')

    const q = await getWmiQuestionAnswer(exam.question_ids[index], client)
    if (!q) throw new Error('Soal tidak ditemukan.')

    const is_correct = isCorrectAnswer(q.answer, selected)
    const responses = { ...(exam.responses ?? {}) }
    responses[String(index)] = { selected, is_correct }
    const allDone = Object.keys(responses).length >= exam.question_ids.length
    const score = allDone ? Object.values(responses).filter((r) => r.is_correct).length : null

    await client.query(
      `UPDATE claire_mock_exams
          SET responses = $2::jsonb,
              score = $3::int,
              completed_at = CASE WHEN $3::int IS NOT NULL THEN COALESCE(completed_at, NOW()) ELSE completed_at END
        WHERE id = $1`,
      [examId, JSON.stringify(responses), score],
    )

    return { is_correct, correct_answer: q.answer, hint_en: q.hint_en, hint_id: q.hint_id, done: allDone, score }
  })
}

export async function getMockHistory(
  parentUserId: string,
  childId: string,
): Promise<MockExamSummary[]> {
  await assertChildOwnership(pool, parentUserId, childId)
  return query<MockExamSummary>(
    `SELECT id, round, score, total, created_at, completed_at
       FROM claire_mock_exams
      WHERE child_id = $1 AND completed_at IS NOT NULL
      ORDER BY completed_at DESC
      LIMIT 30`,
    [childId],
  )
}

export interface MockReviewItem {
  index: number
  part: 'A' | 'B'
  number: number
  code: string
  body_id: string
  body_en: string
  choices_id: WmiChoice[] | null
  breakdown: Breakdown | null
  correct_answer: string
  selected: string | null
  is_correct: boolean | null
}

export interface MockReview {
  id: string
  round: string
  score: number | null
  total: number
  completed_at: string | null
  items: MockReviewItem[]
}

export async function getMockReview(
  parentUserId: string,
  childId: string,
  examId: string,
): Promise<MockReview> {
  await assertChildOwnership(pool, parentUserId, childId)
  const exam = await queryOne<{
    id: string
    child_id: string
    round: string
    question_ids: string[]
    responses: Record<string, { selected: string; is_correct: boolean }>
    score: number | null
    total: number
    completed_at: string | null
  }>(
    `SELECT id, child_id, round, question_ids, responses, score, total, completed_at
       FROM claire_mock_exams WHERE id = $1`,
    [examId],
  )
  if (!exam || exam.child_id !== childId) throw new Error('Mock exam tidak ditemukan.')

  const rows = await query<QuestionRow & { answer: string }>(
    `SELECT ${QUESTION_COLUMNS}, q.answer
       FROM wmi_questions q
       JOIN wmi_papers p ON p.id = q.paper_id
      WHERE q.id = ANY($1::uuid[])`,
    [exam.question_ids],
  )
  const byId = new Map(rows.map((r) => [r.id, r]))

  const items: MockReviewItem[] = exam.question_ids.map((qid, i) => {
    const r = byId.get(qid)
    const resp = (exam.responses ?? {})[String(i)]
    return {
      index: i,
      part: r && r.answer_type === 'multiple_choice' ? 'A' : 'B',
      number: r?.number ?? 0,
      code: r ? (toDto(r).code ?? '') : '',
      body_id: r?.body_id ?? '',
      body_en: r?.body_en ?? '',
      choices_id: r?.choices_id ?? null,
      breakdown: r?.breakdown ?? null,
      correct_answer: r?.answer ?? '',
      selected: resp?.selected ?? null,
      is_correct: resp?.is_correct ?? null,
    }
  })

  return {
    id: exam.id,
    round: exam.round,
    score: exam.score,
    total: exam.total,
    completed_at: exam.completed_at,
    items,
  }
}
