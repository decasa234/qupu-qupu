// Level ladder for shape-perimeter-rectangle. Same param schema (w, h ∈ 2..15,
// w ≠ h); difficulty climbs by the size of w + h, i.e. by the perimeter
// 2 × (w + h) the child has to double. Proxy: perimeter.
//   L1: ≤ 18   L2: ≤ 24   L3: 20–34   L4: ≥ 32   L5: ≥ 42 (both sides ≥ 10)
import type { Rng } from '../types.js'
import type { Params } from './index.js'

/** A side in [lo, hi] that is not `not` — the schema forbids w === h. */
function otherSide(rng: Rng, lo: number, hi: number, not: number): number {
  const options: number[] = []
  for (let v = lo; v <= hi; v++) if (v !== not) options.push(v)
  return rng.pick(options)
}

export function shapePerimeterRectangleLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    // L1: both sides ≤ 5 — perimeter ≤ 18, four single-digit sides to add
    case 1: {
      const w = rng.int(2, 5)
      return { w, h: otherSide(rng, 2, 5, w) }
    }
    // L2: single-digit sides with w + h ≤ 12 — doubling stays under 25
    case 2: {
      const w = rng.int(2, 9)
      return { w, h: otherSide(rng, 2, Math.min(9, 12 - w), w) }
    }
    // L3: one side may pass ten; w + h is a teen, so the double crosses 20–34
    case 3: {
      const w = rng.int(5, 12)
      return { w, h: otherSide(rng, Math.max(2, 10 - w), Math.min(12, 17 - w), w) }
    }
    // L4: both sides ≥ 6 and w + h ≥ 16 — doubling a two-digit sum with a carry
    case 4: {
      const w = rng.int(6, 15)
      return { w, h: otherSide(rng, Math.max(6, 16 - w), 15, w) }
    }
    // L5: both sides ≥ 10 — the biggest rectangle the schema allows (perimeter ≥ 42)
    case 5: {
      const w = rng.int(10, 15)
      return { w, h: otherSide(rng, 10, 15, w) }
    }
  }
}
