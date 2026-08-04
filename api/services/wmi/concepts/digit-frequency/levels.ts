// Level ladder for digit-frequency. Same param schema ({a,b,d}); difficulty
// climbs by how long the tally runs and by how many PLACES the digit hides in:
//   L1: range stops under 20 and d ≥ 2, so every hit is a ones-place hit
//   L2: range reaches 40 — a whole tens-decade can now open up
//   L3: ~40 numbers wide, any digit, so the tally is long enough to lose count
//   L4: ~55 numbers wide AND the d-decade is inside the range — ones and tens both score
//   L5: ~70 numbers wide up to 99 and the repdigit dd sits inside the range, so one
//       number has to be counted twice
import type { Rng } from '../types.js'
import { countDigit } from './index.js'
import type { Params } from './index.js'

export function digitFrequencyLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    // Nothing above 23, and d ≥ 3 so the tens digits in sight (1 and 2) never
    // count — every hit is a ones-place hit, and there are at least two of them.
    case 1: {
      for (let t = 0; t < 60; t++) {
        const a = rng.int(1, 8)
        const b = a + rng.int(10, 15)
        const d = rng.int(3, 9)
        if (countDigit(a, b, d) >= 2) return { a, b, d }
      }
      return { a: 2, b: 15, d: 4 }
    }
    // Wider, and d may now be 1–3, whose decade can fall inside the range.
    case 2: {
      for (let t = 0; t < 40; t++) {
        const a = rng.int(1, 12)
        const b = a + rng.int(20, 28)
        const d = rng.int(1, 9)
        if (countDigit(a, b, d) >= 2) return { a, b, d }
      }
      return { a: 5, b: 30, d: 4 }
    }
    // A ~40-number sweep: too long to hold in your head without grouping by place.
    case 3: {
      for (let t = 0; t < 40; t++) {
        const a = rng.int(1, 20)
        const b = a + rng.int(33, 44)
        const d = rng.int(1, 9)
        if (countDigit(a, b, d) >= 4) return { a, b, d }
      }
      return { a: 6, b: 45, d: 3 }
    }
    // The d-decade (10d…10d+9) is guaranteed inside the range, so the tens place
    // contributes ten hits on top of the ones-place ones.
    case 4: {
      for (let t = 0; t < 60; t++) {
        const a = rng.int(1, 25)
        const b = a + rng.int(50, 64)
        const d = rng.int(1, 8)
        if (10 * d + 9 < a || 10 * d > b) continue
        return { a, b, d }
      }
      return { a: 4, b: 62, d: 5 }
    }
    // Widest sweep, and dd (11, 22, … 99) is always inside it: that one number
    // carries the digit twice, which is exactly the step children drop.
    case 5: {
      const d = rng.int(2, 9)
      const dd = 11 * d
      const a = rng.int(Math.max(1, dd - 90), Math.min(20, dd))
      const b = rng.int(Math.max(dd, a + 60), Math.min(99, a + 90))
      return { a, b, d }
    }
  }
}
