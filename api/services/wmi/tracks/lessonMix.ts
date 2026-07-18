// Pure lesson-mix logic (Task 7 / staleness-first recall). BROWSER-SAFE.
export interface RecallCandidate {
  slug: string
  level: number
  lastPracticedMs: number
}

// Picks the `count` LEAST-recently-practiced candidates (oldest
// lastPracticedMs first) — staleness-first recall keeps the concepts a
// child hasn't touched in a while surfacing before ones they just did.
export function pickRecall(candidates: RecallCandidate[], count: number): RecallCandidate[] {
  return [...candidates]
    .sort((a, b) => a.lastPracticedMs - b.lastPracticedMs)
    .slice(0, Math.max(0, count))
}
