// Level ladder for digits-into-equation-fill. Same param schema. Every fair card
// set this concept can serve comes out of an exhaustively enumerated catalogue
// inside `generate()` (unique result / unique largest quotient / unique smallest
// largest term / unique triple), and those catalogues are module-private — so
// each rung samples `generate()` until it yields the ask that rung is about,
// rather than hand-building cards that would sidestep the uniqueness proof.
//
// Difficulty is the ask, ordered by "how many cards are on the table, plus a big
// premium when the question is an OPTIMISATION rather than a determination":
//   L1: □□ + □ = □□ from 5 cards      — read one column, name the result
//   L2: □□ + □□ = □□ from 6 cards     — same column trick, two two-digit addends
//   L3: □ ÷ □ = □ picked from 8 cards — sweep every pair's product, then choose (A–D)
//   L4: □□□ ÷ □ from 4 cards          — try every divisor and MAXIMISE the quotient
//   L5: □□ + □□ + □□ hitting a total  — try every tens-set and MINIMISE the largest term
import type { Rng } from '../types.js'
import { generate } from './index.js'
import type { Params } from './index.js'

const TARGET: Record<1 | 2 | 3 | 4 | 5, { ask: Params['ask']; skeleton: Params['skeleton'] }> = {
  1: { ask: 'the-result', skeleton: 'two-plus-one' },
  2: { ask: 'the-result', skeleton: 'two-plus-two' },
  3: { ask: 'which-card-used', skeleton: 'div-triple' },
  4: { ask: 'largest-quotient', skeleton: 'three-by-one' },
  5: { ask: 'minimise-largest-term', skeleton: 'three-two-digit-sum' },
}

export function digitsIntoEquationFillLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  const want = TARGET[level]
  let first: Params | null = null
  for (let attempt = 0; attempt < 300; attempt++) {
    const candidate = generate(rng)
    if (first === null) first = candidate
    if (candidate.ask === want.ask && candidate.skeleton === want.skeleton) return candidate
  }
  return first as Params
}
