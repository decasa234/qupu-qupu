// Level ladder for length-measure-compare. Same param schema; difficulty climbs
// along two axes the concept already varies — the medium (aligned at 0 vs the
// signature offset ruler, which forces right − left) and the ask:
//   L1: ruler from 0, one object, "how long?"        — read one number
//   L2: two objects from 0, "which is longest?"      — read two, compare
//   L3: offset ruler, one object                     — the subtraction trap
//   L4: offset ruler, two objects, difference / sum  — two subtractions, then combine
//   L5: offset ruler, FOUR objects — rank them all, name the 2nd/3rd longest, or
//       measure the shortest from the longest's stated length
import type { Rng } from '../types.js'
import type { Params } from './index.js'

const NAMES = ['pensil', 'pita', 'ranting', 'sedotan', 'krayon', 'tali'] as const

/** `count` different lengths — a strict ranking, never a tie. */
function distinctLengths(rng: Rng, count: number): number[] {
  return rng.shuffle([3, 4, 5, 6, 7, 8]).slice(0, count)
}

/** Printed maximum: always past the farthest right end, never above 14. */
function rulerMaxFor(rng: Rng, items: { start: number; length: number }[]): number {
  const maxEnd = items.reduce((m, it) => Math.max(m, it.start + it.length), 1)
  return Math.min(14, maxEnd + rng.int(1, 2))
}

export function lengthMeasureCompareLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  const keys = rng.shuffle(NAMES)

  switch (level) {
    // L1 — the object starts at 0 and is short: the right-hand number IS the answer.
    case 1: {
      const length = rng.int(2, 5)
      return {
        medium: 'ruler',
        unitLabel: 'cm',
        ask: 'measure-one',
        rulerMax: Math.min(14, length + rng.int(1, 3)),
        items: [{ name: keys[0], start: 0, length }],
        focusA: 0,
        focusB: 0,
      }
    }
    // L2 — two objects, still both starting at 0 (or counted in unit squares):
    // two readings and one comparison.
    case 2: {
      const medium = rng.pick(['ruler', 'unit-chain'] as const)
      const lengths = distinctLengths(rng, 2)
      const items = lengths.map((length, i) => ({ name: keys[i], start: 0, length }))
      const longest = Math.max(...lengths)
      return {
        medium,
        unitLabel: medium === 'unit-chain' ? 'petak' : 'cm',
        ask: 'longest',
        rulerMax: medium === 'unit-chain' ? longest : Math.min(14, longest + rng.int(1, 2)),
        items: rng.shuffle(items),
        focusA: 0,
        focusB: 0,
      }
    }
    // L3 — the offset ruler arrives: one object, but it no longer starts at 0, so
    // the right-hand number is the trap and length = end − start.
    case 3: {
      const start = rng.int(1, 4)
      const length = rng.int(3, 8)
      return {
        medium: 'offset-ruler',
        unitLabel: 'cm',
        ask: 'measure-one',
        rulerMax: Math.min(14, start + length + rng.int(1, 2)),
        items: [{ name: keys[0], start, length }],
        focusA: 0,
        focusB: 0,
      }
    }
    // L4 — two offset objects: subtract twice to get the lengths, then subtract
    // (difference) or add (sum) them.
    case 4: {
      if (rng.int(0, 1) === 0) {
        // difference — the longer object is the one the question names first.
        const lenB = rng.int(3, 5)
        let diff = rng.int(1, 4)
        const startA = rng.int(1, 4)
        if (startA + diff < 3) diff = 3 - startA
        const upper = Math.min(4, startA + diff - 1)
        const opts: number[] = []
        for (let v = 1; v <= upper; v++) if (v !== startA) opts.push(v)
        const startB = rng.pick(opts)
        const a = { name: keys[0], start: startA, length: lenB + diff }
        const b = { name: keys[1], start: startB, length: lenB }
        const flip = rng.int(0, 1) === 1
        const items = flip ? [b, a] : [a, b]
        return {
          medium: 'offset-ruler',
          unitLabel: 'cm',
          ask: 'difference',
          rulerMax: rulerMaxFor(rng, items),
          items,
          focusA: flip ? 1 : 0,
          focusB: flip ? 0 : 1,
        }
      }
      // sum-two — startA never equals lengthB, so the first right-hand reading can
      // never coincidentally land on the total.
      const lengthA = rng.int(3, 7)
      const lengthB = rng.int(3, 7)
      const items = [
        { name: keys[0], start: rng.pick([1, 2, 3].filter((s) => s !== lengthB)), length: lengthA },
        { name: keys[1], start: rng.int(1, 3), length: lengthB },
      ]
      return {
        medium: 'offset-ruler',
        unitLabel: 'cm',
        ask: 'sum-two',
        rulerMax: rulerMaxFor(rng, items),
        items,
        focusA: 0,
        focusB: 1,
      }
    }
    // L5 — four offset objects with four different lengths and scrambled starts,
    // so nothing can be ranked by eyeballing the right-hand ends: four
    // subtractions, then a full ranking (or find the shortest from a given one).
    case 5: {
      const lengths = distinctLengths(rng, 4)
      const items = lengths.map((length, i) => ({
        name: keys[i],
        start: rng.int(1, 3),
        length,
      }))
      const rulerMax = rulerMaxFor(rng, items)
      const ask = rng.pick(['order-all', 'nth-longest', 'relative-from-known'] as const)
      if (ask === 'nth-longest') {
        return {
          medium: 'offset-ruler',
          unitLabel: 'cm',
          ask,
          rulerMax,
          items,
          focusA: 0,
          focusB: 0,
          nth: rng.int(2, 3),
        }
      }
      if (ask === 'relative-from-known') {
        let longest = 0
        let shortest = 0
        items.forEach((it, i) => {
          if (it.length > items[longest].length) longest = i
          if (it.length < items[shortest].length) shortest = i
        })
        return {
          medium: 'offset-ruler',
          unitLabel: 'cm',
          ask,
          rulerMax,
          items,
          focusA: longest,
          focusB: shortest,
        }
      }
      return {
        medium: 'offset-ruler',
        unitLabel: 'cm',
        ask,
        rulerMax,
        items,
        focusA: 0,
        focusB: 0,
      }
    }
  }
}
