import { query, queryOne, withTransaction } from '../../../db.js'
import { ALL_SLUGS, CONCEPTS } from './registry.js'
import { mulberry32 } from './rng.js'
import type { ConceptLogic } from './types.js'

const SEED_COUNT = 20

let bootstrapPromise: Promise<void> | null = null

export function ensureBootstrapped(): Promise<void> {
  if (!bootstrapPromise) {
    bootstrapPromise = doBootstrap().catch((err) => {
      // Reset on failure so the next request retries from scratch.
      bootstrapPromise = null
      throw err
    })
  }
  return bootstrapPromise
}

async function doBootstrap(): Promise<void> {
  await ensureConceptInstanceHintStepColumns()
  await upsertConcepts()
  for (const slug of ALL_SLUGS) {
    await seedConcept(slug, CONCEPTS[slug] as ConceptLogic<unknown>)
  }
}

async function ensureConceptInstanceHintStepColumns(): Promise<void> {
  await query(`
    ALTER TABLE wmi_concept_instances
      ADD COLUMN IF NOT EXISTS hint_steps_en JSONB,
      ADD COLUMN IF NOT EXISTS hint_steps_id JSONB
  `)
}

async function upsertConcepts(): Promise<void> {
  await withTransaction(async (client) => {
    for (const slug of ALL_SLUGS) {
      const c = CONCEPTS[slug]
      await client.query(
        `
        INSERT INTO wmi_concepts (slug, name_en, name_id, description_id, grades)
        VALUES ($1, $2, $3, $4, $5::SMALLINT[])
        ON CONFLICT (slug) DO UPDATE SET
          name_en = EXCLUDED.name_en,
          name_id = EXCLUDED.name_id,
          description_id = EXCLUDED.description_id,
          grades = EXCLUDED.grades,
          updated_at = NOW()
        `,
        [
          c.meta.slug,
          c.meta.name_en,
          c.meta.name_id,
          c.meta.description_id ?? null,
          c.meta.grades as readonly number[],
        ],
      )
    }
  })
}

async function seedConcept(slug: string, concept: ConceptLogic<unknown>): Promise<void> {
  for (let seed = 1; seed <= SEED_COUNT; seed++) {
    try {
      const params = concept.generate(mulberry32(seed))
      concept.paramsSchema.parse(params)
      const r = concept.render(params)
      await query(
        `
        INSERT INTO wmi_concept_instances
          (concept_slug, params, body_en, body_id, answer_type,
           choices_en, choices_id, answer, hint_en, hint_id, hint_steps_en, hint_steps_id)
        VALUES ($1, $2::jsonb, $3, $4, $5, $6::jsonb, $7::jsonb, $8, $9, $10, $11::jsonb, $12::jsonb)
        ON CONFLICT (concept_slug, params) DO NOTHING
        `,
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
        ],
      )
    } catch (err) {
      console.error(`bootstrap seed failed for ${slug} seed=${seed}:`, err)
      // Continue — one bad seed doesn't block the rest of the concept's pool
    }
  }
}

// Test-only: reset the latch between integration tests
export function _resetBootstrapForTesting(): void {
  bootstrapPromise = null
}

// Test-only: count instances per concept
export async function _instanceCountsForTesting(): Promise<Record<string, number>> {
  const rows = await query<{ slug: string; n: string }>(
    `SELECT concept_slug AS slug, count(*)::text AS n
     FROM wmi_concept_instances GROUP BY concept_slug`,
  )
  return Object.fromEntries(rows.map((r) => [r.slug, Number(r.n)]))
}

// Used by tests; not exported in product code paths but harmless.
void queryOne
