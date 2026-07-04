// WMI Claire — isolated warmup drill for a single WMI finalist.
//
// Temporary, niche feature: a bounded 10-question round drawn from the hardest
// concepts (grade-2 difficulty-2 plus every difficulty-3 concept), always
// freshly generated so problems never repeat. Fully isolated from the rest of QUPU —
// it does NOT write wmi_attempts, wmi_concept_progress, or any gamification;
// its only persistence is the claire_drill_rounds table, which stores each
// round + score so a parent can review a history.
//
// Access is gated to one parent email (CLAIRE_PARENT_EMAIL) at the route layer.

import { pool, query, queryOne, withTransaction } from '../../db.js'
import { assertChildOwnership } from '../../lib/childOwnership.js'
import { getConcept } from './concepts/registry.js'
import { mulberry32 } from './concepts/rng.js'
import { ensureBootstrapped } from './concepts/bootstrap.js'
import { isCorrectAnswer } from './answerMatch.js'
import type { Breakdown, ConceptLogic } from './concepts/types.js'

// Allow-list of parent accounts that can see/use Claire mode. johan@ is the
// finalist's parent; vicopratama449@ is kept for review/QA.
export const CLAIRE_PARENT_EMAILS = ['johan@decasa.co.id', 'vicopratama449@gmail.com']

const ROUND_SIZE = 10
const MAX_GEN_RETRIES = 5

export function hasClaireAccess(email: string | undefined | null): boolean {
  return CLAIRE_PARENT_EMAILS.includes((email ?? '').trim().toLowerCase())
}

// Stored item — carries the answer (never returned to the client).
interface ClaireItem {
  concept_slug: string
  concept_name_id: string
  concept_name_en: string
  params: unknown
  body_en: string
  body_id: string
  answer_type: 'multiple_choice' | 'fill_in'
  choices_en: unknown
  choices_id: unknown
  answer: string
  numeric_answer: boolean
  hint_en: string | null
  hint_id: string | null
  hint_steps_en: string[] | null
  hint_steps_id: string[] | null
  breakdown: Breakdown | null
}

// Public shape — the stored item minus `answer`, plus its slot index.
export interface ClaireQuestion extends Omit<ClaireItem, 'answer'> {
  index: number
}

export interface ClaireAnswerResult {
  is_correct: boolean
  correct_answer: string
  hint_en: string | null
  hint_id: string | null
  done: boolean
  score: number | null
}

export interface ClaireRoundSummary {
  id: string
  score: number | null
  total: number
  created_at: string
  completed_at: string | null
}

export interface ClaireReviewItem {
  index: number
  concept_name_id: string
  concept_name_en: string
  body_id: string
  body_en: string
  correct_answer: string
  selected: string | null
  is_correct: boolean | null
}

export interface ClaireRoundReview {
  id: string
  score: number | null
  total: number
  completed_at: string | null
  items: ClaireReviewItem[]
}

type ConceptRow = { slug: string; name_id: string; name_en: string }

function stripAnswer(item: ClaireItem, index: number): ClaireQuestion {
  const { answer: _answer, ...rest } = item
  return { ...rest, index }
}

// Deterministic-free shuffle: only used to vary which concepts appear; the
// per-question params carry the real freshness (fresh RNG seed each time).
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

async function pickConceptRows(): Promise<ConceptRow[]> {
  // Hardest available: grade-2's top band (difficulty 2) plus every
  // difficulty-3 concept (the genuinely hard grade-3 material).
  const rows = await query<ConceptRow>(
    `SELECT slug, name_id, name_en
       FROM wmi_concepts
      WHERE enabled = TRUE
        AND ((2 = ANY(grades) AND difficulty = 2) OR difficulty >= 3)`,
  )
  if (rows.length === 0) return []
  // Prefer distinct concepts; if the pool is smaller than a round, cycle it.
  const picked: ConceptRow[] = []
  let bag = shuffle(rows)
  while (picked.length < ROUND_SIZE) {
    if (bag.length === 0) bag = shuffle(rows)
    picked.push(bag.pop() as ConceptRow)
  }
  return picked
}

function generateItem(row: ConceptRow): ClaireItem | null {
  const concept = getConcept(row.slug) as ConceptLogic<unknown> | undefined
  if (!concept) return null
  for (let i = 0; i < MAX_GEN_RETRIES; i++) {
    const seed = Math.floor(Math.random() * 2_000_000_000)
    let params: unknown
    try {
      params = concept.generate(mulberry32(seed))
      concept.paramsSchema.parse(params)
    } catch (err) {
      console.error(`claire: generator failed for ${row.slug} seed=${seed}:`, err)
      continue
    }
    let r
    try {
      r = concept.render(params)
    } catch (err) {
      console.error(`claire: render failed for ${row.slug}:`, err)
      continue
    }
    return {
      concept_slug: row.slug,
      concept_name_id: row.name_id,
      concept_name_en: row.name_en,
      params,
      body_en: r.body_en,
      body_id: r.body_id,
      answer_type: r.answer_type,
      choices_en: r.choices_en ?? null,
      choices_id: r.choices_id ?? null,
      answer: r.answer,
      numeric_answer: /^-?\d+(\.\d+)?$/.test(r.answer.trim()),
      hint_en: r.hint_en ?? null,
      hint_id: r.hint_id ?? null,
      hint_steps_en: r.hint_steps_en ?? null,
      hint_steps_id: r.hint_steps_id ?? null,
      breakdown: r.breakdown ?? null,
    }
  }
  return null
}

