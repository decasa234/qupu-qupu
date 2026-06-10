import type { PoolClient } from 'pg'
import { computeComprehension } from './comprehension.js'

const RECENT_KEEP = 10

// Row shape as stored in wmi_concept_progress (snake_case mirrors the table).
export interface ConceptProgressState {
  attempts: number
  correct: number
  recent: boolean[]
  best_tier: number
  comprehension_pct: number
}

export const EMPTY_PROGRESS: ConceptProgressState = {
  attempts: 0, correct: 0, recent: [], best_tier: 0, comprehension_pct: 0,
}

export interface ConceptProgressNext extends ConceptProgressState {
  current_streak: number
}

// Pure fold: applying [a, b, c] in one call produces EXACTLY the same state
// as three sequential single-answer upserts (each step recomputes
// comprehension on the running window; best_tier/comprehension_pct take the
// max across ALL intermediate steps because the recent window can slide a
// concept back down — a single end-state computation would miss the peak).
export function applyAnswers(
  prev: ConceptProgressState,
  results: boolean[],
): ConceptProgressNext {
  let attempts = prev.attempts
  let correct = prev.correct
  let recent = [...(prev.recent ?? [])]
  let bestTier = prev.best_tier
  let bestPct = prev.comprehension_pct
  let streak = 0
  for (const isCorrect of results) {
    recent = [...recent, isCorrect].slice(-RECENT_KEEP)
    attempts += 1
    correct += isCorrect ? 1 : 0
    const c = computeComprehension({ attempts, correct, recent })
    bestTier = Math.max(bestTier, c.tier)
    bestPct = Math.max(bestPct, c.pct)
    streak = c.streak
  }
  return {
    attempts,
    correct,
    recent,
    best_tier: bestTier,
    comprehension_pct: bestPct,
    current_streak: streak,
  }
}

// Reads (and row-locks) the progress rows for all touched concepts in ONE
// query. Missing rows simply aren't in the map — callers fall back to
// EMPTY_PROGRESS. Runs inside the caller's transaction.
export async function lockConceptProgress(
  client: PoolClient,
  childId: string,
  conceptSlugs: string[],
): Promise<Map<string, ConceptProgressState>> {
  if (conceptSlugs.length === 0) return new Map()
  const res = await client.query<ConceptProgressState & { concept_slug: string }>(
    `SELECT concept_slug, attempts, correct, recent, best_tier, comprehension_pct
     FROM wmi_concept_progress
     WHERE child_id = $1 AND concept_slug = ANY($2::text[]) FOR UPDATE`,
    [childId, conceptSlugs],
  )
  const out = new Map<string, ConceptProgressState>()
  for (const row of res.rows) {
    out.set(row.concept_slug, {
      attempts: Number(row.attempts),
      correct: Number(row.correct),
      recent: row.recent ?? [],
      best_tier: Number(row.best_tier),
      comprehension_pct: Number(row.comprehension_pct),
    })
  }
  return out
}

// ONE multi-row upsert for any number of concepts. GREATEST guards keep
// best_tier/comprehension_pct monotonic even if a row slipped past the lock.
export async function upsertConceptProgressRows(
  client: PoolClient,
  childId: string,
  rows: { conceptSlug: string; next: ConceptProgressNext }[],
): Promise<void> {
  if (rows.length === 0) return
  const params: unknown[] = [childId]
  const values = rows.map(({ conceptSlug, next }) => {
    const base = params.length
    params.push(
      conceptSlug, next.attempts, next.correct, next.current_streak,
      JSON.stringify(next.recent), next.best_tier, next.comprehension_pct,
    )
    return `($1, $${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}::jsonb, $${base + 6}, $${base + 7}, NOW())`
  })
  await client.query(
    `INSERT INTO wmi_concept_progress
       (child_id, concept_slug, attempts, correct, current_streak, recent, best_tier, comprehension_pct, updated_at)
     VALUES ${values.join(', ')}
     ON CONFLICT (child_id, concept_slug) DO UPDATE SET
       attempts = EXCLUDED.attempts, correct = EXCLUDED.correct,
       current_streak = EXCLUDED.current_streak, recent = EXCLUDED.recent,
       best_tier = GREATEST(wmi_concept_progress.best_tier, EXCLUDED.best_tier),
       comprehension_pct = GREATEST(wmi_concept_progress.comprehension_pct, EXCLUDED.comprehension_pct),
       updated_at = NOW()`,
    params,
  )
}

// Upserts the materialized per-(child, concept) comprehension. Monotonic:
// best_tier and comprehension_pct never decrease. Runs inside the caller's tx.
export async function upsertConceptProgress(
  client: PoolClient,
  childId: string,
  conceptSlug: string,
  isCorrect: boolean,
): Promise<void> {
  const locked = await lockConceptProgress(client, childId, [conceptSlug])
  const prev = locked.get(conceptSlug) ?? EMPTY_PROGRESS
  const next = applyAnswers(prev, [isCorrect])
  await upsertConceptProgressRows(client, childId, [{ conceptSlug, next }])
}
