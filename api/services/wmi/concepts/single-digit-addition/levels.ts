// Level ladder for single-digit-addition. Same param schema ({a,b} ∈ 1..9);
// difficulty climbs by operand size and ten-bridging:
//   L1: both ≤ 4, no bridge (sum ≤ 8)     L2: both ≤ 6
//   L3: any operands, sum ≤ 10            L4: always bridges ten (sum ≥ 11)
//   L5: always bridges, both operands ≥ 5 (hardest single-digit facts)
import type { Rng } from '../types.js'
import type { Params } from './index.js'

export function singleDigitAdditionLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    case 1: return { a: rng.int(1, 4), b: rng.int(1, 4) }
    case 2: return { a: rng.int(1, 6), b: rng.int(1, 6) }
    case 3: {
      const a = rng.int(1, 9)
      return { a, b: rng.int(1, Math.max(1, 10 - a)) }
    }
    case 4: {
      const a = rng.int(2, 9)
      return { a, b: rng.int(Math.max(1, 11 - a), 9) }
    }
    case 5: {
      const a = rng.int(5, 9)
      return { a, b: rng.int(Math.max(5, 11 - a), 9) }
    }
  }
}