export async function startClaireRound(
  parentUserId: string,
  childId: string,
): Promise<{ roundId: string; questions: ClaireQuestion[] }> {
  await ensureBootstrapped()
  return withTransaction(async (client) => {
    await assertChildOwnership(client, parentUserId, childId)

    const rows = await pickConceptRows()
    if (rows.length === 0) {
      throw new Error('Belum ada konsep untuk mode ini.')
    }
    const items: ClaireItem[] = []
    for (const row of rows) {
      const item = generateItem(row)
      if (item) items.push(item)
      if (items.length >= ROUND_SIZE) break
    }
    if (items.length === 0) {
      throw new Error('Gagal membuat soal. Coba lagi.')
    }

    const inserted = await queryOne<{ id: string }>(
      `INSERT INTO claire_drill_rounds (child_id, items, total)
       VALUES ($1, $2::jsonb, $3)
       RETURNING id`,
      [childId, JSON.stringify(items), items.length],
      client,
    )
    if (!inserted) throw new Error('Gagal memulai ronde.')

    return { roundId: inserted.id, questions: items.map(stripAnswer) }
  })
}

interface RoundRow {
  child_id: string
  items: ClaireItem[]
  responses: Record<string, { selected: string; is_correct: boolean }>
  total: number
}

export async function answerClaireRound(
  parentUserId: string,
  childId: string,
  roundId: string,
  index: number,
  selected: string,
): Promise<ClaireAnswerResult> {
  return withTransaction(async (client) => {
    await assertChildOwnership(client, parentUserId, childId)

    const round = await queryOne<RoundRow>(
      `SELECT child_id, items, responses, total
         FROM claire_drill_rounds
        WHERE id = $1 FOR UPDATE`,
      [roundId],
      client,
    )
    if (!round || round.child_id !== childId) {
      throw new Error('Ronde tidak ditemukan.')
    }
    if (index < 0 || index >= round.items.length) {
      throw new Error('Soal tidak valid.')
    }

    const item = round.items[index]
    const is_correct = isCorrectAnswer(item.answer, selected)

    const responses = { ...(round.responses ?? {}) }
    responses[String(index)] = { selected, is_correct }
    const allDone = Object.keys(responses).length >= round.items.length
    const score = allDone
      ? Object.values(responses).filter((r) => r.is_correct).length
      : null

    await client.query(
      `UPDATE claire_drill_rounds
          SET responses = $2::jsonb,
              score = $3::int,
              completed_at = CASE WHEN $3::int IS NOT NULL THEN COALESCE(completed_at, NOW()) ELSE completed_at END
        WHERE id = $1`,
      [roundId, JSON.stringify(responses), score],
    )

    return {
      is_correct,
      correct_answer: item.answer,
      hint_en: item.hint_en,
      hint_id: item.hint_id,
      done: allDone,
      score,
    }
  })
}

export async function getClaireHistory(
  parentUserId: string,
  childId: string,
): Promise<ClaireRoundSummary[]> {
  await assertChildOwnership(pool, parentUserId, childId)
  return query<ClaireRoundSummary>(
    `SELECT id, score, total, created_at, completed_at
       FROM claire_drill_rounds
      WHERE child_id = $1 AND completed_at IS NOT NULL
      ORDER BY completed_at DESC
      LIMIT 30`,
    [childId],
  )
}

// Per-round review: every question with the correct answer and what the child
// picked, so a parent can see the mistakes.
export async function getClaireRoundReview(
  parentUserId: string,
  childId: string,
  roundId: string,
): Promise<ClaireRoundReview> {
  await assertChildOwnership(pool, parentUserId, childId)
  const round = await queryOne<{
    id: string
    child_id: string
    items: ClaireItem[]
    responses: Record<string, { selected: string; is_correct: boolean }>
    score: number | null
    total: number
    completed_at: string | null
  }>(
    `SELECT id, child_id, items, responses, score, total, completed_at
       FROM claire_drill_rounds WHERE id = $1`,
    [roundId],
  )
  if (!round || round.child_id !== childId) {
    throw new Error('Ronde tidak ditemukan.')
  }
  const items: ClaireReviewItem[] = round.items.map((it, i) => {
    const resp = (round.responses ?? {})[String(i)]
    return {
      index: i,
      concept_name_id: it.concept_name_id,
      concept_name_en: it.concept_name_en,
      body_id: it.body_id,
      body_en: it.body_en,
      correct_answer: it.answer,
      selected: resp?.selected ?? null,
      is_correct: resp?.is_correct ?? null,
    }
  })
  return {
    id: round.id,
    score: round.score,
    total: round.total,
    completed_at: round.completed_at,
    items,
  }
}
