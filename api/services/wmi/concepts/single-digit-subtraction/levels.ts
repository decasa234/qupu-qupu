// Level ladder for single-digit-subtraction. Same param schema
// ({a,b}, a 2..9 > b 1..8); difficulty climbs by minuend size and fact
// difficulty:
//   L1: small whole (a ≤ 5)              L2: medium whole (a 4..7)
//   L3: big whole, small take (b ≤ 3)    L4: close pair (difference ≤ 3)
//   L5: big whole AND big take (a ≥ 7, b ≥ 4) — hardest single-digit facts
import type { Rng } from '../types.js'
import type { Params } from './index.js'

export function singleDigitSubtractionLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    case 1: {
      const a = rng.int(2, 5)
      return { a, b: rng.int(1, a - 1) }
    }
    case 2: {
      const a = rng.int(4, 7)
      return { a, b: rng.int(1, a - 1) }
    }
    case 3: {
      const a = rng.int(6, 9)
      return { a, b: rng.int(1, 3) }
    }
    case 4: {
      const a = rng.int(6, 9)
      return { a, b: rng.int(a - 3, a - 1) }
    }
    case 5: {
      const a = rng.int(7, 9)
      return { a, b: rng.int(4, a - 1) }
    }
  }
}
