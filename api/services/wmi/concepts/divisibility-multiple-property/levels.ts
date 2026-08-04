// Level ladder for divisibility-multiple-property. Same param schema
// (discriminated union); difficulty climbs through the three modes — recognise a
// multiple (pick-multiple) → find how far the next multiple is (make-divisible)
// → two divisors at once via the LCM (multi-divisor) — and, inside each mode, by
// the size of the divisor and of the numbers. Difficulty proxy = the effective
// divisor the child must reason with (d, or lcm(k, m) for multi-divisor).
//   L1: pick-multiple, d ∈ {2,5}, 2-digit options     (proxy 3.5)
//   L2: pick-multiple, d ∈ {3,4,6}, options to 99     (proxy 4.3)
//   L3: make-divisible, d ∈ {4,5,6}, n < 100          (proxy 5.0)
//   L4: make-divisible, d ∈ {8,9,12}, 3-digit n       (proxy 9.7)
//   L5: multi-divisor, lcm ≥ 20                       (proxy ≈ 28)
import type { Rng } from '../types.js'
import type { Params } from './index.js'

function gcd(a: number, b: number): number {
  while (b !== 0) { const t = b; b = a % b; a = t }
  return a
}
function lcm(a: number, b: number): number {
  return (a / gcd(a, b)) * b
}

/** Four distinct options in [lo, hi] of which EXACTLY one is a multiple of d. */
function pickMultiple(rng: Rng, d: number, lo: number, hi: number): Params {
  const correct = d * rng.int(Math.ceil(lo / d), Math.floor(hi / d))
  const used = new Set<number>([correct])
  const options: number[] = []
  let guard = 0
  while (options.length < 3 && guard++ < 500) {
    const n = rng.int(lo, hi)
    if (used.has(n) || n % d === 0) continue
    used.add(n)
    options.push(n)
  }
  // Deterministic top-up (never reached in practice; keeps the invariant safe).
  for (let n = lo; options.length < 3 && n <= hi; n++) {
    if (used.has(n) || n % d === 0) continue
    used.add(n)
    options.push(n)
  }
  return { mode: 'pick-multiple', d, options: rng.shuffle([correct, ...options]) }
}

/** n in [lo, hi] that is NOT a multiple of d, plus the gap x to the next multiple. */
function makeDivisible(rng: Rng, d: number, lo: number, hi: number): Params {
  let n = rng.int(lo, hi)
  let guard = 0
  while (n % d === 0 && guard++ < 200) n = rng.int(lo, hi)
  if (n % d === 0) n = n === lo ? n + 1 : n - 1
  return { mode: 'make-divisible', d, n, x: d - (n % d) }
}

export function divisibilityMultiplePropertyLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    // L1 — the two rules a 7-year-old already owns: even numbers, and "ends in 0 or 5".
    case 1: return pickMultiple(rng, rng.pick([2, 5] as const), 10, 50)
    // L2 — rules that need a digit sum or the last two digits, over the full 2-digit range.
    case 2: return pickMultiple(rng, rng.pick([3, 4, 6] as const), 10, 99)
    // L3 — no longer "is it?" but "how far to the next one?": divide, then take the gap.
    case 3: return makeDivisible(rng, rng.pick([4, 5, 6] as const), 20, 99)
    // L4 — same question with bigger divisors and 3-digit numbers (gaps up to 11).
    case 4: return makeDivisible(rng, rng.pick([8, 9, 12] as const), 100, 199)
    // L5 — two divisors at once: build the LCM first, then walk past the base.
    case 5: {
      const [k, m] = rng.pick([
        [4, 5], [3, 7], [3, 8], [4, 7], [5, 6], [4, 9], [5, 7],
      ] as const)
      const base = rng.int(40, 120)
      const l = lcm(k, m)
      return { mode: 'multi-divisor', k, m, base, answer: Math.ceil((base + 1) / l) * l }
    }
  }
}
