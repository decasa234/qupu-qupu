// Level ladder for budget-selection. Same param schema ({prices[4], budget});
// difficulty climbs on `bust` — how many of the six pair totals overshoot the
// budget, i.e. how many baskets the child has to price up and reject before the
// winner appears — and, behind that, on how awkward the numbers are to add.
//   L1: 1 rejection, prices are tens up to 90 — reject the top pair, take the next
//   L2: 2 rejections, tens up to 150
//   L3: 3 rejections, tens up to 250 — the winner is no longer near the top
//   L4: 4 rejections, fives up to 280 — only two baskets fit; the winner uses the
//       DEAREST ticket with the cheapest, so "skip the two priciest" is not enough
//   L5: 4 rejections, any whole price up to 290, and the two surviving baskets are
//       within 5 of each other, so both totals must actually be worked out
// Every level guarantees the invariants `render` and the hints assume but the
// schema does not: four distinct prices, six distinct pair totals (so exactly ONE
// basket is the best affordable one), the top pair always over budget (the hint
// says so out loud), and no price/budget numeral that is a substring of another
// (each is its own breakdown highlight — "30" inside "130" eats one of them).
import type { Rng } from '../types.js'
import type { Params } from './index.js'

type Spec = {
  step: number
  lo: number
  hi: number
  bust: number
  nearTie: boolean
  fallback: Params
}

const SPECS: Record<1 | 2 | 3 | 4 | 5, Spec> = {
  1: { step: 10, lo: 20, hi: 90, bust: 1, nearTie: false, fallback: { prices: [70, 20, 90, 50], budget: 145 } },
  2: { step: 10, lo: 20, hi: 150, bust: 2, nearTie: false, fallback: { prices: [90, 50, 20, 70], budget: 125 } },
  3: { step: 10, lo: 30, hi: 250, bust: 3, nearTie: false, fallback: { prices: [50, 90, 70, 20], budget: 115 } },
  4: { step: 5, lo: 40, hi: 280, bust: 4, nearTie: false, fallback: { prices: [20, 70, 50, 90], budget: 105 } },
  5: { step: 1, lo: 60, hi: 290, bust: 4, nearTie: true, fallback: { prices: [145, 70, 260, 140], budget: 233 } },
}

function pairSums(prices: number[]): number[] {
  const out: number[] = []
  for (let i = 0; i < prices.length; i++) {
    for (let j = i + 1; j < prices.length; j++) out.push(prices[i] + prices[j])
  }
  return out
}

// Each price and the budget becomes its own clickable highlight, matched by
// substring. If one numeral sits inside another the second highlight never lands.
function noNumeralOverlap(nums: number[]): boolean {
  const text = nums.map(String)
  for (let i = 0; i < text.length; i++) {
    for (let j = 0; j < text.length; j++) {
      if (i !== j && text[j].includes(text[i])) return false
    }
  }
  return true
}

export function budgetSelectionLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  const spec = SPECS[level]
  const pool: number[] = []
  for (let v = spec.lo; v <= spec.hi; v += spec.step) pool.push(v)

  for (let attempt = 0; attempt < 400; attempt++) {
    let prices: number[]
    if (spec.nearTie) {
      // Build the near-tie in: the 2nd and 3rd cheapest sit within 5 of each other,
      // so the two affordable baskets differ by only a few dollars.
      const b = rng.int(spec.lo + 6, spec.hi - 12)
      const c = b + rng.int(1, 5)
      if (c + 6 > spec.hi) continue
      prices = [rng.int(spec.lo, b - 6), b, c, rng.int(c + 6, spec.hi)]
    } else {
      prices = rng.shuffle(pool).slice(0, 4)
    }
    if (new Set(prices).size !== 4) continue

    const sums = pairSums(prices).sort((a, b) => a - b)
    if (new Set(sums).size !== 6) continue // exactly one best affordable basket

    // budget sits between the (6−bust)th and (7−bust)th total, so exactly `bust`
    // pairs overshoot and the answer is the largest total that still fits.
    const floor = sums[5 - spec.bust]
    const ceil = Math.min(sums[6 - spec.bust] - 1, 500)
    if (floor < 40 || floor > ceil) continue
    const budget = rng.int(floor, ceil)
    if (!noNumeralOverlap([...prices, budget])) continue

    return { prices: rng.shuffle(prices), budget }
  }
  return spec.fallback
}
