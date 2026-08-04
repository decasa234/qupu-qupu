// Level ladder for arithmetic-expression-eval. Two dials: how many
// multiplications the expression hides (order of operations), and how big the
// numbers being carried are.
// Difficulty proxy: 10 × (multiplications) + 2 × (terms) + (largest number seen) / 10.
//   L1: four single-digit numbers added — no precedence to worry about
//   L2: one small product, then an add — precedence appears, table facts ≤ 25
//   L3: four two-digit numbers added — regrouping four times over
//   L4: one hard product (6–9 × 6–9) plus a two-digit number
//   L5: two products, then a subtraction — the most operations the schema allows
import type { Rng } from '../types.js'
import type { Params } from './index.js'

export function arithmeticExpressionEvalLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    case 1:
      return { mode: 'sum-list', a: rng.int(2, 9), b: rng.int(2, 9), c: rng.int(2, 9), d: rng.int(2, 9) }
    case 2:
      return { mode: 'product-plus', a: rng.int(2, 5), b: rng.int(2, 5), c: rng.int(5, 20), d: 1 }
    case 3:
      return { mode: 'sum-list', a: rng.int(11, 49), b: rng.int(11, 49), c: rng.int(11, 49), d: rng.int(11, 49) }
    case 4:
      return { mode: 'product-plus', a: rng.int(6, 9), b: rng.int(6, 9), c: rng.int(20, 60), d: 1 }
    case 5: {
      // Keep the first product the larger one so the difference stays ≥ 0.
      let a = rng.int(6, 9)
      let b = rng.int(6, 9)
      let c = rng.int(3, 9)
      let d = rng.int(3, 9)
      if (a * b < c * d) {
        ;[a, c] = [c, a]
        ;[b, d] = [d, b]
      }
      return { mode: 'product-diff', a, b, c, d }
    }
  }
}
