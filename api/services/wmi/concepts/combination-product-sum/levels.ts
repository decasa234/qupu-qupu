// Level ladder for combination-product-sum. The schema is a discriminated union
// of three modes, and the modes themselves form the spine of the ladder because
// they demand progressively more systematic enumeration:
//   L1: find-larger, x ≤ 4 and y ≤ 7 — a handful of sum-pairs to test
//   L2: find-larger, full range (y ≥ 8) — a long list of sum-pairs to test
//   L3: count-pairs — enumerate every divisor of N up to √N (N 12..360)
//   L4: find-sum, product < 500 — factor a 3-digit semiprime into two 2-digit
//       numbers by trial division (11, 13, 17, 19…)
//   L5: find-sum, product ≥ 900 — the same, with the larger prime pairs
// Named proxy: MODE_RANK × 10000 + magnitude (sum / N / product).
import type { Rng } from '../types.js'
import type { Params } from './index.js'
import { FIND_SUM_PRODUCTS, COUNT_PAIRS_PRODUCTS } from './constants.js'

export const MODE_RANK = { 'find-larger': 0, 'count-pairs': 1, 'find-sum': 2 } as const

const EASY_FIND_SUM = FIND_SUM_PRODUCTS
  .map((e, idx) => ({ ...e, idx }))
  .filter((e) => e.product < 500)
const HARD_FIND_SUM = FIND_SUM_PRODUCTS
  .map((e, idx) => ({ ...e, idx }))
  .filter((e) => e.product >= 900)

export function combinationProductSumLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    case 1: {
      // Small pair: sums 5..11, so only a few (a, b) sum-pairs to check.
      const x = rng.int(2, 4)
      return { mode: 'find-larger', x, y: rng.int(x + 1, 7) }
    }
    case 2: {
      // Larger pair: sums 10..21 and products up to 108 — a much longer list.
      const x = rng.int(2, 9)
      return { mode: 'find-larger', x, y: rng.int(Math.max(x + 1, 8), 12) }
    }
    case 3:
      // Divisor enumeration: every factor pair of N must be found, none missed.
      return { mode: 'count-pairs', idx: rng.int(0, COUNT_PAIRS_PRODUCTS.length - 1) }
    case 4:
      // Factor a 3-digit product into two 2-digit numbers, then add them.
      return { mode: 'find-sum', idx: rng.pick(EASY_FIND_SUM).idx }
    case 5:
      // Same, but the factors are big primes — trial division runs much longer.
      return { mode: 'find-sum', idx: rng.pick(HARD_FIND_SUM).idx }
  }
}
