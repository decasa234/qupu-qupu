// Level ladder for missing-addend. Same param schema (a 5..60, b 3..40); the
// child always undoes "+ b" by subtracting it from the printed total, so
// difficulty climbs by the size of that total, with bridging-a-ten staged inside
// it (a clean two-digit take-away is harder than a small bridging one):
//   L1: total ≤ 12, single-digit take-away
//   L2: teen total, take-away stays inside the ten (no bridging)
//   L3: total in the twenties, take-away bridges a ten
//   L4: two-digit total (40s–60s), two-digit take-away, no bridging
//   L5: two-digit total (70s–90s), two-digit take-away that bridges a ten
// Note the schema floors (a ≥ 5, b ≥ 3) put the smallest possible total at 8,
// so L1 cannot be made entirely bridge-free without shrinking to three facts.
import type { Rng } from '../types.js'
import type { Params } from './index.js'

export function missingAddendLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    case 1: {
      const a = rng.int(5, 9)
      return { a, b: rng.int(3, 12 - a) }
    }
    case 2: {
      // ones digits sum to ≤ 9, so the subtraction never reaches back for a ten.
      const b = rng.int(3, 6)
      return { a: 10 + rng.int(0, 9 - b), b }
    }
    case 3: {
      // total's ones digit is deliberately below b, so the take-away must bridge.
      const b = rng.int(4, 9)
      const total = 20 + rng.int(0, b - 1)
      return { a: total - b, b }
    }
    case 4: {
      // both numbers two-digit, ones digits still sum to ≤ 9 — no bridging.
      const bOnes = rng.int(1, 4)
      return { a: rng.int(2, 3) * 10 + rng.int(0, 9 - bOnes), b: rng.int(2, 3) * 10 + bOnes }
    }
    case 5: {
      // ones digits sum to ≥ 10, so undoing the addition must bridge a ten.
      const bOnes = rng.int(3, 9)
      return { a: rng.int(4, 5) * 10 + rng.int(10 - bOnes, 9), b: rng.int(2, 3) * 10 + bOnes }
    }
  }
}
