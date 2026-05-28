import { query, queryOne, withTransaction } from '../../../db.js'
import { assertChildOwnership } from '../../../lib/childOwnership.js'
import { CONCEPTS, getConcept } from './registry.js'
import { mulberry32 } from './rng.js'
import { ensureBootstrapped } from './bootstrap.js'
import type { ConceptLogic } from './types.js'

export interface ConceptQuestion {
  concept_instance_id: string
  concept_slug: string
  params: unknown
  body_en: string
  body_id: string
  answer_type: 'multiple_choice' | 'fill_in'
  choices_en: unknown
  choices_id: unknown
  hint_en: string | null
  hint_id: string | null
}

const MAX_DUPE_RETRIES = 5

export async function getNextConceptQuestion(
  parentUserId: string,
  childId: string,
): Promise<ConceptQuestion> {
  await ensureBootstrapped()

  return withTransaction(async (client) => {
    await assertChildOwnership(client, parentUserId, childId)

    const kidRow = await queryOne<{ grade: number | null }>(
      'SELECT grade FROM children WHERE id = $1',
      [childId],
      client,
    )
    const grade = kidRow?.grade ?? 0

    const conceptRow = await queryOne<{ slug: string }>(
      `
      SELECT slug FROM wmi_concepts
      WHERE enabled = TRUE AND $1::SMALLINT = ANY(grades)
      ORDER BY random()
      LIMIT 1
      `,
      [grade],
      client,
    )
    if (!conceptRow) {
      throw new Error(`konsep belum tersedia untuk kelas ${grade}`)
    }
    const conceptSlug = conceptRow.slug

    const instance =
      (await pickExistingInstance(client, conceptSlug, childId)) ??
      (await generateAndPersist(client, conceptSlug)) ??
      (await fallbackOldestAttempted(client, conceptSlug, childId))

    if (!instance) {
      throw new Error(`tidak bisa membuat soal untuk konsep ${conceptSlug}`)
    }

    await client.query(
      'UPDATE wmi_concept_instances SET served_count = served_count + 1 WHERE id = $1',
      [instance.id],
    )
    await client.query(
      'UPDATE wmi_concepts SET total_served = total_served + 1 WHERE slug = $1',
      [conceptSlug],
    )

    return {
      concept_instance_id: instance.id,
      concept_slug: conceptSlug,
      params: instance.params,
      body_en: instance.body_en,
      body_id: instance.body_id,
      answer_type: instance.answer_type,
      choices_en: instance.choices_en,
      choices_id: instance.choices_id,
      hint_en: instance.hint_en,
      hint_id: instance.hint_id,
    }
  })
}

interface InstanceRow {
  id: string
  params: unknown
  body_en: string
  body_id: string
  answer_type: 'multiple_choice' | 'fill_in'
  choices_en: unknown
  choices_id: unknown
  hint_en: string | null
  hint_id: string | null
}

async function pickExistingInstance(
  client: import('pg').PoolClient,
  conceptSlug: string,
  childId: string,
): Promise<InstanceRow | null> {
  return queryOne<InstanceRow>(
    `
    SELECT i.id, i.params, i.body_en, i.body_id, i.answer_type,
           i.choices_en, i.choices_id, i.hint_en, i.hint_id
    FROM wmi_concept_instances i
    LEFT JOIN wmi_attempts a
      ON a.concept_instance_id = i.id AND a.child_id = $2
    WHERE i.concept_slug = $1
      AND i.is_culled = FALSE
      AND a.id IS NULL
    ORDER BY i.served_count ASC, random()
    LIMIT 1
    `,
    [conceptSlug, childId],
    client,
  )
}

async function generateAndPersist(
  client: import('pg').PoolClient,
  conceptSlug: string,
): Promise<InstanceRow | null> {
  const concept = getConcept(conceptSlug) as ConceptLogic<unknown> | undefined
  if (!concept) return null

  for (let i = 0; i < MAX_DUPE_RETRIES; i++) {
    const seed = Math.floor(Math.random() * 2_000_000_000)
    let params: unknown
    try {
      params = concept.generate(mulberry32(seed))
      concept.paramsSchema.parse(params)
    } catch (err) {
      console.error(`generator failed for ${conceptSlug} seed=${seed}:`, err)
      continue
    }
    const r = concept.render(params)
    const row = await queryOne<InstanceRow>(
      `
      INSERT INTO wmi_concept_instances
        (concept_slug, params, body_en, body_id, answer_type,
         choices_en, choices_id, answer, hint_en, hint_id)
      VALUES ($1, $2::jsonb, $3, $4, $5, $6::jsonb, $7::jsonb, $8, $9, $10)
      ON CONFLICT (concept_slug, params) DO NOTHING
      RETURNING id, params, body_en, body_id, answer_type,
                choices_en, choices_id, hint_en, hint_id
      `,
      [
        conceptSlug,
        JSON.stringify(params),
        r.body_en,
        r.body_id,
        r.answer_type,
        r.choices_en ? JSON.stringify(r.choices_en) : null,
        r.choices_id ? JSON.stringify(r.choices_id) : null,
        r.answer,
        r.hint_en,
        r.hint_id,
      ],
      client,
    )
    if (row) return row
  }
  return null
}

async function fallbackOldestAttempted(
  client: import('pg').PoolClient,
  conceptSlug: string,
  childId: string,
): Promise<InstanceRow | null> {
  return queryOne<InstanceRow>(
    `
    SELECT i.id, i.params, i.body_en, i.body_id, i.answer_type,
           i.choices_en, i.choices_id, i.hint_en, i.hint_id
    FROM wmi_concept_instances i
    JOIN wmi_attempts a
      ON a.concept_instance_id = i.id AND a.child_id = $2
    WHERE i.concept_slug = $1 AND i.is_culled = FALSE
    ORDER BY a.created_at ASC
    LIMIT 1
    `,
    [conceptSlug, childId],
    client,
  )
}

void CONCEPTS // keep the import alive for tree-shake awareness
void query
