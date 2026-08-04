// Level ladder for delete-digits-extremise. Same param schema; every rung is
// drafted the way the concept's own `draft()` drafts, then put through the same
// quality filter, so the two independent solvers inside `solve()` still have to
// agree and the sorted-digits trap still has to miss the real answer.
//
// Difficulty climbs by how many digits get deleted (and so how wide each choice
// window is), plus one extra step at the top:
//   L1: 8-digit strip, keep 5 → 3 deletions, biggest number
//   L2: 9-digit strip, keep 5 → 4 deletions
//   L3: 10-digit strip, keep 5 → 5 deletions, and the objective flips to SMALLEST
//   L4: 12-digit strip, keep 5 → 7 deletions, either objective
//   L5: longest strips (14 explicit, or 1…12 / 1…13 written side by side) with 9–12
//       deletions, and the answer is the digit sum of the middle three, not the number
import type { Rng } from '../types.js'
import { concatDigits, solve, trapFor } from './index.js'
import type { Params } from './index.js'

type Objective = 'max' | 'min'

/**
 * The concept's own quality filter, restated here because it is module-private:
 * the answer must not be the plain front or back of the strip, the "grab the
 * biggest digits and sort them" trap must land somewhere else, and at least two
 * slots must have involved a real choice.
 */
function isWorthAsking(p: Params): boolean {
  const s = solve(p)
  if (s.result === p.digits.slice(0, s.keep)) return false
  if (s.result === p.digits.slice(p.digits.length - s.keep)) return false
  const trap = trapFor(p, s.keep)
  if (trap.number === s.result || trap.answer === s.answer) return false
  return s.choiceSlots.length >= 2
}

/** A random strip that never starts with 0, and never contains 0 when minimising. */
function explicitStrip(rng: Rng, len: number, objective: Objective): string {
  const lowest = objective === 'min' ? 1 : 0
  const cells = [String(rng.int(1, 9))]
  for (let i = 1; i < len; i++) cells.push(String(rng.int(lowest, 9)))
  return cells.join('')
}

/** A "read off the surviving number" draft: `len` digits in, `keep` left standing. */
function explicit(rng: Rng, len: number, keep: number, objective: Objective): Params {
  return {
    source: 'explicit',
    digits: explicitStrip(rng, len, objective),
    concatTo: null,
    k: len - keep,
    objective,
    ask: 'the-number',
  }
}

function draft(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    case 1:
      return explicit(rng, 8, 5, 'max')
    case 2:
      return explicit(rng, 9, 5, 'max')
    case 3:
      return explicit(rng, 10, 5, 'min')
    case 4:
      return explicit(rng, 12, 5, rng.pick(['max', 'min'] as const))
    case 5: {
      // The middle-three ask is only defined on 5 surviving digits. The 1…n strip
      // is the real WMI shape but there are only two of them, so it stays rare.
      const source = rng.pick(['explicit', 'explicit', 'explicit', 'explicit', 'concat'] as const)
      if (source === 'explicit') {
        const len = rng.int(13, 15)
        return {
          source: 'explicit',
          digits: explicitStrip(rng, len, 'max'),
          concatTo: null,
          k: len - 5,
          objective: 'max',
          ask: 'digit-sum-of-middle-three',
        }
      }
      const concatTo = rng.pick([12, 13] as const)
      const digits = concatDigits(concatTo)
      return {
        source: 'concat',
        digits,
        concatTo,
        k: digits.length - 5,
        objective: 'max',
        ask: 'digit-sum-of-middle-three',
      }
    }
  }
}

export function deleteDigitsExtremiseLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  let first: Params | null = null
  for (let attempt = 0; attempt < 120; attempt++) {
    const candidate = draft(rng, level)
    if (first === null) first = candidate
    if (isWorthAsking(candidate)) return candidate
  }
  return first as Params
}
