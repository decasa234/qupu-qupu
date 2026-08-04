// Level ladder for digit-sum. The schema carries exactly one param (n ∈ 10..99),
// so the only honest dial is the digit sum itself — which IS the work: the child
// adds the two digits, and the addition gets harder as the target sum grows past
// ten and the digits themselves get bigger.
import type { Rng } from '../types.js'
import type { Params } from './index.js'

/** A two-digit number whose digits add to exactly `s` (1 ≤ s ≤ 18). */
function withDigitSum(rng: Rng, s: number): Params {
  const tens = rng.int(Math.max(1, s - 9), Math.min(9, s))
  return { n: tens * 10 + (s - tens) }
}

export function digitSumLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    // L1: sums up to 5 — countable on one hand.
    case 1:
      return withDigitSum(rng, rng.int(1, 5))
    // L2: sums 6–9 — still a single-digit answer, no ten to bridge.
    case 2:
      return withDigitSum(rng, rng.int(6, 9))
    // L3: sums 10–12 — the addition now crosses ten for the first time.
    case 3:
      return withDigitSum(rng, rng.int(10, 12))
    // L4: sums 13–15 — both digits are large, the bridge is wider.
    case 4:
      return withDigitSum(rng, rng.int(13, 15))
    // L5: sums 16–18 — the hardest single-digit facts the schema can reach.
    case 5:
      return withDigitSum(rng, rng.int(16, 18))
  }
}
