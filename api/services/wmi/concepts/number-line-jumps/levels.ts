// Level ladder for number-line-jumps. Same param schema (start ∈ 0..10,
// step ∈ 2..6, jumps ∈ 2..6); difficulty climbs by the skip-count table the
// child needs (2s → 3s → 4s → 5s → 6s), by how many jumps must be chained, and
// by starting away from a round number so the landing is not just step × jumps.
import type { Rng } from '../types.js'
import type { Params } from './index.js'

export function numberLineJumpsLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    // L1: count by 2s, two or three jumps, from the very start of the line.
    case 1:
      return { start: rng.int(0, 2), step: 2, jumps: rng.int(2, 3) }
    // L2: count by 3s, one jump longer.
    case 2:
      return { start: rng.int(0, 4), step: 3, jumps: rng.int(3, 4) }
    // L3: count by 4s from a start that is no longer near zero.
    case 3:
      return { start: rng.int(2, 6), step: 4, jumps: rng.int(4, 5) }
    // L4: count by 5s, five jumps, from a mid-line start.
    case 4:
      return { start: rng.int(3, 8), step: 5, jumps: 5 }
    // L5: the biggest step and the most jumps the schema allows, highest start.
    case 5:
      return { start: rng.int(5, 10), step: 6, jumps: rng.int(5, 6) }
  }
}
