// Level ladder for shape-perimeter-square. The schema carries a SINGLE lever —
// `side` ∈ 2..9 — so difficulty can only climb by the size of the side (and of
// the 4× fact it forces). Proxy: side (perimeter = 4 × side).
//   L1: side 2–3   L2: side 4–5   L3: side 6–7   L4: side 8   L5: side 9
// Rungs 4 and 5 are single values because the schema tops out at 9.
import type { Rng } from '../types.js'
import type { Params } from './index.js'

export function shapePerimeterSquareLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    // L1: tiny square — perimeter 8 or 12, small enough to count around the edge
    case 1: return { side: rng.int(2, 3) }
    // L2: 4× a small side — perimeter 16 or 20, still a friendly doubling-twice
    case 2: return { side: rng.int(4, 5) }
    // L3: perimeter 24 or 28 — the 4× fact now lands past two tens
    case 3: return { side: rng.int(6, 7) }
    // L4: perimeter 32 — a 4× fact most 7-year-olds must build, not recall
    case 4: return { side: 8 }
    // L5: perimeter 36 — the largest square the schema allows
    case 5: return { side: 9 }
  }
}
