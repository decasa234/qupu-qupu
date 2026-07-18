// Pure lesson-mix logic (Task 7 / staleness-first recall). BROWSER-SAFE.
import { GOLD_LEVEL, effectiveLevel } from './ladder.js'

export interface RecallCandidate {
  slug: string
  level: number
  lastPracticedMs: number
}

// Progress shape buildRecallCandidates needs per slug. `updated_at` is
// `string | Date` because callers may pass either a raw pg TIMESTAMPTZ
// (Date) or a serialized value (string) — new Date(value) coerces both.
export interface RecallProgressInput {
  level: number | null
  best_tier: number
  updated_at: string | Date
}

// Recall candidates: spine concepts strictly BEFORE the focus concept that
// the child has cleared at least level 1 of. Pure so it can be unit-tested
// independently of the single-concept track the DB currently has registered
// (see lesson.ts, which owns the SQL/progress lookup and calls this).
export function buildRecallCandidates(
  spine: string[],
  focusIdx: number,
  progressBySlug: Map<string, RecallProgressInput>,
): RecallCandidate[] {
  return spine.slice(0, focusIdx).flatMap((slug) => {
    const p = progressBySlug.get(slug)
    const level = effectiveLevel(p?.level ?? null, p?.best_tier ?? 0)
    return level >= 1
      ? [{ slug, level: Math.min(level, GOLD_LEVEL), lastPracticedMs: p ? new Date(p.updated_at).getTime() : 0 }]
      : []
  })
}

// Picks the `count` LEAST-recently-practiced candidates (oldest
// lastPracticedMs first) — staleness-first recall keeps the concepts a
// child hasn't touched in a while surfacing before ones they just did.
export function pickRecall(candidates: RecallCandidate[], count: number): RecallCandidate[] {
  return [...candidates]
    .sort((a, b) => a.lastPracticedMs - b.lastPracticedMs)
    .slice(0, Math.max(0, count))
}
