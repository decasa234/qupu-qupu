// Level ladder for odd-even-reasoning. Same param schema (discriminated union);
// difficulty climbs from *recognising* parity (pair-parity: no arithmetic, just
// spot the odd+even sum) to *using* parity on ever longer, ever bigger lists
// (sum-diff: group, add each group, subtract). Difficulty proxy = the total
// magnitude of all numbers printed in the problem.
//   L1: pair-parity, single-digit addends
//   L2: pair-parity, small two-digit addends
//   L3: sum-diff, 8 numbers up to 45
//   L4: sum-diff, 9 numbers up to 70
//   L5: sum-diff, 10 numbers up to 99
// The sum-diff-ctx mode is deliberately unused: its breakdown reuses the
// sum-diff highlight phrases ("following numbers", "odd numbers", …), which do
// not occur in the story-flavoured body, so those highlights would never light.
import type { Rng } from '../types.js'
import type { Params } from './index.js'

/** Odd number in [lo, hi]. */
function oddIn(rng: Rng, lo: number, hi: number): number {
  return 2 * rng.int(Math.ceil((lo - 1) / 2), Math.floor((hi - 1) / 2)) + 1
}
/** Even number in [lo, hi]. */
function evenIn(rng: Rng, lo: number, hi: number): number {
  return 2 * rng.int(Math.ceil(lo / 2), Math.floor(hi / 2))
}

/**
 * Four sums, exactly one of which is odd (one odd + one even addend); the other
 * three pair two addends of the same parity. Options are de-duplicated so no two
 * choices read the same — at L1 the pool of single-digit pairs is small.
 */
function pairParity(rng: Rng, lo: number, hi: number): Params {
  const oddSum = { x: oddIn(rng, lo, hi), y: evenIn(rng, lo, hi) }
  const seen = new Set<string>([`${oddSum.x}+${oddSum.y}`])
  const evenSums: { x: number; y: number }[] = []
  let guard = 0
  while (evenSums.length < 3 && guard++ < 200) {
    const p = rng.int(0, 1) === 0
      ? { x: oddIn(rng, lo, hi), y: oddIn(rng, lo, hi) }
      : { x: evenIn(rng, lo, hi), y: evenIn(rng, lo, hi) }
    const key = `${p.x}+${p.y}`
    if (seen.has(key)) continue
    seen.add(key)
    evenSums.push(p)
  }
  while (evenSums.length < 3) evenSums.push({ x: evenIn(rng, lo, hi), y: evenIn(rng, lo, hi) })
  return { mode: 'pair-parity', options: rng.shuffle([oddSum, ...evenSums]) }
}

/** n numbers in [1, hi] with at least 2 odds and 2 evens (both groups non-empty). */
function sumDiff(rng: Rng, n: number, hi: number): Params {
  const numbers = [
    oddIn(rng, 1, hi),
    oddIn(rng, 1, hi),
    evenIn(rng, 2, hi),
    evenIn(rng, 2, hi),
  ]
  for (let i = 4; i < n; i++) numbers.push(rng.int(1, hi))
  return { mode: 'sum-diff', numbers: rng.shuffle(numbers) }
}

export function oddEvenReasoningLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    // L1 — parity of single digits: 3 + 4 is odd, 3 + 5 is not. No adding needed.
    case 1: return pairParity(rng, 1, 9)
    // L2 — same rule, two-digit addends: parity now has to be read off the last digit.
    case 2: return pairParity(rng, 10, 20)
    // L3 — first list problem: sort 8 small numbers into two groups, add, subtract.
    case 3: return sumDiff(rng, 8, 45)
    // L4 — one more number and roughly double the values.
    case 4: return sumDiff(rng, 9, 70)
    // L5 — the longest list the schema allows, full 1–99 range.
    case 5: return sumDiff(rng, 10, 99)
  }
}
