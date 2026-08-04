// Level ladder for multiplication-small. Same param schema ({a,b} ∈ 2..5), so
// the whole concept admits only 16 distinct instances; the ladder climbs on the
// product (the times-table facts a child must have memorised):
//   L1: both ≤ 3 — the ×2/×3 tables (product ≤ 9)
//   L2: both ≤ 4 — adds the ×4 table (product ≤ 16)
//   L3: any factor 2..5 except 5×5 — introduces the ×5 table (product ≤ 20)
//   L4: product ≥ 12 — the upper half of the tables
//   L5: both factors ≥ 4 — 4×4 … 5×5, the largest facts the schema allows
import type { Rng } from '../types.js'
import type { Params } from './index.js'

export function multiplicationSmallLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    case 1: return { a: rng.int(2, 3), b: rng.int(2, 3) }
    case 2: return { a: rng.int(2, 4), b: rng.int(2, 4) }
    case 3: {
      // Rejection sample so the ×5 facts appear but 5×5 is held back for L5.
      let a = rng.int(2, 5)
      let b = rng.int(2, 5)
      for (let i = 0; i < 30 && a * b > 20; i++) {
        a = rng.int(2, 5)
        b = rng.int(2, 5)
      }
      return a * b <= 20 ? { a, b } : { a: 3, b: 5 }
    }
    case 4: {
      let a = rng.int(3, 5)
      let b = rng.int(3, 5)
      for (let i = 0; i < 30 && a * b < 12; i++) {
        a = rng.int(3, 5)
        b = rng.int(3, 5)
      }
      return a * b >= 12 ? { a, b } : { a: 4, b: 3 }
    }
    case 5: return { a: rng.int(4, 5), b: rng.int(4, 5) }
  }
}
