// Level ladder for operator-fill. What climbs: the size of the numbers a child
// has to run the four options through, and how many of the correct signs are
// minus (each minus turns an addition chain into a subtraction chain). The last
// rung adds near-miss options — flipping the sign on a small number moves the
// total by only 2 × that number, so two options land close together.
// Difficulty proxy: max(nums) + 6 × (minus signs in the correct pattern).
// The invariant render() relies on — EXACTLY one option evaluates to the target —
// is preserved: distractor patterns are filtered on evalSigns !== target.
//   L1: single-digit numbers, all-plus answer
//   L2: numbers to 15, exactly one minus
//   L3: numbers to 25, one or two minuses
//   L4: numbers to 35, at least two minuses
//   L5: three big numbers plus one small one, ≥ 2 minuses — near-miss options
import type { Rng } from '../types.js'
import { evalSigns, type Params } from './index.js'

type Signs = ('+' | '-')[]

const ALL: Signs[] = (['+', '-'] as const).flatMap((a) =>
  (['+', '-'] as const).flatMap((b) => (['+', '-'] as const).map((c) => [a, b, c] as Signs)),
)

const minusCount = (s: Signs) => s.filter((x) => x === '-').length

/** Pick the correct pattern: non-negative result, and as many minuses as the rung asks for. */
function pickCorrect(rng: Rng, nums: number[], minMinus: number, maxMinus: number): Signs {
  const ok = ALL.filter((p) => evalSigns(nums, p) >= 0)
  const banded = ok.filter((p) => minusCount(p) >= minMinus && minusCount(p) <= maxMinus)
  if (banded.length > 0) return rng.pick(banded)
  // Fall back down the band rather than ever returning a negative target.
  const relaxed = ok.filter((p) => minusCount(p) >= 1)
  return rng.pick(relaxed.length > 0 ? relaxed : ok)
}

function build(rng: Rng, nums: number[], minMinus: number, maxMinus: number, nearIdx?: number): Params {
  const correct = pickCorrect(rng, nums, minMinus, maxMinus)
  const target = evalSigns(nums, correct)
  const wrong = ALL.filter((p) => evalSigns(nums, p) !== target)
  let pool = rng.shuffle(wrong)
  if (nearIdx !== undefined) {
    // Put the option that differs only at the small number first: its total is
    // just 2 × (that number) away from the target.
    const near = correct.map((s, i) => (i === nearIdx - 1 ? (s === '+' ? '-' : '+') : s)) as Signs
    if (evalSigns(nums, near) !== target) pool = [near, ...pool.filter((p) => p.join() !== near.join())]
  }
  return { nums, target, options: rng.shuffle([correct, ...pool.slice(0, 3)]) }
}

export function operatorFillLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    case 1: {
      const nums = [rng.int(3, 9), rng.int(2, 9), rng.int(2, 9), rng.int(2, 9)]
      return build(rng, nums, 0, 0)
    }
    case 2: {
      const nums = [rng.int(8, 15), rng.int(3, 15), rng.int(3, 15), rng.int(3, 15)]
      return build(rng, nums, 1, 1)
    }
    case 3: {
      const nums = [rng.int(12, 25), rng.int(5, 25), rng.int(5, 25), rng.int(5, 25)]
      return build(rng, nums, 1, 2)
    }
    case 4: {
      // Lead with the biggest number so two subtractions can still land ≥ 0.
      const nums = [rng.int(30, 40), rng.int(10, 26), rng.int(10, 26), rng.int(10, 26)]
      return build(rng, nums, 2, 3)
    }
    case 5: {
      // One deliberately small number among three big ones: flipping its sign
      // barely moves the total, so two of the four options nearly agree.
      const nums = [rng.int(30, 40), rng.int(18, 40), rng.int(18, 40), rng.int(18, 40)]
      const smallIdx = rng.int(1, 3)
      nums[smallIdx] = rng.int(2, 4)
      return build(rng, nums, 2, 3, smallIdx)
    }
  }
}
