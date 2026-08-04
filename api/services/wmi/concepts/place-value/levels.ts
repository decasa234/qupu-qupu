// Level ladder for place-value. The schema carries a single param (n ∈ 10..99),
// so the rungs come from the two things that genuinely change the difficulty of
// "what is the VALUE of the tens digit": whether there is a ones digit at all,
// and whether that ones digit outranks the tens digit (the loudest-digit pull).
// Magnitude separates the rest. Difficulty proxy: (ones ? 2 : 0) + (ones > tens ? 3 : 0) + tens/10.
//   L1: round ten (ones = 0) — the value IS the number
//   L2: small tens, ones < tens — a ones digit appears but never competes
//   L3: large tens, ones < tens — same reading, bigger value
//   L4: ones > tens, small tens — the loudest digit is the WRONG one
//   L5: ones > tens AND large tens — loudest-wrong digit at the top of the range
import type { Rng } from '../types.js'
import type { Params } from './index.js'

export function placeValueLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    case 1:
      return { n: rng.int(1, 9) * 10 }
    case 2: {
      const tens = rng.int(2, 5)
      return { n: tens * 10 + rng.int(1, tens - 1) }
    }
    case 3: {
      const tens = rng.int(6, 9)
      return { n: tens * 10 + rng.int(1, tens - 1) }
    }
    case 4: {
      const tens = rng.int(1, 4)
      return { n: tens * 10 + rng.int(tens + 1, 9) }
    }
    case 5: {
      const tens = rng.int(5, 8)
      return { n: tens * 10 + rng.int(tens + 1, 9) }
    }
  }
}
