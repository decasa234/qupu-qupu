// Level ladder for rectangle-area-grid. Same param schema (w ∈ 2..10,
// h ∈ 2..9); difficulty climbs by the size of the grid — how many unit squares
// must be accounted for, and how far past one-by-one counting the child has to
// move. Proxy: area = w × h.
//   L1: 4–9   L2: 8–20   L3: 15–35   L4: 30–63   L5: 56–90
import type { Rng } from '../types.js'
import type { Params } from './index.js'

export function rectangleAreaGridLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    // L1: at most 9 squares — a child can literally count every square
    case 1: return { w: rng.int(2, 3), h: rng.int(2, 3) }
    // L2: ≤ 20 squares — skip-counting rows of 4 or 5 beats counting one by one
    case 2: return { w: rng.int(4, 5), h: rng.int(2, 4) }
    // L3: mid grid — needs a real multiplication fact (up to 7 × 5)
    case 3: return { w: rng.int(5, 7), h: rng.int(3, 5) }
    // L4: both dimensions past 4 — two-digit products up to 63
    case 4: return { w: rng.int(6, 9), h: rng.int(5, 7) }
    // L5: the largest grid the schema allows — products up to 10 × 9 = 90
    case 5: return { w: rng.int(8, 10), h: rng.int(7, 9) }
  }
}
