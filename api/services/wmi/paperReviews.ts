import { query, queryOne } from '../../db.js'
import type { ReviewStatus } from './concepts/reviews.js'
import type { WmiChoice } from './papers.js'

export type AdminPaperSummary = {
  id: string
  year: number
  grade: number
  round: 'semifinal' | 'final'
  variant: 'A' | 'B'
  title: string
  question_count: number
  status: ReviewStatus
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
}

// All papers (every grade), each with its review status (default 'pending').
export async function listPapersForAdmin(): Promise<AdminPaperSummary[]> {
  return query<AdminPaperSummary>(
    `SELECT p.id, p.year, p.grade, p.round, p.variant, p.title, p.question_count,
            COALESCE(r.status, 'pending') AS status
     FROM wmi_papers p
     LEFT JOIN wmi_paper_reviews r ON r.paper_id = p.id
     ORDER BY p.year DESC, p.grade ASC, p.round ASC, p.variant ASC`,
  )
}

export async function listAdminPaperQuestions(paperId: string): Promise<AdminPaperQuestion[]> {
  return query<AdminPaperQuestion>(
    `SELECT id, paper_id, number, body_en, body_id, answer_type, choices_en, choices_id,
            answer, figure_url, hint_en, hint_id, difficulty
     FROM wmi_questions
     WHERE paper_id = $1
     ORDER BY number ASC`,
    [paperId],
  )
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
