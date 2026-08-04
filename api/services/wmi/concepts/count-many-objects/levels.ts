// Level ladder for count-many-objects. Same param schema; difficulty climbs on
// three dials the concept already varies: how much structure the layout hands
// you (ten-groups → rows → scatter), how many icons there are (20 → 65), and
// how tightly the near-miss options sit around the true total.
import type { Rng } from '../types.js'
import type { Params } from './index.js'

type Deltas = readonly [number, number, number]

// Wide gaps forgive a slip of one or two; tight gaps punish every slip.
const WIDE: readonly Deltas[] = [
  [-6, -4, -2],
  [2, 4, 6],
  [-4, -2, 4],
  [-5, -3, -1],
]
const MID: readonly Deltas[] = [
  [-4, -2, 2],
  [2, 3, 5],
  [-2, 2, 4],
  [-4, -2, -1],
  [-3, -1, 2],
]
const TIGHT: readonly Deltas[] = [
  [-1, 1, 2],
  [-2, -1, 2],
  [-3, -2, -1],
  [1, 2, 4],
  [-2, 1, 3],
]

const ICONS = ['star', 'apple', 'ball', 'leaf', 'fish'] as const

export function countManyObjectsLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  const icon = rng.pick(ICONS)
  switch (level) {
    // L1: the tens are already drawn as groups, only two of them, options far apart.
    case 1:
      return {
        icon,
        layout: 'grouped-tens',
        total: rng.int(20, 24),
        perRow: 10,
        distractorDeltas: [...rng.pick(WIDE)],
      }
    // L2: still ten-groups, but three of them plus a bigger leftover to add on.
    case 2:
      return {
        icon,
        layout: 'grouped-tens',
        total: rng.int(25, 34),
        perRow: 10,
        distractorDeltas: [...rng.pick(WIDE)],
      }
    // L3: rows of 5 — you must read the row size off the picture before skip-counting.
    case 3:
      return {
        icon,
        layout: 'rows',
        total: rng.int(35, 44),
        perRow: 5,
        distractorDeltas: [...rng.pick(MID)],
      }
    // L4: rows of 6–10 — an unfamiliar skip-count over a noticeably bigger pile.
    case 4:
      return {
        icon,
        layout: 'rows',
        total: rng.int(45, 54),
        perRow: rng.int(6, 10),
        distractorDeltas: [...rng.pick(MID)],
      }
    // L5: scattered — no structure at all, the most icons, and options one apart.
    case 5:
      return {
        icon,
        layout: 'scatter',
        total: rng.int(55, 65),
        perRow: rng.int(5, 10),
        distractorDeltas: [...rng.pick(TIGHT)],
      }
  }
}
