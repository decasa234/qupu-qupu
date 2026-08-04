// Level ladder for assignment-cycle. Same param schema ({cycle,n}); difficulty
// climbs by how far around the circle you must count — more full trips to
// skip-count before the leftover, and longer cycles to skip-count in.
// Difficulty proxy = n (the position asked for); trips = floor(n / cycle).
//   L1: cycle 3–4, n 6–14   (2–4 trips, countable on fingers)
//   L2: cycle 3–5, n 15–24  L3: cycle 3–5, n 25–36
//   L4: cycle 3–5, n 37–48  L5: cycle 4–5, n 49–60 (up to 20 trips)
// NOTE: the whole schema admits only 3 × 55 = 165 distinct params, so the levels
// below are close to the maximum variety this concept can offer.
import type { Rng } from '../types.js'
import type { Params } from './index.js'

export function assignmentCycleLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    // L1 — short cycle, a handful of students: skip-count 3, 6, 9 then step on.
    case 1: return { cycle: rng.int(3, 4), n: rng.int(6, 14) }
    // L2 — cycles up to 5 letters; the skip-count is still short.
    case 2: return { cycle: rng.int(3, 5), n: rng.int(15, 24) }
    // L3 — past 24: the multiples list stops fitting in the head one at a time.
    case 3: return { cycle: rng.int(3, 5), n: rng.int(25, 36) }
    // L4 — 8–16 full trips before the leftover.
    case 4: return { cycle: rng.int(3, 5), n: rng.int(37, 48) }
    // L5 — the longest cycles at the far end of the schema's range.
    case 5: return { cycle: rng.int(4, 5), n: rng.int(49, 60) }
  }
}
