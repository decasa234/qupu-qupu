import { pool, query } from '../../../db.js'
import { assertChildOwnership } from '../../../lib/childOwnership.js'
import { ensureBootstrapped } from './bootstrap.js'
import { PROFICIENT_TIER } from './comprehension.js'

const UNLOCK_PCT = 70

export interface GardenConcept {
  slug: string
  nameId: string
  nameEn: string
  difficulty: number
  tier: number
  pct: number
}
export interface GardenChapter {
  themeKey: string
  nameId: string
  nameEn: string
  colorHex: string
  iconKey: string
  concepts: GardenConcept[]
  meanPct: number
  grownCount: number   // tier >= Mahir
  total: number
  unlocked: boolean
  testedOut: boolean
}
export interface Garden {
  grade: number
  chapters: GardenChapter[]
  nextConceptSlug: string | null
}

interface Row {
  theme_key: string; name_id: string; name_en: string; color_hex: string; icon_key: string
  theme_sort: number; slug: string; c_name_id: string; c_name_en: string
  difficulty: number | null; sort_order: number; best_tier: number | null; pct: number | null
}

export async function getGarden(parentUserId: string, childId: string, grade: number): Promise<Garden> {
  await ensureBootstrapped()
  const client = await pool.connect()
  try { await assertChildOwnership(client, parentUserId, childId) } finally { client.release() }

  const rows = await query<Row>(
    `SELECT t.theme_key, t.name_id, t.name_en, t.color_hex, t.icon_key, t.sort_order AS theme_sort,
            c.slug, c.name_id AS c_name_id, c.name_en AS c_name_en, c.difficulty, c.sort_order,
            p.best_tier, p.comprehension_pct AS pct
     FROM wmi_concepts c
     JOIN wmi_themes t ON t.theme_key = c.theme_key
     LEFT JOIN wmi_concept_progress p ON p.concept_slug = c.slug AND p.child_id = $1
     WHERE c.enabled = TRUE AND $2 = ANY(c.grades)
     ORDER BY t.sort_order, c.difficulty NULLS LAST, c.sort_order, c.name_id`,
    [childId, grade],
  )

  const passed = await query<{ theme_key: string }>(
    `SELECT DISTINCT theme_key FROM wmi_chapter_tests WHERE child_id = $1 AND grade = $2 AND passed`,
    [childId, grade],
  )
  const testedOut = new Set(passed.map((r) => r.theme_key))

  const byTheme = new Map<string, GardenChapter>()
  const themeSortByKey = new Map<string, number>()
  for (const r of rows) {
    let ch = byTheme.get(r.theme_key)
    if (!ch) {
      ch = { themeKey: r.theme_key, nameId: r.name_id, nameEn: r.name_en, colorHex: r.color_hex,
        iconKey: r.icon_key, concepts: [], meanPct: 0, grownCount: 0, total: 0,
        unlocked: false, testedOut: testedOut.has(r.theme_key) }
      byTheme.set(r.theme_key, ch)
      themeSortByKey.set(r.theme_key, r.theme_sort)
    }
    const tier = r.best_tier ?? 0
    const pct = r.pct ?? 0
    ch.concepts.push({ slug: r.slug, nameId: r.c_name_id, nameEn: r.c_name_en,
      difficulty: r.difficulty ?? 1, tier, pct })
  }

  const chapters = [...byTheme.values()]
  chapters.sort((a, b) => (themeSortByKey.get(a.themeKey) ?? 0) - (themeSortByKey.get(b.themeKey) ?? 0))
  for (const ch of chapters) {
    ch.total = ch.concepts.length
    ch.grownCount = ch.concepts.filter((c) => c.tier >= PROFICIENT_TIER).length
    ch.meanPct = ch.total ? Math.round(ch.concepts.reduce((s, c) => s + c.pct, 0) / ch.total) : 0
  }

  chapters.forEach((ch, i) => {
    ch.unlocked = i === 0 || ch.testedOut || (chapters[i - 1]?.meanPct ?? 0) >= UNLOCK_PCT
  })

  let nextConceptSlug: string | null = null
  for (const ch of chapters) {
    if (!ch.unlocked) continue
    const next = ch.concepts.find((c) => c.tier < PROFICIENT_TIER)
    if (next) { nextConceptSlug = next.slug; break }
  }

  return { grade, chapters, nextConceptSlug }
}
