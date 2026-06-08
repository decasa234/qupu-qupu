import type { PoolClient } from 'pg'
import { computeComprehension } from './comprehension.js'

const RECENT_KEEP = 10

interface ProgressRow {
  attempts: number
  correct: number
  recent: boolean[]
  best_tier: number
  comprehension_pct: number
}

// Upserts the materialized per-(child, concept) comprehension. Monotonic:
// best_tier and comprehension_pct never decrease. Runs inside the caller's tx.
export async function upsertConceptProgress(
  client: PoolClient,
  childId: string,
  conceptSlug: string,
  isCorrect: boolean,
): Promise<void> {
  const existing = await client.query<ProgressRow>(
    `SELECT attempts, correct, recent, best_tier, comprehension_pct
     FROM wmi_concept_progress WHERE child_id = $1 AND concept_slug = $2 FOR UPDATE`,
    [childId, conceptSlug],
  )
  const prev: ProgressRow = existing.rows[0] ?? {
    attempts: 0, correct: 0, recent: [], best_tier: 0, comprehension_pct: 0,
  }
  const recent = [...(prev.recent ?? []), isCorrect].slice(-RECENT_KEEP)
  const attempts = prev.attempts + 1
  const correct = prev.correct + (isCorrect ? 1 : 0)
  const c = computeComprehension({ attempts, correct, recent })
  const bestTier = Math.max(prev.best_tier, c.tier)
  const bestPct = Math.max(prev.comprehension_pct, c.pct)

  await client.query(
    `INSERT INTO wmi_concept_progress
       (child_id, concept_slug, attempts, correct, current_streak, recent, best_tier, comprehension_pct, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,$8,NOW())
     ON CONFLICT (child_id, concept_slug) DO UPDATE SET
       attempts = EXCLUDED.attempts, correct = EXCLUDED.correct,
       current_streak = EXCLUDED.current_streak, recent = EXCLUDED.recent,
       best_tier = GREATEST(wmi_concept_progress.best_tier, EXCLUDED.best_tier),
       comprehension_pct = GREATEST(wmi_concept_progress.comprehension_pct, EXCLUDED.comprehension_pct),
       updated_at = NOW()`,
    [childId, conceptSlug, attempts, correct, c.streak, JSON.stringify(recent), bestTier, bestPct],
  )
}
