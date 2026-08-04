// Level ladder for equivalent-fraction-fill. Same param schema ({num, den, m});
// difficulty climbs by the size of the multiplier (the missing top number is
// num x m) and by the size of the starting fraction. num < den always, so the
// fraction stays proper.
//   L1: num = 1, so the answer IS the multiplier (2-4), tiny denominators
//   L2: num up to 2, multiplier still 2-4
//   L3: num up to 4, multiplier up to 5 — a real two-digit product appears
//   L4: bigger fractions (den 5-9), multiplier 4-6
//   L5: num 3-5 with multiplier 6-8 — largest products and new denominators
import type { Rng } from '../types.js'
import type { Params } from './index.js'

export function equivalentFractionFillLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    case 1: {
      const den = rng.int(2, 5)
      return { num: 1, den, m: rng.int(2, 4) }
    }
    case 2: {
      const den = rng.int(3, 6)
      return { num: rng.int(1, 2), den, m: rng.int(2, 4) }
    }
    case 3: {
      const den = rng.int(3, 7)
      return { num: rng.int(1, Math.min(den - 1, 4)), den, m: rng.int(2, 5) }
    }
    case 4: {
      const den = rng.int(5, 9)
      return { num: rng.int(2, Math.min(den - 1, 5)), den, m: rng.int(4, 6) }
    }
    case 5: {
      const den = rng.int(6, 9)
      return { num: rng.int(3, 5), den, m: rng.int(6, 8) }
    }
  }
}
