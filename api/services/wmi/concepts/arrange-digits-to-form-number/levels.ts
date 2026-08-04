// Level ladder for arrange-digits-to-form-number. Two dials the schema offers:
//   1. `rank` — how far in from the NEAREST end you must count. Rank 1 and 6 are
//      the two extremes (just take the two smallest / two largest digits); rank
//      3 and 4 force you to build and sort all six numbers.
//   2. digit spread — three digits far apart make the six numbers easy to keep
//      straight; three near-consecutive digits cluster them and invite slips.
// The ladder alternates depth then tightness: 1 → 2 → 2-tight → 3 → 3-tight.
import type { Rng } from '../types.js'
import type { Params } from './index.js'

/** Three distinct digits spanning at least 5 — the six numbers spread far apart. */
function wideDigits(rng: Rng): number[] {
  const lo = rng.int(1, 3)
  const hi = rng.int(lo + 5, 9)
  const mid = rng.int(lo + 1, hi - 1)
  return rng.shuffle([lo, mid, hi])
}

const TIGHT_OFFSETS: readonly (readonly number[])[] = [
  [0, 1, 2],
  [0, 1, 3],
  [0, 2, 3],
]

/** Three distinct digits inside a window of 2–3 — the six numbers bunch up. */
function tightDigits(rng: Rng): number[] {
  const base = rng.int(1, 6)
  return rng.shuffle(rng.pick(TIGHT_OFFSETS).map((o) => base + o))
}

export function arrangeDigitsToFormNumberLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    // L1: an extreme (smallest or largest) from three well-spread digits.
    case 1:
      return { digits: wideDigits(rng), rank: rng.pick([1, 6] as const) }
    // L2: one step in from an extreme — you must build a second number too.
    case 2:
      return { digits: wideDigits(rng), rank: rng.pick([2, 5] as const) }
    // L3: same step-in, but the digits are near-consecutive so the six crowd together.
    case 3:
      return { digits: tightDigits(rng), rank: rng.pick([2, 5] as const) }
    // L4: the middle ranks — no shortcut, all six numbers must be listed and sorted.
    case 4:
      return { digits: wideDigits(rng), rank: rng.pick([3, 4] as const) }
    // L5: middle rank over near-consecutive digits — hardest the schema allows.
    case 5:
      return { digits: tightDigits(rng), rank: rng.pick([3, 4] as const) }
  }
}
