// Level ladder for sum-partition-split. Same param schema ({small, k}); the total
// handed to the child is (k+1) × small, so difficulty climbs on two axes — how
// many equal parts the total splits into, and how big that total is:
//   L1: k = 2      — three equal parts, total ≤ 54
//   L2: k = 2–3    — up to four parts
//   L3: k = 3–4    — five parts, totals into three digits
//   L4: k = 4–5    — six parts, totals past 150
//   L5: k = 5      — six parts of a total up to 240 (the hardest division the schema allows)
import type { Rng } from '../types.js'
import type { Params } from './index.js'

export function sumPartitionSplitLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    case 1:
      return { small: rng.int(2, 18), k: 2 }
    case 2:
      return { small: rng.int(6, 20), k: rng.int(2, 3) }
    case 3:
      return { small: rng.int(10, 24), k: rng.int(3, 4) }
    case 4:
      return { small: rng.int(14, 32), k: rng.int(4, 5) }
    case 5:
      return { small: rng.int(20, 40), k: 5 }
  }
}
