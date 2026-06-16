import { query, queryOne } from '../../db.js'
import type { ReviewStatus } from './concepts/reviews.js'
import type { WmiChoice } from './papers.js'
import type { Breakdown } from './concepts/types.js'
import { questionCode } from './paperCode.js'
import { getBrand } from './olympiads/registry.js'

export type AdminPaperSummary = {
  id: string
  year: number
  grade: number
  round: 'semifinal' | 'final'
  variant: 'A' | 'B'
  title: string
  question_count: number
  status: ReviewStatus
  brand: string
  level_code: string
  level_sort: number
  level_label: string
}

export type PaperReview = {
  paper_id: string
  status: ReviewStatus
  notes: string
  reviewed_by: string | null
  updated_at: string
}

// Like the member question DTO but WITH the answer — admins need it to QA.
export type AdminPaperQuestion = {
  id: string
  paper_id: string
  number: number
  body_en: string
  body_id: string
  answer_type: 'multiple_choice' | 'fill_in'
  choices_en: WmiChoice[] | null
  choices_id: WmiChoice[] | null
  answer: string
  figure_url: string | null
  hint_en: string | null
  hint_id: string | null
  difficulty: number | null
  hint_steps_en: string[] | null
  hint_steps_id: string[] | null
  breakdown: Breakdown | null
  visual: { templateId: string; params: unknown } | null
  code?: string
}

// All papers (every grade), each with its review status (default 'pending').
export async function listPapersForAdmin(): Promise<AdminPaperSummary[]> {
  const rows = await query<AdminPaperSummary>(
    `SELECT p.id, p.year, p.grade, p.round, p.variant, p.title, p.question_count,
            p.brand, p.level_code, p.level_sort,
            COALESCE(r.status, 'pending') AS status
     FROM wmi_papers p
     LEFT JOIN wmi_paper_reviews r ON r.paper_id = p.id
     ORDER BY p.brand ASC, p.level_sort ASC, p.year DESC, p.round ASC, p.variant ASC`,
  )
  return rows.map((r) => {
    let level_label = r.level_code
    try {
      level_label = getBrand(r.brand).levels.find((l) => l.key === r.level_code)?.labelId ?? r.level_code
    } catch {
      /* unknown brand: fall back to level_code */
    }
    return { ...r, level_label }
  })
}

export async function listAdminPaperQuestions(paperId: string): Promise<AdminPaperQuestion[]> {
  const rows = await query<AdminPaperQuestion & { year: number; round: 'semifinal' | 'final'; brand: string; level_code: string }>(
    `SELECT q.id, q.paper_id, q.number, q.body_en, q.body_id, q.answer_type, q.choices_en, q.choices_id,
            q.answer, q.figure_url, q.hint_en, q.hint_id, q.difficulty, q.hint_steps_en, q.hint_steps_id, q.breakdown, q.visual,
            p.year, p.round, p.brand, p.level_code
     FROM wmi_questions q
     JOIN wmi_papers p ON p.id = q.paper_id
     WHERE q.paper_id = $1
     ORDER BY q.number ASC`,
    [paperId],
  )
  return rows.map(({ year, round, brand, level_code, ...q }) => ({
    ...q,
    code: questionCode({ brand, year, round, level: level_code }, q.number),
  }))
}

export async function getPaperReview(paperId: string): Promise<PaperReview | null> {
  return queryOne<PaperReview>(
    `SELECT paper_id, status, notes, reviewed_by, updated_at
     FROM wmi_paper_reviews WHERE paper_id = $1`,
    [paperId],
  )
}

export async function upsertPaperReview(
  paperId: string,
  status: ReviewStatus,
  notes: string,
  reviewedBy: string | null,
): Promise<PaperReview> {
  const row = await queryOne<PaperReview>(
    `INSERT INTO wmi_paper_reviews (paper_id, status, notes, reviewed_by, updated_at)
     VALUES ($1, $2, $3, $4, NOW())
     ON CONFLICT (paper_id) DO UPDATE
       SET status = EXCLUDED.status,
           notes = EXCLUDED.notes,
           reviewed_by = EXCLUDED.reviewed_by,
           updated_at = NOW()
     RETURNING paper_id, status, notes, reviewed_by, updated_at`,
    [paperId, status, notes, reviewedBy],
  )
  return row as PaperReview
}
