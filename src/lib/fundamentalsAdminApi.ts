import api from './api'
import type { LessonBlock } from '../types/fundamentals'

export interface AdminLessonSummary {
  slug: string
  module_slug: string
  title_en: string
  title_id: string
  status: string
  sort_order: number
  brand: string | null
  block_count: number
  updated_at: string
}

export interface AdminModule {
  slug: string
  title_en: string
  title_id: string
  summary_en: string | null
  summary_id: string | null
  sort_order: number
  status: string
  lessons: AdminLessonSummary[]
}

export interface AdminLessonFull {
  slug: string
  module_slug: string
  brand: string | null
  title_en: string
  title_id: string
  summary_en: string | null
  summary_id: string | null
  est_minutes: number | null
  sort_order: number
  status: string
  blocks: LessonBlock[]
}

export async function fetchAdminCourse(): Promise<AdminModule[]> {
  const { data } = await api.get('/admin/fundamentals/modules')
  return data.data.modules
}

export async function createModule(input: Record<string, unknown>): Promise<void> {
  await api.post('/admin/fundamentals/modules', input)
}

export async function updateModule(slug: string, patch: Record<string, unknown>): Promise<void> {
  await api.patch(`/admin/fundamentals/modules/${slug}`, patch)
}

export async function deleteModule(slug: string): Promise<void> {
  await api.delete(`/admin/fundamentals/modules/${slug}`)
}

export async function fetchAdminLesson(slug: string): Promise<AdminLessonFull> {
  const { data } = await api.get(`/admin/fundamentals/lessons/${slug}`)
  return data.data.lesson
}

export async function createLesson(input: Record<string, unknown>): Promise<void> {
  await api.post('/admin/fundamentals/lessons', input)
}

export async function updateLesson(slug: string, patch: Record<string, unknown>): Promise<void> {
  await api.patch(`/admin/fundamentals/lessons/${slug}`, patch)
}

export async function deleteLesson(slug: string): Promise<void> {
  await api.delete(`/admin/fundamentals/lessons/${slug}`)
}
