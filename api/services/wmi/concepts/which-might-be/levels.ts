// Level ladder for which-might-be. Same param schema ({lo,hi,k,options}); the
// mystery number is always odd, strictly inside (lo, hi), with digit sum k.
// Difficulty climbs two ways: the clue window (hi − lo) gets wider, so the range
// clue eliminates fewer options, and from L4 the distractors stop being random
// and start failing exactly ONE clue each, so every clue must be checked.
// Difficulty proxy = the clue window width (hi − lo).
//   L1: window 4–6, random distractors        L2: window 6–10, random distractors
//   L3: window 10–16, random distractors      L4: window 16–24, near-miss distractors
//   L5: window 24–32, near-miss distractors that all sit inside the range
import type { Rng } from '../types.js'
import type { Params } from './index.js'

const digitSum = (n: number) => Math.floor(n / 10) + (n % 10)
const satisfies = (n: number, p: { lo: number; hi: number; k: number }) =>
  n % 2 === 1 && n > p.lo && n < p.hi && digitSum(n) === p.k

/** Numbers in [10, 99] matching `test`, minus anything already used. */
function candidates(used: Set<number>, test: (n: number) => boolean): number[] {
  const out: number[] = []
  for (let n = 10; n <= 99; n++) if (!used.has(n) && test(n)) out.push(n)
  return out
}

/**
 * Build one instance. `nearMiss` swaps the random distractors for three that
 * each break exactly one clue (digit sum / parity / range), so the child cannot
 * shortcut on a single test.
 */
function build(rng: Rng, tensLo: number, tensHi: number, padLo: number, padHi: number, nearMiss: boolean): Params {
  const tens = rng.int(tensLo, tensHi)
  const units = rng.pick([1, 3, 5, 7, 9] as const)
  const target = 10 * tens + units
  const k = tens + units
  const clues = { lo: Math.max(1, target - padLo), hi: Math.min(120, target + padHi), k }
  const used = new Set<number>([target])
  const distractors: number[] = []

  if (nearMiss) {
    const pools = [
      // fails the digit-sum clue only: odd, inside the range, wrong digit sum
      candidates(used, (n) => n % 2 === 1 && n > clues.lo && n < clues.hi && digitSum(n) !== k),
      // fails the parity clue only: even, inside the range, right digit sum if one exists
      candidates(used, (n) => n % 2 === 0 && n > clues.lo && n < clues.hi && digitSum(n) === k),
      // fails the range clue only: odd with the right digit sum, but outside the range
      candidates(used, (n) => n % 2 === 1 && digitSum(n) === k && (n <= clues.lo || n >= clues.hi)),
    ]
    for (const pool of pools) {
      const fresh = pool.filter((n) => !used.has(n))
      if (fresh.length === 0) continue
      const n = rng.pick(fresh)
      used.add(n)
      distractors.push(n)
    }
  }

  // Top up with plain non-satisfying numbers (the only source before L4).
  let guard = 0
  while (distractors.length < 3 && guard++ < 400) {
    const n = rng.int(10, 99)
    if (used.has(n) || satisfies(n, clues)) continue
    used.add(n)
    distractors.push(n)
  }
  for (let n = 10; distractors.length < 3 && n <= 99; n++) {
    if (used.has(n) || satisfies(n, clues)) continue
    used.add(n)
    distractors.push(n)
  }

  return { lo: clues.lo, hi: clues.hi, k, options: rng.shuffle([target, ...distractors]) }
}

export function whichMightBeLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    // L1 — tight window around a small target: the range clue alone almost decides it.
    case 1: return build(rng, 1, 3, rng.int(2, 3), rng.int(2, 3), false)
    // L2 — wider window, targets up to the 50s.
    case 2: return build(rng, 1, 5, rng.int(3, 5), rng.int(3, 5), false)
    // L3 — window over 10 wide and the whole 2-digit range of targets.
    case 3: return build(rng, 2, 8, rng.int(5, 8), rng.int(5, 8), false)
    // L4 — near-miss distractors: each wrong option breaks exactly one clue.
    case 4: return build(rng, 2, 8, rng.int(8, 12), rng.int(8, 12), true)
    // L5 — widest window plus near misses, so the digit-sum clue does all the work.
    case 5: return build(rng, 3, 8, rng.int(12, 16), rng.int(12, 16), true)
  }
}
