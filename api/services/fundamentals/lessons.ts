// api/services/fundamentals/lessons.ts
//
// Member-facing reads for the Fundamentals course: the course outline (modules →
// lessons, each annotated completed/locked by the linear-unlock rule) and a
// single lesson's blocks + navigation. Only PUBLISHED modules/lessons are
// visible to members. Ownership is enforced on every call.

import { pool, query } from '../../db.js'
import { assertChildOwnership } from '../../lib/childOwnership.js'
import { applyLinearUnlock } from './unlock.js'
import { lessonBlocksSchema, type LessonBlock } from './blocks.js'

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

interface ModuleRow {
  slug: string
  title_en: string
  title_id: string
  summary_en: string | null
  summary_id: string | null
  sort_order: number
}

interface LessonRow {
  slug: string
  module_slug: string
  title_en: string
  title_id: string
  summary_en: string | null
  summary_id: string | null
  est_minutes: number | null
  sort_order: number
  blocks: unknown
}

const MODULES_SQL = `
  SELECT slug, title_en, title_id, summary_en, summary_id, sort_order
  FROM fundamentals_modules
  WHERE status = 'published'
  ORDER BY sort_order, slug
`

const LESSONS_SQL = `
  SELECT l.slug, l.module_slug, l.title_en, l.title_id, l.summary_en, l.summary_id,
         l.est_minutes, l.sort_order
  FROM fundamentals_lessons l
  JOIN fundamentals_modules m ON m.slug = l.module_slug
  WHERE l.status = 'published' AND m.status = 'published'
  ORDER BY m.sort_order, m.slug, l.sort_order, l.slug
`

async function completedSet(childId: string): Promise<Set<string>> {
  const rows = await query<{ lesson_slug: string }>(
    'SELECT lesson_slug FROM fundamentals_progress WHERE child_id = $1',
    [childId],
  )
  return new Set(rows.map((r) => r.lesson_slug))
}

/**
 * The whole course outline for one child. Lessons come back already ordered
 * (module sort, then lesson sort); the flat order drives linear unlock.
 */
export async function getOutline(
  parentUserId: string,
  childId: string,
): Promise<FundamentalsOutline> {
  await assertChildOwnership(pool, parentUserId, childId)

  const [modules, lessons, done] = await Promise.all([
    query<ModuleRow>(MODULES_SQL),
    query<LessonRow>(LESSONS_SQL),
    completedSet(childId),
  ])

  // LESSONS_SQL already returns the flat course order; annotate unlock on it.
  const flat = applyLinearUnlock(
    lessons.map((l) => ({ row: l, completed: done.has(l.slug) })),
  )

  const byModule = new Map<string, OutlineLesson[]>()
  for (const item of flat) {
    const l = item.row
    const lesson: OutlineLesson = {
      slug: l.slug,
      moduleSlug: l.module_slug,
      titleEn: l.title_en,
      titleId: l.title_id,
      summaryEn: l.summary_en,
      summaryId: l.summary_id,
      estMinutes: l.est_minutes,
      completed: item.completed,
      locked: item.locked,
    }
    const list = byModule.get(l.module_slug) ?? []
    list.push(lesson)
    byModule.set(l.module_slug, list)
  }

  const outlineModules: OutlineModule[] = modules
    .map((m) => ({
      slug: m.slug,
      titleEn: m.title_en,
      titleId: m.title_id,
      summaryEn: m.summary_en,
      summaryId: m.summary_id,
      lessons: byModule.get(m.slug) ?? [],
    }))
    // Drop modules that have no published lessons — nothing to show.
    .filter((m) => m.lessons.length > 0)

  return {
    modules: outlineModules,
    totalLessons: flat.length,
    completedLessons: flat.filter((l) => l.completed).length,
  }
}

interface LessonDetailRow extends LessonRow {
  status: string
}

/**
 * One lesson's content + this child's completion + prev/next navigation. Throws
 * "Lesson not found" for a missing or draft lesson. `locked` reflects the
 * linear-unlock rule; the page redirects to the outline when locked.
 */
export async function getLesson(
  parentUserId: string,
  childId: string,
  slug: string,
): Promise<LessonDetail> {
  await assertChildOwnership(pool, parentUserId, childId)

  const lessons = await query<LessonDetailRow>(
    `
    SELECT l.slug, l.module_slug, l.title_en, l.title_id, l.summary_en, l.summary_id,
           l.est_minutes, l.sort_order, l.blocks, l.status
    FROM fundamentals_lessons l
    JOIN fundamentals_modules m ON m.slug = l.module_slug
    WHERE l.status = 'published' AND m.status = 'published'
    ORDER BY m.sort_order, m.slug, l.sort_order, l.slug
    `,
  )

  const index = lessons.findIndex((l) => l.slug === slug)
  if (index === -1) throw new Error('Lesson not found')

  const done = await completedSet(childId)
  const annotated = applyLinearUnlock(
    lessons.map((l) => ({ slug: l.slug, completed: done.has(l.slug) })),
  )

  const row = lessons[index]
  const locked = annotated[index].locked
  // A locked lesson never exposes its blocks (defense in depth — the route also
  // strips them); skip parsing entirely. Otherwise tolerate legacy/partial rows:
  // render whatever validates, never 500 a member.
  let blocks: LessonBlock[] = []
  if (!locked) {
    const parsed = lessonBlocksSchema.safeParse(row.blocks ?? [])
    blocks = parsed.success ? parsed.data : []
  }

  return {
    slug: row.slug,
    moduleSlug: row.module_slug,
    titleEn: row.title_en,
    titleId: row.title_id,
    summaryEn: row.summary_en,
    summaryId: row.summary_id,
    estMinutes: row.est_minutes,
    blocks,
    completed: annotated[index].completed,
    locked,
    prevSlug: index > 0 ? lessons[index - 1].slug : null,
    nextSlug: index < lessons.length - 1 ? lessons[index + 1].slug : null,
  }
}

/**
 * Throws "Lesson not found" (missing/draft) or "Lesson is locked" (an earlier
 * lesson in the course is incomplete) for this child. Used to gate completion
 * so the linear-unlock rule is enforced server-side, not just in the UI.
 */
export async function assertLessonUnlocked(childId: string, slug: string): Promise<void> {
  const lessons = await query<{ slug: string }>(
    `
    SELECT l.slug
    FROM fundamentals_lessons l
    JOIN fundamentals_modules m ON m.slug = l.module_slug
    WHERE l.status = 'published' AND m.status = 'published'
    ORDER BY m.sort_order, m.slug, l.sort_order, l.slug
    `,
  )
  const index = lessons.findIndex((l) => l.slug === slug)
  if (index === -1) throw new Error('Lesson not found')

  const done = await completedSet(childId)
  const annotated = applyLinearUnlock(
    lessons.map((l) => ({ slug: l.slug, completed: done.has(l.slug) })),
  )
  if (annotated[index].locked) throw new Error('Lesson is locked')
}
