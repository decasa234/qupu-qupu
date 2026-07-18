// Fills per-level instance pools for levelled concepts. Mirrors bootstrap's
// insert shape (bootstrap.ts:seedConcept) but stamps the `level` column.
//
// The DB uniqueness guarantee lives on `wmi_concept_instances_params_unique
// UNIQUE (concept_slug, params)` (db/schema.sql) — it is NOT scoped by
// level, so a freshly-generated candidate at level N can collide with an
// instance already seeded at a different level (including the legacy
// level=0 pool bootstrap.ts fills for every concept). We therefore dedupe
// with an in-memory Set as a fast path (avoids a redundant round trip for
// obviously-repeated draws within this level) but rely on
// `ON CONFLICT (concept_slug, params) DO NOTHING RETURNING id` as the
// source of truth: a collision silently no-ops instead of throwing, and we
// only count a candidate as "made" when a row was actually returned.
// Small param spaces at low levels may cap below perLevel; that is fine
// (the pool is still non-empty and the lesson picker samples with
// replacement across sessions).
import { getConcept } from './registry.js'
import { getLevelGeneration } from './levels.js'
import { mulberry32 } from './rng.js'
import { query } from '../../../db.js'

const DEFAULT_PER_LEVEL = 20
const LEVELS = [1, 2, 3, 4, 5] as const

// mulberry32 takes a numeric seed; hash the (slug, level, top-up offset)
// key into a uint32 so repeated top-up calls draw a fresh sequence instead
// of replaying the same one. Not cryptographic — just needs to spread.
function seedFromString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0
  }
  return h >>> 0
}

export async function ensureLevelPools(slugs: string[], perLevel = DEFAULT_PER_LEVEL): Promise<void> {
  for (const slug of slugs) {
    const concept = getConcept(slug)
    const levelled = getLevelGeneration(slug)
    if (!concept || !levelled) {
      throw new Error(`concept '${slug}' has no level generation — cannot build pools`)
    }
    for (const level of LEVELS) {
      const existing = await query<{ params: unknown }>(
        `SELECT params FROM wmi_concept_instances WHERE concept_slug = $1 AND level = $2`,
        [slug, level],
      )
      const have = existing.length
      const seenParams = new Set(existing.map((r) => JSON.stringify(r.params)))
      const rng = mulberry32(seedFromString(`${slug}:L${level}:${have}`))
      let attempts = 0
      let made = 0
      while (have + made < perLevel && attempts < perLevel * 20) {
        attempts += 1
        const params = concept.paramsSchema.parse(levelled(rng, level))
        const key = JSON.stringify(params)
        if (seenParams.has(key)) continue
        seenParams.add(key)
        const r = concept.render(params)
        const inserted = await query<{ id: string }>(
          `INSERT INTO wmi_concept_instances
             (concept_slug, params, body_en, body_id, answer_type,
              choices_en, choices_id, answer, hint_en, hint_id, hint_steps_en, hint_steps_id, level)
           VALUES ($1, $2::jsonb, $3, $4, $5, $6::jsonb, $7::jsonb, $8, $9, $10, $11::jsonb, $12::jsonb, $13)
           ON CONFLICT (concept_slug, params) DO NOTHING
           RETURNING id`,
          [
            slug,
            JSON.stringify(params),
            r.body_en,
            r.body_id,
            r.answer_type,
            r.choices_en ? JSON.stringify(r.choices_en) : null,
            r.choices_id ? JSON.stringify(r.choices_id) : null,
            r.answer,
            r.hint_en,
            r.hint_id,
            r.hint_steps_en ? JSON.stringify(r.hint_steps_en) : null,
            r.hint_steps_id ? JSON.stringify(r.hint_steps_id) : null,
            level,
          ],
        )
        if (inserted.length > 0) made += 1
      }
    }
  }
}
