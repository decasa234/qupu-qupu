import api from './api'
import type { WmiChoice, Breakdown } from '../types/wmi'

export type ReviewStatus = 'pending' | 'approved' | 'needs_changes'

export interface AdminConceptSummary {
  slug: string
  short_id: string
  name_en: string
  name_id: string
  description_id: string | null
  grades: number[]
  strand: string
  strand_label: string
  topic: string
  topic_label: string
  difficulty: 1 | 2 | 3 | 4 | 5
  isOlympiad: boolean
  status: ReviewStatus
  priority: 'high' | 'normal'
  wmi_refined: boolean
}

export interface ConceptReview {
  concept_slug: string
  status: ReviewStatus
  notes: string
  reviewed_by: string | null
  updated_at: string | null
}

export interface AdminConceptSample {
  seed: number
  params?: unknown
  body_en?: string
  body_id?: string
  answer_type?: 'multiple_choice' | 'fill_in'
  choices_en?: WmiChoice[] | null
  choices_id?: WmiChoice[] | null
  answer?: string
  hint_en?: string | null
  hint_id?: string | null
  hint_steps_en?: string[] | null
  hint_steps_id?: string[] | null
  breakdown?: Breakdown | null
  error?: string
}

export async function fetchConceptList(): Promise<AdminConceptSummary[]> {
  const { data } = await api.get('/admin/wmi/concepts')
  return data.data.concepts
}

export async function fetchConceptSamples(
  slug: string,
  count = 8,
  seed?: number,
): Promise<{ baseSeed: number; samples: AdminConceptSample[] }> {
  const { data } = await api.get(`/admin/wmi/concepts/${slug}/samples`, {
    params: { count, ...(seed != null ? { seed } : {}) },
  })
  return { baseSeed: data.data.baseSeed, samples: data.data.samples }
}

export async function fetchConceptReview(slug: string): Promise<ConceptReview> {
  const { data } = await api.get(`/admin/wmi/concepts/${slug}/review`)
  return data.data.review
}

export async function saveConceptReview(
  slug: string,
  status: ReviewStatus,
  notes: string,
): Promise<ConceptReview> {
  const { data } = await api.put(`/admin/wmi/concepts/${slug}/review`, { status, notes })
  return data.data.review
}

export interface AdminPaperSummary {
  id: string
  brand: string
  year: number
  grade: number | null
  level_code: string
  level_label: string
  round: string
  variant: string
  title: string
  question_count: number
  status: ReviewStatus
}

export interface AdminPaperQuestion {
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
  code?: string
  hint_steps_en?: string[] | null
  hint_steps_id?: string[] | null
  breakdown?: Breakdown | null
  visual?: { templateId: string; params: unknown } | null
}

export interface PaperReview {
  paper_id: string
  status: ReviewStatus
  notes: string
  reviewed_by: string | null
  updated_at: string | null
}

export async function fetchPaperList(): Promise<AdminPaperSummary[]> {
  const { data } = await api.get('/admin/wmi/papers')
  return data.data.papers
}

export async function fetchPaperQuestions(paperId: string): Promise<AdminPaperQuestion[]> {
  const { data } = await api.get(`/admin/wmi/papers/${paperId}/questions`)
  return data.data.questions
}

export async function fetchPaperReview(paperId: string): Promise<PaperReview> {
  const { data } = await api.get(`/admin/wmi/papers/${paperId}/review`)
  return data.data.review
}

export async function savePaperReview(
  paperId: string,
  status: ReviewStatus,
  notes: string,
): Promise<PaperReview> {
  const { data } = await api.put(`/admin/wmi/papers/${paperId}/review`, { status, notes })
  return data.data.review
}

// In-app quick-fix: patch a stored question's simple text fields.
export async function patchPaperQuestion(
  paperId: string,
  questionId: string,
  patch: Partial<{ body_en: string; body_id: string; answer: string; hint_en: string | null; hint_id: string | null }>,
): Promise<void> {
  await api.patch(`/admin/wmi/papers/${paperId}/questions/${questionId}`, patch)
}
