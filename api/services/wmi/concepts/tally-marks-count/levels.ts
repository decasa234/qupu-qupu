// Level ladder for tally-marks-count. Same param schema ({n} ∈ 3..34); the only
// thing that can climb is the size of the pile and whether a leftover group has
// to be added on top of the count-by-fives:
//   L1: 5, 10, 15 — whole groups of five, nothing left over
//   L2: 11..19 with a leftover  L3: 20..25   L4: 26..30
//   L5: 31..34 — six full groups plus a leftover, the longest count-on
import type { Rng } from '../types.js'
import type { Params } from './index.js'

export function tallyMarksCountLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    // L1 — pure skip-counting by 5, at most three groups.
    case 1: return { n: 5 * rng.int(1, 3) }
    // L2 — a leftover appears: count the groups, then count on.
    case 2: {
      const n = rng.int(11, 19)
      return { n: n % 5 === 0 ? n + 1 : n }
    }
    // L3 — four or five groups.
    case 3: return { n: rng.int(20, 25) }
    // L4 — past 25: five or six groups to hold in the head.
    case 4: return { n: rng.int(26, 30) }
    // L5 — the biggest pile the schema allows: six groups plus a leftover.
    case 5: return { n: rng.int(31, 34) }
  }
}
