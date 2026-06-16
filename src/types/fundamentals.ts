// Frontend mirror of the Fundamentals service shapes. The block type comes from
// the shared schema module (the same one the server validates with), bundled by
// Vite like the brand registry.
import type { LessonBlock } from '../../api/services/fundamentals/blocks'

export type { LessonBlock }

export interface OutlineLesson {
  slug: string
  moduleSlug: string
  titleEn: string
  titleId: string
  summaryEn: string | null
  summaryId: string | null
  estMinutes: number | null
  completed: boolean
  locked: boolean
}

export interface OutlineModule {
  slug: string
  titleEn: string
  titleId: string
  summaryEn: string | null
  summaryId: string | null
  lessons: OutlineLesson[]
}

export interface FundamentalsOutline {
  modules: OutlineModule[]
  totalLessons: number
  completedLessons: number
}

export interface LessonDetail {
  slug: string
  moduleSlug: string
  titleEn: string
  titleId: string
  summaryEn: string | null
  summaryId: string | null
  estMinutes: number | null
  blocks: LessonBlock[]
  completed: boolean
  locked: boolean
  prevSlug: string | null
  nextSlug: string | null
}

/** Returned in place of LessonDetail when the lesson is gated by linear unlock. */
export interface LockedLesson {
  locked: true
  slug: string
}

export type LessonResponse = LessonDetail | LockedLesson

export function isLocked(r: LessonResponse): r is LockedLesson {
  return (r as LockedLesson).locked === true && !('blocks' in r)
}
