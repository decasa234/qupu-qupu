import api from './api'
import type {
  FundamentalsOutline,
  LessonResponse,
} from '../types/fundamentals'

function unwrap<T>(response: { data: { success: boolean; data: T; error?: string } }): T {
  if (!response.data.success) throw new Error(response.data.error ?? 'Request failed')
  return response.data.data
}

export async function fetchOutline(childId: string): Promise<FundamentalsOutline> {
  const response = await api.get('/me/fundamentals/outline', { params: { childId } })
  return unwrap<FundamentalsOutline>(response)
}

export async function fetchLesson(childId: string, slug: string): Promise<LessonResponse> {
  const response = await api.get(`/me/fundamentals/lessons/${slug}`, { params: { childId } })
  return unwrap<LessonResponse>(response)
}

export async function markLessonComplete(
  childId: string,
  lessonSlug: string,
  checkCorrect?: number,
  checkTotal?: number,
): Promise<FundamentalsOutline> {
  const response = await api.post('/me/fundamentals/progress', {
    childId,
    lesson_slug: lessonSlug,
    check_correct: checkCorrect,
    check_total: checkTotal,
  })
  return unwrap<FundamentalsOutline>(response)
}
