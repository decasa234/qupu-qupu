// Level ladder for build-number-from-digit-clues. Building the number from the
// digit clues is the same work at every rung; what climbs is the counting step
// afterwards — its size, its direction, and whether it crosses a ten.
// Difficulty proxy: k + (crosses a ten ? 4 : 0) + (dir === 'less' ? 2 : 0).
//   L1: small step up, no ten crossed (units + k ≤ 9)
//   L2: small step down, no borrow (units ≥ k)
//   L3: step up that always bridges a ten (units + k ≥ 10)
//   L4: step down that always borrows (units < k)
//   L5: two-digit step (k ≥ 10) either way — always crosses, and 'more' can pass 100
import type { Rng } from '../types.js'
import type { Params } from './index.js'

export function buildNumberFromDigitCluesLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    case 1: {
      const k = rng.int(1, 5)
      return { tens: rng.int(1, 8), units: rng.int(0, 9 - k), k, dir: 'more' }
    }
    case 2: {
      const k = rng.int(1, 5)
      return { tens: rng.int(1, 9), units: rng.int(k, 9), k, dir: 'less' }
    }
    case 3: {
      const k = rng.int(3, 9)
      return { tens: rng.int(1, 8), units: rng.int(10 - k, 9), k, dir: 'more' }
    }
    case 4: {
      const k = rng.int(3, 9)
      // units < k forces a borrow; tens ≥ 1 keeps the number (≥ 10) above k (≤ 9)
      return { tens: rng.int(1, 9), units: rng.int(0, k - 1), k, dir: 'less' }
    }
    case 5: {
      const k = rng.int(10, 15)
      const dir = rng.pick(['more', 'less'] as const)
      // 'more' from the 80s/90s pushes the answer over 100; 'less' from ≥ 20 stays ≥ 0
      const tens = dir === 'more' ? rng.int(8, 9) : rng.int(2, 9)
      return { tens, units: rng.int(0, 9), k, dir }
    }
  }
}
