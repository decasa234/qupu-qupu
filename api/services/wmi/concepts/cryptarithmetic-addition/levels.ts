// Level ladder for cryptarithmetic-addition. Same param schema ({addend1,
// addend2, askDigit}). The one property that makes the question fair — exactly
// ONE injective letter→digit assignment satisfies the sum — is not enforced by
// the schema, so every rung re-proves it with the concept's own `solutions()`
// before returning. The whole 10..99 × 10..99 space holds only ~40 unordered
// addend pairs with a unique solution and every one of them has a three-digit
// sum, so the sampler only ever draws pairs with a + b ≥ 100.
//
// Difficulty climbs on the three axes that space actually offers:
//   L1: 3 letters, units column does NOT carry — two independent columns
//   L2: 3 letters, units column carries — a 1 has to be tracked into the tens
//   L3: 4 letters — one more unknown, but the asked letter still leads a number,
//       so the "no number starts with 0" rule helps pin it down
//   L4: 4 letters AND a carry, and the asked letter may sit anywhere
//   L5: 4 letters, a carry, and the asked letter leads nothing at all, so the only
//       way to it is through the columns
import type { Rng } from '../types.js'
import { buildMapping, solutions } from './index.js'
import type { Params } from './index.js'

interface Want {
  /** how many different letters the puzzle may use */
  distinct: readonly number[]
  /** 1 = the units column must carry, 0 = it must not, null = either */
  carry: 0 | 1 | null
  /** which letters may be asked about */
  ask: 'any' | 'leading' | 'non-leading'
}

const WANT: Record<1 | 2 | 3 | 4 | 5, Want> = {
  1: { distinct: [3], carry: 0, ask: 'any' },
  2: { distinct: [3], carry: 1, ask: 'any' },
  3: { distinct: [4], carry: null, ask: 'leading' },
  4: { distinct: [4], carry: 1, ask: 'any' },
  5: { distinct: [4], carry: 1, ask: 'non-leading' },
}

/**
 * One verified puzzle per rung, used only if the sampler somehow never lands.
 * Each has a proven-unique assignment (11 + 89 = 100 is the concept's own).
 */
const FALLBACK: Record<1 | 2 | 3 | 4 | 5, Params> = {
  1: { addend1: 10, addend2: 90, askDigit: 9 }, // AB + CB = ABB, no carry
  2: { addend1: 11, addend2: 99, askDigit: 9 }, // AA + BB = AAC, carries
  3: { addend1: 11, addend2: 91, askDigit: 9 }, // AA + BA = ACD, four letters, B leads
  4: { addend1: 11, addend2: 89, askDigit: 8 }, // AA + BC = ADD, four letters, carries
  5: { addend1: 11, addend2: 89, askDigit: 0 }, // …asking D, which leads nothing
}

export function cryptarithmeticAdditionLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  const want = WANT[level]
  for (let tries = 0; tries < 4000; tries++) {
    const addend1 = rng.int(10, 99)
    const addend2 = rng.int(Math.max(10, 100 - addend1), 99)
    const m = buildMapping(addend1, addend2)
    if (!want.distinct.includes(m.distinctDigits.length)) continue

    const carry = (addend1 % 10) + (addend2 % 10) >= 10 ? 1 : 0
    if (want.carry !== null && carry !== want.carry) continue

    const leading = new Set([m.wordA[0], m.wordB[0], m.wordS[0]])
    const askable =
      want.ask === 'any'
        ? m.letters
        : m.letters.filter((L) => (want.ask === 'leading' ? leading.has(L) : !leading.has(L)))
    if (askable.length === 0) continue

    // The expensive check last: the puzzle must admit exactly one assignment.
    if (solutions({ addend1, addend2, askDigit: m.distinctDigits[0] }).length !== 1) continue

    const letter = rng.pick(askable)
    return { addend1, addend2, askDigit: m.distinctDigits[m.letters.indexOf(letter)] }
  }
  return FALLBACK[level]
}
