import { createHash } from 'node:crypto'
import { query, queryOne, withTransaction } from '../../../db.js'
import { CURRICULUM, SUBJECTS } from './curriculum.js'
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

// Fingerprint of everything this bootstrap writes: subject rows, concept
// metadata/curriculum, and the seed-pool size. Deliberately NOT the concept
// render/generate code — seeded instances are immutable once written
// (ON CONFLICT DO NOTHING); refreshing stale instances is
// db/seed/wmi/regen-stale-instances.ts's job, not the request path's.
function registryFingerprint(): string {
  const material = JSON.stringify({
    seedCount: SEED_COUNT,
    subjects: SUBJECTS,
    curriculum: CURRICULUM,
    metas: ALL_SLUGS.map((slug) => CONCEPTS[slug].meta),
  })
  return createHash('sha256').update(material).digest('hex')
}

async function doBootstrap(): Promise<void> {
  // NOTE: schema (DDL) is owned by db/schema.sql + db/migrations (the
  // hint_steps columns come from migration 0023). This bootstrap no longer
  // runs DDL at request time — it only upserts concept rows and seeds the
  // idempotent starter instance pool.
  //
  // Fast path: the full upsert+seed pass is ~1,700 sequential queries — a
  // 15-50s first request on every serverless cold start against a remote
  // Postgres. The wmi_bootstrap_state stamp (migration 0050) records the
  // fingerprint of the last completed pass; when it matches, this instance
  // has nothing to write and the gate costs one SELECT.
  // Both stamp queries tolerate a missing table (code deployed before
  // migration 0050): the fast path is then skipped and behavior degrades to
  // the old full pass instead of failing every WMI request.
  const fingerprint = registryFingerprint()
  const stamp = await queryOne<{ fingerprint: string }>(
    'SELECT fingerprint FROM wmi_bootstrap_state WHERE id = 1',
  ).catch(() => null)
  if (stamp?.fingerprint === fingerprint) return

  await upsertSubjects()
  await upsertConcepts()
  for (const slug of ALL_SLUGS) {
    await seedConcept(slug, CONCEPTS[slug] as ConceptLogic<unknown>)
  }

  await query(
    `INSERT INTO wmi_bootstrap_state (id, fingerprint, bootstrapped_at)
     VALUES (1, $1, NOW())
     ON CONFLICT (id) DO UPDATE SET fingerprint = EXCLUDED.fingerprint, bootstrapped_at = NOW()`,
    [fingerprint],
  ).catch((err) => {
    console.error('wmi bootstrap: could not stamp fingerprint (migration 0050 applied?):', err)
  })
}

async function upsertSubjects(): Promise<void> {
  await withTransaction(async (client) => {
    for (const s of SUBJECTS) {
      await client.query(
        `INSERT INTO wmi_subjects (subject_key, grade, name_id, name_en, color_hex, icon_key, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (subject_key) DO UPDATE SET
           grade = EXCLUDED.grade,
           name_id = EXCLUDED.name_id, name_en = EXCLUDED.name_en,
           color_hex = EXCLUDED.color_hex, icon_key = EXCLUDED.icon_key,
           sort_order = EXCLUDED.sort_order`,
        [s.subjectKey, s.grade, s.name_id, s.name_en, s.color_hex, s.icon_key, s.sortOrder],
      )
    }
  })
}

async function upsertConcepts(): Promise<void> {
  await withTransaction(async (client) => {
    for (const slug of ALL_SLUGS) {
      const c = CONCEPTS[slug]
      const cur = CURRICULUM[slug as keyof typeof CURRICULUM]
      await client.query(
        `INSERT INTO wmi_concepts (slug, name_en, name_id, description_id, grades, subject_key, difficulty, sort_order, tags)
         VALUES ($1,$2,$3,$4,$5::SMALLINT[],$6,$7,$8,$9::text[])
         ON CONFLICT (slug) DO UPDATE SET
           name_en = EXCLUDED.name_en, name_id = EXCLUDED.name_id,
           description_id = EXCLUDED.description_id, grades = EXCLUDED.grades,
           subject_key = EXCLUDED.subject_key, difficulty = EXCLUDED.difficulty,
           sort_order = EXCLUDED.sort_order, tags = EXCLUDED.tags, updated_at = NOW()`,
        [
          c.meta.slug,
          c.meta.name_en,
          c.meta.name_id,
          c.meta.description_id ?? null,
          c.meta.grades as readonly number[],
          cur.subjectKey,
          cur.difficulty,
          cur.sortOrder,
          cur.tags,
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
