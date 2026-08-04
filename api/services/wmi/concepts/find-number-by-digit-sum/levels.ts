// Level ladder for find-number-by-digit-sum. Two things climb: the target sum k
// (bigger sums mean bigger digits and less familiar pairs), and how close the
// distractors' digit sums sit to k — a near-miss option forces the child to add
// every option instead of eyeballing one. The uniqueness invariant the concept
// depends on (EXACTLY one option has digit sum k) is preserved at every rung:
// every distractor is drawn with |digitSum − k| ≥ 1.
// Difficulty proxy: k + 10 / meanGap + (all options share a tens digit ? 5 : 0).
//   L1: small k, far-off distractors (gap ≥ 4)
//   L2: small-to-middling k, distractors still clearly off (gap ≥ 2)
//   L3: bigger k, distractors within 2 of the target
//   L4: big k, every distractor exactly 1 off — no eyeballing left
//   L5: big k, all four options in the SAME decade, so only the ones digit decides
import type { Rng } from '../types.js'
import { digitSum, type Params } from './index.js'

/** A two-digit number whose digits add to k (k ∈ 4..15 always admits one). */
function numberWithDigitSum(rng: Rng, k: number): number {
  const t = rng.int(Math.max(1, k - 9), Math.min(9, k))
  return t * 10 + (k - t)
}

/** 3 distinct two-digit distractors with |digitSum − k| inside [lo, hi] (lo ≥ 1). */
function distractors(rng: Rng, k: number, correct: number, lo: number, hi: number): number[] {
  const used = new Set<number>([correct])
  const out: number[] = []
  for (let guard = 0; out.length < 3 && guard < 400; guard++) {
    const n = rng.int(10, 99)
    if (used.has(n)) continue
    const gap = Math.abs(digitSum(n) - k)
    if (gap < lo || gap > hi) continue
    used.add(n)
    out.push(n)
  }
  // Deterministic top-up so the option list is always full and always unique.
  for (let n = 10; out.length < 3 && n <= 99; n++) {
    if (used.has(n) || digitSum(n) === k) continue
    used.add(n)
    out.push(n)
  }
  return out
}

export function findNumberByDigitSumLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  if (level === 5) {
    // Same tens digit on all four options: the ones digit alone decides, and
    // digit sums differ by exactly the ones-digit gap — the tightest read.
    const k = rng.int(12, 15)
    const t = rng.int(Math.max(1, k - 9), 9)
    const u = k - t
    const near = [u - 1, u + 1, u - 2, u + 2, u - 3, u + 3].filter((x) => x >= 0 && x <= 9)
    const opts = [t * 10 + u]
    for (const x of near) {
      if (opts.length === 4) break
      opts.push(t * 10 + x)
    }
    return { k, options: rng.shuffle(opts) }
  }

  const [kLo, kHi, gapLo, gapHi] =
    level === 1 ? [4, 6, 4, 14] : level === 2 ? [4, 9, 2, 14] : level === 3 ? [8, 12, 1, 2] : [10, 13, 1, 1]
  const k = rng.int(kLo, kHi)
  const correct = numberWithDigitSum(rng, k)
  return { k, options: rng.shuffle([correct, ...distractors(rng, k, correct, gapLo, gapHi)]) }
}
