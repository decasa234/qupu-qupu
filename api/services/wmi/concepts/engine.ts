import { query, queryOne, withTransaction } from '../../../db.js'
import { assertChildOwnership } from '../../../lib/childOwnership.js'
import { CONCEPTS, getConcept } from './registry.js'
import { mulberry32 } from './rng.js'
import { ensureBootstrapped } from './bootstrap.js'
import type { ConceptLogic } from './types.js'

export interface ConceptQuestion {
  concept_instance_id: string
  concept_slug: string
  concept_name_id: string
  concept_name_en: string
  tags: string[]
  params: unknown
  body_en: string
  body_id: string
  answer_type: 'multiple_choice' | 'fill_in'
  choices_en: unknown
  choices_id: unknown
  hint_en: string | null
  hint_id: string | null
  hint_steps_en: string[] | null
  hint_steps_id: string[] | null
}

const MAX_DUPE_RETRIES = 5

export async function getNextConceptQuestion(
  parentUserId: string,
  childId: string,
  grade: number,
  requestedSlug?: string,
): Promise<ConceptQuestion> {
  await ensureBootstrapped()

  return withTransaction(async (client) => {
    await assertChildOwnership(client, parentUserId, childId)

    // When a specific concept is requested (tapping a concept in the catalog),
    // serve that concept directly — grade-independent. Otherwise pick a random
    // enabled concept for the grade.
    const conceptRow = requestedSlug
      ? await queryOne<{ slug: string; name_id: string; name_en: string; tags: string[] | null }>(
          `SELECT slug, name_id, name_en, tags FROM wmi_concepts WHERE slug = $1 AND enabled = TRUE`,
          [requestedSlug],
          client,
        )
      : await queryOne<{ slug: string; name_id: string; name_en: string; tags: string[] | null }>(
          `
          SELECT slug, name_id, name_en, tags FROM wmi_concepts
          WHERE enabled = TRUE AND $1::SMALLINT = ANY(grades)
          ORDER BY random()
          LIMIT 1
          `,
          [grade],
          client,
        )
    if (!conceptRow) {
      throw new Error(
        requestedSlug
          ? `konsep ${requestedSlug} tidak tersedia`
          : `konsep belum tersedia untuk kelas ${grade}`,
      )
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
      concept_name_id: conceptRow.name_id,
      concept_name_en: conceptRow.name_en,
      tags: conceptRow.tags ?? [],
      params: instance.params,
      body_en: instance.body_en,
      body_id: instance.body_id,
      answer_type: instance.answer_type,
      choices_en: instance.choices_en,
      choices_id: instance.choices_id,
      hint_en: instance.hint_en,
      hint_id: instance.hint_id,
      hint_steps_en: instance.hint_steps_en,
      hint_steps_id: instance.hint_steps_id,
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
  hint_steps_en: string[] | null
  hint_steps_id: string[] | null
}

async function pickExistingInstance(
  client: import('pg').PoolClient,
  conceptSlug: string,
  childId: string,
): Promise<InstanceRow | null> {
  return queryOne<InstanceRow>(
    `
    SELECT i.id, i.params, i.body_en, i.body_id, i.answer_type,
           i.choices_en, i.choices_id, i.hint_en, i.hint_id,
           i.hint_steps_en, i.hint_steps_id
    FROM wmi_concept_instances i
    LEFT JOIN wmi_attempts a
      ON a.concept_instance_id = i.id AND a.child_id = $2
    WHERE i.concept_slug = $1
      AND i.is_culled = FALSE
      AND ($1 <> 'story-sum' OR i.params ? 'start')
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
         choices_en, choices_id, answer, hint_en, hint_id, hint_steps_en, hint_steps_id)
      VALUES ($1, $2::jsonb, $3, $4, $5, $6::jsonb, $7::jsonb, $8, $9, $10, $11::jsonb, $12::jsonb)
      ON CONFLICT (concept_slug, params) DO NOTHING
      RETURNING id, params, body_en, body_id, answer_type,
                choices_en, choices_id, hint_en, hint_id, hint_steps_en, hint_steps_id
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
        r.hint_steps_en ? JSON.stringify(r.hint_steps_en) : null,
        r.hint_steps_id ? JSON.stringify(r.hint_steps_id) : null,
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
           i.choices_en, i.choices_id, i.hint_en, i.hint_id,
           i.hint_steps_en, i.hint_steps_id
    FROM wmi_concept_instances i
    JOIN wmi_attempts a
      ON a.concept_instance_id = i.id AND a.child_id = $2
    WHERE i.concept_slug = $1
      AND i.is_culled = FALSE
      AND ($1 <> 'story-sum' OR i.params ? 'start')
    ORDER BY a.created_at ASC
    LIMIT 1
    `,
    [conceptSlug, childId],
    client,
  )
}

export async function submitConceptVote(
  parentUserId: string,
  childId: string,
  conceptInstanceId: string,
  vote: 1 | -1,
): Promise<{ upvotes: number; downvotes: number }> {
  return withTransaction(async (client) => {
    await assertChildOwnership(client, parentUserId, childId)

    const instance = await queryOne<{ concept_slug: string }>(
      'SELECT concept_slug FROM wmi_concept_instances WHERE id = $1',
      [conceptInstanceId],
      client,
    )
    if (!instance) throw new Error('Question not found')

    const previous = await queryOne<{ vote: number }>(
      `SELECT vote FROM wmi_concept_votes
       WHERE child_id = $1 AND concept_instance_id = $2`,
      [childId, conceptInstanceId],
      client,
    )
    const previousVote = previous?.vote ?? null

    await client.query(
      `
      INSERT INTO wmi_concept_votes (child_id, concept_instance_id, vote)
      VALUES ($1, $2, $3)
      ON CONFLICT (child_id, concept_instance_id)
      DO UPDATE SET vote = EXCLUDED.vote, voted_at = NOW()
      `,
      [childId, conceptInstanceId, vote],
    )

    const counts = await queryOne<{ upvotes: string; downvotes: string }>(
      `
      UPDATE wmi_concept_instances
      SET upvotes   = (SELECT count(*) FROM wmi_concept_votes
                       WHERE concept_instance_id = $1 AND vote = 1),
          downvotes = (SELECT count(*) FROM wmi_concept_votes
                       WHERE concept_instance_id = $1 AND vote = -1)
      WHERE id = $1
      RETURNING upvotes::text, downvotes::text
      `,
      [conceptInstanceId],
      client,
    )
    if (!counts) throw new Error('Question not found')

    // Adjust aggregate counters on wmi_concepts
    let upDelta = 0
    let downDelta = 0
    if (previousVote === null) {
      if (vote === 1) upDelta = 1
      else downDelta = 1
    } else if (previousVote === 1 && vote === -1) {
      upDelta = -1
      downDelta = 1
    } else if (previousVote === -1 && vote === 1) {
      upDelta = 1
      downDelta = -1
    }
    if (upDelta !== 0 || downDelta !== 0) {
      await client.query(
        `
        UPDATE wmi_concepts
        SET total_upvotes   = total_upvotes   + $2,
            total_downvotes = total_downvotes + $3
        WHERE slug = $1
        `,
        [instance.concept_slug, upDelta, downDelta],
      )
    }

    return { upvotes: Number(counts.upvotes), downvotes: Number(counts.downvotes) }
  })
}

void CONCEPTS // keep the import alive for tree-shake awareness
void query
