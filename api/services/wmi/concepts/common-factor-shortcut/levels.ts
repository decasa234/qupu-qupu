// Level ladder for common-factor-shortcut (a×c + b×c = (a+b)×c). Same param
// schema (a,b ∈ 2..18, c ∈ 2..12); difficulty climbs on the answer (a+b)×c and
// on how much real addition the shortcut still leaves:
//   L1: a+b = 10 exactly, both 1-digit, c ≤ 4 — the "make ten" training wheel
//   L2: any 1-digit a,b (the sum is usually NOT round), c ≤ 6
//   L3: terms up to 12, c 4..8 — 2-digit terms enter
//   L4: terms up to 18, c 6..10 — full term range, 3-digit answers
//   L5: both terms 2-digit (10..18) and c 9..12 — the largest products allowed
//
// INVARIANT enforced at every rung: the two `fact` highlights are the literal
// strings `a × c` and `b × c`, so neither may be a substring of the other.
// That fails whenever String(a) is a suffix of String(b) (e.g. a=5, b=15 →
// "5 × 3" ⊂ "15 × 3") — such pairs are rejected here, and a !== b always.
import type { Rng } from '../types.js'
import type { Params } from './index.js'

// True when the two term highlights would collide in the rendered body.
function termsCollide(a: number, b: number): boolean {
  if (a === b) return true
  const sa = String(a)
  const sb = String(b)
  return sa.endsWith(sb) || sb.endsWith(sa)
}

// Draw an ordered pair from [lo, hi] whose two term highlights stay distinct.
function pickTerms(rng: Rng, lo: number, hi: number, fallback: [number, number]): [number, number] {
  for (let i = 0; i < 40; i++) {
    const a = rng.int(lo, hi)
    const b = rng.int(lo, hi)
    if (!termsCollide(a, b)) return [a, b]
  }
  return fallback
}

// Ordered 1-digit pairs summing to 10 (5+5 excluded — the terms must differ).
const MAKE_TEN: ReadonlyArray<readonly [number, number]> = [
  [2, 8], [8, 2], [3, 7], [7, 3], [4, 6], [6, 4],
]

export function commonFactorShortcutLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    case 1: {
      const [a, b] = rng.pick(MAKE_TEN)
      return { a, b, c: rng.int(2, 4) }
    }
    case 2: {
      const [a, b] = pickTerms(rng, 2, 9, [3, 8])
      return { a, b, c: rng.int(2, 6) }
    }
    case 3: {
      const [a, b] = pickTerms(rng, 2, 12, [11, 4])
      return { a, b, c: rng.int(4, 8) }
    }
    case 4: {
      const [a, b] = pickTerms(rng, 2, 18, [14, 9])
      return { a, b, c: rng.int(6, 10) }
    }
    case 5: {
      // Both terms 2-digit: no 1-digit suffix is possible, only a === b.
      const [a, b] = pickTerms(rng, 10, 18, [13, 18])
      return { a, b, c: rng.int(9, 12) }
    }
  }
}
