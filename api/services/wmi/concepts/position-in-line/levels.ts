// Level ladder for position-in-line. The schema is a four-mode union and each
// mode is a genuinely different question, so the ladder stages the modes in
// order of reasoning depth AND lengthens the line at every step:
//   L1/L2 count-total (add the two groups + yourself) → L3 from-back (flip the
//   direction) → L4 reversal (the whole line turns around) → L5 between (two
//   children, and both of them must be excluded from the count).
import type { Rng } from '../types.js'
import type { Params } from './index.js'

const NAMES = ['Dan', 'Paul', 'Ann', 'Ken', 'Maya', 'Budi', 'Lina', 'Rio'] as const

export function positionInLineLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    // L1: the shortest line (3–7 children) — front group + me + back group.
    case 1:
      return {
        mode: 'count-total',
        name: rng.pick(NAMES),
        fromFront: rng.int(2, 4),
        fromBack: rng.int(2, 4),
      }
    // L2: same idea, a line twice as long (9–15), so the two groups are bigger.
    case 2:
      return {
        mode: 'count-total',
        name: rng.pick(NAMES),
        fromFront: rng.int(5, 8),
        fromBack: rng.int(5, 8),
      }
    // L3: direction flips — given the whole line, find the place from the back.
    case 3: {
      const n = rng.int(16, 19)
      return { mode: 'from-back', name: rng.pick(NAMES), n, pos: rng.int(2, n - 1) }
    }
    // L4: the line turns around, so the old front-rank becomes the back-rank.
    case 4: {
      const n = rng.int(20, 22)
      return { mode: 'reversal', name: rng.pick(NAMES), n, pos: rng.int(2, n - 1) }
    }
    // L5: longest line, two children, and the fencepost — exclude both of them.
    case 5: {
      const n = rng.int(23, 25)
      const posA = rng.int(1, n - 4)
      const posB = rng.int(posA + 3, Math.min(posA + 9, n))
      const [nameA, nameB] = rng.shuffle(NAMES)
      return { mode: 'between', nameA, nameB, n, posA, posB }
    }
  }
}
