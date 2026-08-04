// Level ladder for product-of-consecutive. Same param schema ({k} ∈ 3..20), so
// the whole concept admits only 18 distinct instances — every rung is narrow.
// Difficulty climbs on the product k×(k+1) the child has to un-multiply:
//   L1: k 3..5   → products 12..30, recognisable from the times tables
//   L2: k 5..8   → products 30..72, still a table fact
//   L3: k 8..12  → products 72..156, past the tables — needs the √ estimate
//   L4: k 12..16 → products 156..272, three-digit √ estimation
//   L5: k 16..20 → products 272..420, the largest the schema allows
import type { Rng } from '../types.js'
import type { Params } from './index.js'

export function productOfConsecutiveLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    case 1: return { k: rng.int(3, 5) }
    case 2: return { k: rng.int(5, 8) }
    case 3: return { k: rng.int(8, 12) }
    case 4: return { k: rng.int(12, 16) }
    case 5: return { k: rng.int(16, 20) }
  }
}
