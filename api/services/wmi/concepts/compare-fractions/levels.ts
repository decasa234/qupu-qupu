// Level ladder for compare-fractions. Same param schema. Two things have to
// hold for the key to be honest — no two options may name the same number, and
// the stated comparison rule must actually settle the set — and both are proved
// inside `generate()` / `paramsSchema`. So each rung samples `generate()` until
// it hands back the mode that rung is about, instead of assembling fractions by
// hand and hoping the rule still decides them.
//
// Difficulty is the comparison rule, ordered by how much has to happen before the
// options can be lined up:
//   L1: same bottom number  — same-size pieces, just count how many were taken
//   L2: same top number     — the counterintuitive one: MORE pieces means SMALLER pieces
//   L3: the one-half benchmark — compare every option against 1/2 first
//   L4: one odd fraction    — re-cut it into everyone else's bottom number, then compare
//   L5: same re-cut, four options, and "nearest to one whole" — one extra bridge
//       (all proper, so nearest-to-a-whole is the largest) before the rule applies
import type { Rng } from '../types.js'
import { generate } from './index.js'
import type { Params } from './index.js'

function wanted(p: Params, level: 1 | 2 | 3 | 4 | 5): boolean {
  switch (level) {
    case 1:
      return p.mode === 'same-denominator' && p.fractions.length === 3 && p.ask !== 'closest-to-one'
    case 2:
      return p.mode === 'same-numerator' && p.fractions.length === 3 && p.ask !== 'closest-to-one'
    case 3:
      return p.mode === 'benchmark-half'
    case 4:
      return p.mode === 'one-equivalent-pair' && p.ask !== 'closest-to-one'
    case 5:
      return p.mode === 'one-equivalent-pair' && p.fractions.length === 4 && p.ask === 'closest-to-one'
  }
}

/** One verified set per rung, used only if the sampler somehow never lands. */
const FALLBACK: Record<1 | 2 | 3 | 4 | 5, Params> = {
  1: {
    mode: 'same-denominator',
    fractions: [{ num: 1, den: 5 }, { num: 4, den: 5 }, { num: 2, den: 5 }],
    ask: 'largest',
  },
  2: {
    mode: 'same-numerator',
    fractions: [{ num: 1, den: 3 }, { num: 1, den: 8 }, { num: 1, den: 5 }],
    ask: 'largest',
  },
  3: {
    mode: 'benchmark-half',
    fractions: [{ num: 3, den: 4 }, { num: 1, den: 3 }, { num: 2, den: 5 }],
    ask: 'largest',
  },
  4: {
    mode: 'one-equivalent-pair',
    fractions: [{ num: 1, den: 2 }, { num: 3, den: 8 }, { num: 7, den: 8 }],
    ask: 'largest',
  },
  5: {
    mode: 'one-equivalent-pair',
    fractions: [{ num: 1, den: 3 }, { num: 5, den: 9 }, { num: 2, den: 9 }, { num: 7, den: 9 }],
    ask: 'closest-to-one',
  },
}

export function compareFractionsLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  for (let attempt = 0; attempt < 400; attempt++) {
    const candidate = generate(rng)
    if (wanted(candidate, level)) return candidate
  }
  return FALLBACK[level]
}
