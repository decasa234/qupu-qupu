// Level ladder for fraction-of-region. The schema is only two numbers
// ({parts ≤ 8, shaded < parts}), so the ladder can climb on just two things: how
// many equal parts there are to count, and how "middling" the shaded run is —
// "all but one" is seen, 8 − 5 has to be worked out:
//   L1: 2-3 parts, 1 shaded   L2: 4 parts (quarters), 1-3 shaded
//   L3: 5-6 parts             L4: 7-8 parts
//   L5: 8 parts with 3-5 shaded — the leftover is neither one nor almost all
import type { Rng } from '../types.js'
import type { Params } from './index.js'

export function fractionOfRegionLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    // L1 — halves or thirds, one shaded: the answer can be pointed at.
    case 1: return { parts: rng.int(2, 3), shaded: 1 }
    // L2 — quarters; the shaded run can now be more than one part.
    case 2: return { parts: 4, shaded: rng.int(1, 3) }
    // L3 — five or six parts to count before subtracting.
    case 3: {
      const parts = rng.int(5, 6)
      return { parts, shaded: rng.int(1, parts - 1) }
    }
    // L4 — the largest shapes the schema allows: seven or eight parts.
    case 4: {
      const parts = rng.int(7, 8)
      return { parts, shaded: rng.int(1, parts - 1) }
    }
    // L5 — eight parts with a middling shaded run: neither the shaded nor the
    // unshaded side can be taken in at a glance, so 8 − shaded must be computed.
    case 5: return { parts: 8, shaded: rng.int(3, 5) }
  }
}
