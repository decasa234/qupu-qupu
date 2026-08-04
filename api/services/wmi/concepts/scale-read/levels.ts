// Level ladder for scale-read. Same param schema ({max, value}); the stem text
// is constant, so ALL the difficulty lives in the drawn scale: 10 divisions with
// every other one numbered (a numbered step of max/5), the arrow always parked
// on a half-mark between two numbered marks.
//
// INVARIANT at every rung (the illustration, the hint and the breakdown note all
// assume it): max is a multiple of 10, and value = (max/10) × an ODD number, so
// the arrow is exactly halfway between two numbered marks and both marks are
// whole numbers.
//
// The dial is the roundness of the numbered step — how hard it is to halve the
// gap between two labels (named proxy: HALF_STEP_RANK below):
//   L1: max 50/100 → half-steps 5/10, labels are multiples of 10 or 20
//   L2: max 20/40  → half-steps 2/4, small labels but no longer multiples of 10
//   L3: max 60/80  → half-steps 6/8, two-digit labels to halve
//   L4: max 30/90  → half-steps 3/9, the answer comes out odd
//   L5: max 70     → half-step 7, labels 0/14/28/42/56/70 — the awkward table
import type { Rng } from '../types.js'
import type { Params } from './index.js'

// Ordinal difficulty of a half-step (max/10), easiest first: 10, 5, 2, 4, 6, 8, 3, 9, 7.
export const HALF_STEP_RANK: Readonly<Record<number, number>> = {
  10: 1, 5: 1, 2: 2, 4: 2, 6: 3, 8: 3, 3: 4, 9: 4, 7: 5,
}

const ODD_DIVISIONS = [1, 3, 5, 7, 9] as const

function build(rng: Rng, maxes: readonly number[]): Params {
  const max = rng.pick(maxes)
  const value = (max / 10) * rng.pick(ODD_DIVISIONS)
  return { max, value }
}

export function scaleReadLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    case 1: return build(rng, [50, 100])
    case 2: return build(rng, [20, 40])
    case 3: return build(rng, [60, 80])
    case 4: return build(rng, [30, 90])
    case 5: return build(rng, [70])
  }
}
