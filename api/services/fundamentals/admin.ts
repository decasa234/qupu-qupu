// api/services/fundamentals/admin.ts
//
// Admin CRUD for the Fundamentals course (modules + lessons). Distinct from
// lessons.ts (member reads) because admins see every status and edit content.
// Block payloads are validated against the shared schema before they touch the
// DB, so a malformed editor save is rejected with a clear error.

import { query, queryOne } from '../../db.js'
import { lessonBlocksSchema, type LessonBlocks } from './blocks.js'

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
  blocks: LessonBlocks
}

const PG_UNIQUE = '23505'
const PG_FK = '23503'

function isPgError(e: unknown, code: string): boolean {
  return typeof e === 'object' && e !== null && (e as { code?: string }).code === code
}

// ── Reads ────────────────────────────────────────────────────────────────

export async function listForAdmin(): Promise<AdminModule[]> {
  const modules = await query<AdminModule>(
    `SELECT slug, title_en, title_id, summary_en, summary_id, sort_order, status
     FROM fundamentals_modules ORDER BY sort_order, slug`,
  )
  const lessons = await query<AdminLessonSummary>(
    `SELECT slug, module_slug, title_en, title_id, status, sort_order, brand,
            jsonb_array_length(blocks) AS block_count, updated_at
     FROM fundamentals_lessons ORDER BY sort_order, slug`,
  )
  const byModule = new Map<string, AdminLessonSummary[]>()
  for (const l of lessons) {
    const list = byModule.get(l.module_slug) ?? []
    list.push({ ...l, block_count: Number(l.block_count) })
    byModule.set(l.module_slug, list)
  }
  return modules.map((m) => ({ ...m, lessons: byModule.get(m.slug) ?? [] }))
}

export async function getLessonForAdmin(slug: string): Promise<AdminLessonFull> {
  const row = await queryOne<AdminLessonFull>(
    `SELECT slug, module_slug, brand, title_en, title_id, summary_en, summary_id,
            est_minutes, sort_order, status, blocks
     FROM fundamentals_lessons WHERE slug = $1`,
    [slug],
  )
  if (!row) throw new Error('Lesson not found')
  return row
}

// ── Modules ──────────────────────────────────────────────────────────────

export interface ModuleInput {
  slug: string
  title_en: string
  title_id: string
  summary_en?: string | null
  summary_id?: string | null
  sort_order?: number
  status?: 'draft' | 'published'
}

export async function createModule(input: ModuleInput): Promise<void> {
  try {
    await query(
      `INSERT INTO fundamentals_modules
         (slug, title_en, title_id, summary_en, summary_id, sort_order, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        input.slug,
        input.title_en,
        input.title_id,
        input.summary_en ?? null,
        input.summary_id ?? null,
        input.sort_order ?? 0,
        input.status ?? 'draft',
      ],
    )
  } catch (e) {
    if (isPgError(e, PG_UNIQUE)) throw new Error('Module slug already exists')
    throw e
  }
}

const MODULE_COLS = ['title_en', 'title_id', 'summary_en', 'summary_id', 'sort_order', 'status']

export async function updateModule(slug: string, patch: Record<string, unknown>): Promise<void> {
  const cols = Object.keys(patch).filter((k) => MODULE_COLS.includes(k))
  if (cols.length === 0) return
  const sets = cols.map((c, i) => `${c} = $${i + 2}`)
  const row = await queryOne<{ slug: string }>(
    `UPDATE fundamentals_modules SET ${sets.join(', ')}, updated_at = NOW() WHERE slug = $1 RETURNING slug`,
    [slug, ...cols.map((c) => patch[c])],
  )
  if (!row) throw new Error('Module not found')
}

export async function deleteModule(slug: string): Promise<void> {
  const row = await queryOne<{ slug: string }>(
    'DELETE FROM fundamentals_modules WHERE slug = $1 RETURNING slug',
    [slug],
  )
  if (!row) throw new Error('Module not found')
}

// ── Lessons ──────────────────────────────────────────────────────────────

export interface LessonCreateInput {
  slug: string
  module_slug: string
  title_en: string
  title_id: string
  summary_en?: string | null
  summary_id?: string | null
  est_minutes?: number | null
  sort_order?: number
  status?: 'draft' | 'published'
  brand?: string | null
}

export async function createLesson(input: LessonCreateInput): Promise<void> {
  try {
    await query(
      `INSERT INTO fundamentals_lessons
         (slug, module_slug, brand, title_en, title_id, summary_en, summary_id,
          est_minutes, sort_order, status, blocks)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'[]'::jsonb)`,
      [
        input.slug,
        input.module_slug,
        input.brand ?? null,
        input.title_en,
        input.title_id,
        input.summary_en ?? null,
        input.summary_id ?? null,
        input.est_minutes ?? null,
        input.sort_order ?? 0,
        input.status ?? 'draft',
      ],
    )
  } catch (e) {
    if (isPgError(e, PG_UNIQUE)) throw new Error('Lesson slug already exists')
    if (isPgError(e, PG_FK)) throw new Error('Module not found')
    throw e
  }
}

const LESSON_META_COLS = [
  'module_slug',
  'brand',
  'title_en',
  'title_id',
  'summary_en',
  'summary_id',
  'est_minutes',
  'sort_order',
  'status',
]

/**
 * Partial lesson update. Only keys present in `patch` change (so the list page
 * can flip status without touching blocks, and the editor can save blocks
 * without resending every meta field). `blocks`, when present, is validated.
 */
export async function updateLesson(slug: string, patch: Record<string, unknown>): Promise<void> {
  const metaCols = Object.keys(patch).filter((k) => LESSON_META_COLS.includes(k))
  const sets: string[] = []
  const values: unknown[] = [slug]

  metaCols.forEach((c) => {
    values.push(patch[c])
    sets.push(`${c} = $${values.length}`)
  })

  if ('blocks' in patch) {
    const parsed = lessonBlocksSchema.safeParse(patch.blocks)
    if (!parsed.success) {
      throw new Error(`Invalid blocks: ${parsed.error.issues.map((i) => i.message).join('; ')}`)
    }
    values.push(JSON.stringify(parsed.data))
    sets.push(`blocks = $${values.length}::jsonb`)
  }

  if (sets.length === 0) return

  let row: { slug: string } | null
  try {
    row = await queryOne<{ slug: string }>(
      `UPDATE fundamentals_lessons SET ${sets.join(', ')}, updated_at = NOW() WHERE slug = $1 RETURNING slug`,
      values,
    )
  } catch (e) {
    if (isPgError(e, PG_FK)) throw new Error('Module not found')
    throw e
  }
  if (!row) throw new Error('Lesson not found')
}

export async function deleteLesson(slug: string): Promise<void> {
  const row = await queryOne<{ slug: string }>(
    'DELETE FROM fundamentals_lessons WHERE slug = $1 RETURNING slug',
    [slug],
  )
  if (!row) throw new Error('Lesson not found')
}
