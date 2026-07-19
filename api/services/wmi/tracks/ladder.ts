//
// Pure ladder semantics (spec §Concept ladder / §Game loop). BROWSER-SAFE.
// One global rule everywhere — nothing here is per-track configurable.

export const GOLD_LEVEL = 5
export const GATE_BAR_LEVEL = 4
export const FOCUS_COUNT = 6
export const RECALL_COUNT = 2
export const LESSON_SIZE = FOCUS_COUNT + RECALL_COUNT

// Lesson pass reward (Plan 3 reward parity) — granted once per (child,
// concept, cleared level): commitLesson only fires this when a lesson
// session pushes levelAfter strictly past levelBefore, so replaying an
// already-cleared level (or replaying gold/L5) grants nothing.
export const LESSON_PASS_XP = 10
export const LESSON_PASS_COINS = 2

// Old-garden tier → ladder level, preserving unlock semantics: tier >= 3
// ("Mahir") counted as grown/gate-ready, so it lands ON the gate bar.
// 0→0, 1→1, 2→2, 3→4, 4→5. Level 3 is simply skipped for migrated progress.
export function mapTierToLevel(tier: number): number {
  const t = Math.max(0, Math.min(4, Math.trunc(tier)))
  return t >= 3 ? t + 1 : t
}

// Pass = at most 1 miss on the focus questions (never on recall questions).
// An empty result set is not a pass — no evidence, no level-up.
export function passesFocus(focusResults: readonly boolean[]): boolean {
  if (focusResults.length === 0) return false
  return focusResults.filter((r) => !r).length <= 1
}

// Stored `level` wins; a NULL level derives from the legacy tier at read
// time (the spec's migration mapping, applied lazily so coexistence never
// goes stale).
export function effectiveLevel(level: number | null, bestTier: number): number {
  return level ?? mapTierToLevel(bestTier)
}

// Track visibility gate: published tracks are visible to everyone; review
// tracks are admin-only (pilot/QA can see progress before rollout); draft
// tracks are invisible to everyone, including admins (routes must still
// resolve the track through the admin-only builder tools, not this path).
export function canViewTrack(status: 'draft' | 'review' | 'published', role: string | undefined): boolean {
  if (status === 'published') return true
  if (status === 'review') return role === 'admin'
  return false
}
