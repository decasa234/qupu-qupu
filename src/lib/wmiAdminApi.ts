import api from './api'
import type { WmiChoice } from '../types/wmi'

export type ReviewStatus = 'pending' | 'approved' | 'needs_changes'

export interface AdminConceptSummary {
  slug: string
  short_id: string
  name_en: string
  name_id: string
  description_id: string | null
  grades: number[]
  domain: string
  domain_label: string
  status: ReviewStatus
  priority: 'high' | 'normal'
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
