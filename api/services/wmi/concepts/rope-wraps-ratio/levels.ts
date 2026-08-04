// Level ladder for rope-wraps-ratio. Same param schema ({aWraps, bWraps,
// bSecond}). Two invariants generate() proves are kept at every rung:
//   • bSecond = bWraps × f with f a WHOLE number ≥ 2, so the answer f × aWraps
//     is whole and the hint's "×f as many" is a whole scale factor;
//   • aWraps < bWraps, because the story says B is the thinner pillar.
// With bSecond capped at 18 those two rules admit only 35 instances in total, so
// the ladder climbs on structure, not size:
//   L1: bWraps is a multiple of aWraps and the rope doubles — "A is half of B"
//   L2: still a clean multiple, but the rope triples/quadruples
//   L3: ratio no longer reduces (4:5, 5:6 …), rope doubles — must scale both sides
//   L4: ratio does not reduce AND the B-count is 7/8/9 — bigger, uglier ratio
//   L5: neither reduces nor doubles — an un-reducible ratio scaled by 3 or 4
import type { Rng } from '../types.js'
import type { Params } from './index.js'

/** [aWraps, bWraps, f] — bSecond is bWraps × f, so the answer is f × aWraps. */
type Triple = readonly [number, number, number]

const L1: readonly Triple[] = [
  [2, 4, 2],
  [2, 6, 2],
  [2, 8, 2],
  [3, 6, 2],
  [3, 9, 2],
]
const L2: readonly Triple[] = [
  [2, 4, 3],
  [2, 4, 4],
  [2, 6, 3],
  [3, 6, 3],
  [4, 8, 2],
]
const L3: readonly Triple[] = [
  [3, 4, 2],
  [2, 5, 2],
  [3, 5, 2],
  [4, 5, 2],
  [4, 6, 2],
  [5, 6, 2],
]
const L4: readonly Triple[] = [
  [2, 7, 2],
  [3, 7, 2],
  [4, 7, 2],
  [5, 7, 2],
  [6, 7, 2],
  [3, 8, 2],
  [5, 8, 2],
  [6, 8, 2],
  [2, 9, 2],
  [4, 9, 2],
  [5, 9, 2],
  [6, 9, 2],
]
const L5: readonly Triple[] = [
  [3, 4, 3],
  [3, 4, 4],
  [2, 5, 3],
  [3, 5, 3],
  [4, 5, 3],
  [4, 6, 3],
  [5, 6, 3],
]

const POOLS: Record<1 | 2 | 3 | 4 | 5, readonly Triple[]> = { 1: L1, 2: L2, 3: L3, 4: L4, 5: L5 }

export function ropeWrapsRatioLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  const [aWraps, bWraps, f] = rng.pick(POOLS[level])
  return { aWraps, bWraps, bSecond: bWraps * f }
}
