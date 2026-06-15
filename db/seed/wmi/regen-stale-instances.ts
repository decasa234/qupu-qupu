// db/seed/wmi/regen-stale-instances.ts
//
// Maintenance: repair wmi_concept_instances whose stored content no longer
// matches the CURRENT concept code, by REGENERATING the content in place.
// `is_culled` is a GENERATED column (community-downvote driven) so it can't be
// set manually; instead we overwrite the broken rows' columns, keeping the row
// id so wmi_attempts / wmi_concept_votes FKs and history stay intact.
//
// Two repair modes per flagged row:
//   • params still valid but choices duplicated (e.g. old place-value rows) →
//     keep params, re-render() to get fresh distinct choices.
//   • params fail the current paramsSchema (param drift — the "8:undefined"
//     clock rows, story-sum, budget-selection) → generate fresh valid params,
//     re-render, overwrite everything. Unique(concept_slug, params) collisions
//     are retried.
// Orphan rows (concept slug no longer registered, e.g. count-objects) are left
// untouched — they're never served (their concept isn't enabled).
//
// Idempotent; verify with audit-instances.ts first and after. Run against prod
// too after deploying concept-code changes.
// Run: tsx db/seed/wmi/regen-stale-instances.ts

import dotenv from 'dotenv'
import { Pool } from 'pg'
import { getConcept } from '../../../api/services/wmi/concepts/registry.js'
import { mulberry32 } from '../../../api/services/wmi/concepts/rng.js'
import type { ConceptLogic, Rendered } from '../../../api/services/wmi/concepts/types.js'

dotenv.config()

type Choice = { label: string; text: string }
function dup(choices: unknown): boolean {
  if (!Array.isArray(choices)) return false
  const t = (choices as Choice[]).map((c) => String(c?.text ?? '').trim().toLowerCase())
  return new Set(t).size !== t.length
}
function dupRendered(r: Rendered): boolean {
  return r.answer_type === 'multiple_choice' && (dup(r.choices_en) || dup(r.choices_id))
}

const UPDATE_SQL = `
  UPDATE wmi_concept_instances
     SET params = $2::jsonb, body_en = $3, body_id = $4, answer_type = $5,
         choices_en = $6::jsonb, choices_id = $7::jsonb, answer = $8,
         hint_en = $9, hint_id = $10, hint_steps_en = $11::jsonb, hint_steps_id = $12::jsonb
   WHERE id = $1`

function updArgs(id: string, params: unknown, r: Rendered) {
  return [
    id,
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
  ]
}

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const { rows } = await pool.query<{
    id: string
    concept_slug: string
    params: unknown
    answer_type: string
    choices_en: unknown
    choices_id: unknown
  }>(`SELECT id, concept_slug, params, answer_type, choices_en, choices_id
        FROM wmi_concept_instances WHERE is_culled = FALSE`)

  let keptParams = 0, fresh = 0, orphan = 0, failed = 0
  const orphanSlugs = new Set<string>()

  for (const row of rows) {
    const concept = getConcept(row.concept_slug) as ConceptLogic<unknown> | undefined
    if (!concept) {
      // Concept no longer registered (e.g. count-objects). Can't regenerate;
      // these are never served because their concept isn't enabled. Leave them.
      orphan += 1
      orphanSlugs.add(row.concept_slug)
      continue
    }

    const schemaOk = concept.paramsSchema.safeParse(row.params).success
    const hasDup =
      row.answer_type === 'multiple_choice' && (dup(row.choices_en) || dup(row.choices_id))
    if (schemaOk && !hasDup) continue // already healthy

    // Mode 1: params valid, only choices were duplicated → keep params, re-render.
    if (schemaOk) {
      const r = concept.render(row.params)
      if (!dupRendered(r)) {
        await pool.query(UPDATE_SQL, updArgs(row.id, row.params, r))
        keptParams += 1
        continue
      }
    }

    // Mode 2: regenerate fresh valid params (retry on unique collision / dup).
    let done = false
    for (let attempt = 0; attempt < 30 && !done; attempt++) {
      const seed = Math.floor(Math.random() * 2_000_000_000)
      let params: unknown
      try {
        params = concept.generate(mulberry32(seed))
        if (!concept.paramsSchema.safeParse(params).success) continue
      } catch {
        continue
      }
      const r = concept.render(params)
      if (dupRendered(r)) continue
      try {
        await pool.query(UPDATE_SQL, updArgs(row.id, params, r))
        fresh += 1
        done = true
      } catch (err) {
        // 23505 = unique(concept_slug, params) collision → try a different seed.
        if ((err as { code?: string }).code === '23505') continue
        throw err
      }
    }
    if (!done) failed += 1
  }

  console.log(`\nRepaired in place: keptParams=${keptParams}, freshParams=${fresh}`)
  console.log(`Orphan rows left untouched (not served): ${orphan} ${orphan ? `[${[...orphanSlugs].join(', ')}]` : ''}`)
  if (failed) console.log(`Could not regenerate (left as-is): ${failed}`)

  await pool.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
