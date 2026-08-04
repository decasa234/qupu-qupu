// Level ladder for more-or-less-by-k. Same param schema (x ∈ 1..200, k ∈ 1..50,
// and `less` never goes below zero); difficulty climbs by the size of x, the
// size of k, and — from L4 — by forcing the step to bridge a ten (carry/borrow)
// instead of staying inside one.
import type { Rng } from '../types.js'
import type { Params } from './index.js'

/**
 * Builds a bridging pair: for `more` the ones digits carry past ten, for `less`
 * the ones digit of k is bigger than the ones digit of x so you must borrow.
 */
function bridging(rng: Rng, xTensLo: number, xTensHi: number, kTensLo: number, kTensHi: number): Params {
  const dir = rng.pick(['more', 'less'] as const)
  const xo = dir === 'more' ? rng.int(1, 9) : rng.int(1, 8)
  const x = rng.int(xTensLo, xTensHi) * 10 + xo
  const ko = dir === 'more' ? rng.int(10 - xo, 9) : rng.int(xo + 1, 9)
  return { x, k: rng.int(kTensLo, kTensHi) * 10 + ko, dir }
}

export function moreOrLessByKLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    // L1: counting on from a small number by a handful — always adding.
    case 1:
      return { x: rng.int(5, 15), k: rng.int(1, 4), dir: 'more' }
    // L2: same small numbers, but now "less" can be asked too.
    case 2:
      return { x: rng.int(16, 30), k: rng.int(2, 9), dir: rng.pick(['more', 'less'] as const) }
    // L3: two-digit x and a two-digit-sized step.
    case 3:
      return { x: rng.int(31, 60), k: rng.int(5, 20), dir: rng.pick(['more', 'less'] as const) }
    // L4: x past 60 and the step always bridges a ten (a carry or a borrow).
    case 4:
      return bridging(rng, 6, 11, 1, 3)
    // L5: x past 120 with the largest steps the schema allows, still bridging.
    case 5:
      return bridging(rng, 12, 19, 3, 4)
  }
}
