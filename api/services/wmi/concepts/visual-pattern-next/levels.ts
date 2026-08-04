// Level ladder for visual-pattern-next. Climbs on the three things the concept
// varies: how long the repeating cycle is, how many pictures must be counted
// through before the blank, and how many attributes the child has to track.
import type { Rng } from '../types.js'
import type { AttrItem, Params } from './index.js'

// Mirrors the shape/colour vocabularies in index.ts (the zod enums validate them).
const SHAPES = ['circle', 'triangle', 'square', 'star'] as const
const COLOURS = ['red', 'blue', 'green', 'yellow'] as const

export function visualPatternNextLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    // L1: two shapes taking turns, short row — the pattern is visible at a glance.
    case 1:
      return { mode: 'simple', cycle: rng.shuffle(SHAPES).slice(0, 2), shown: rng.int(5, 6) }
    // L2: three shapes in the cycle — one more position to keep straight.
    case 2:
      return { mode: 'simple', cycle: rng.shuffle(SHAPES).slice(0, 3), shown: rng.int(6, 7) }
    // L3: same three-shape cycle, but a longer row to count through.
    case 3:
      return { mode: 'long-cycle', cycle: rng.shuffle(SHAPES).slice(0, 3), shown: rng.int(7, 8) }
    // L4: the longest cycle (4) over the longest row (9–10) — pure index tracking.
    case 4:
      return { mode: 'long-cycle', cycle: rng.shuffle(SHAPES).slice(0, 4), shown: rng.int(9, 10) }
    // L5: shape AND colour change together — two attributes at once, long row.
    case 5: {
      const shapes = rng.shuffle(SHAPES)
      const colours = rng.shuffle(COLOURS)
      const cycle: AttrItem[] = [0, 1, 2].map((i) => ({ shape: shapes[i], colour: colours[i] }))
      return { mode: 'two-attr', cycle, shown: rng.int(8, 9) }
    }
  }
}
