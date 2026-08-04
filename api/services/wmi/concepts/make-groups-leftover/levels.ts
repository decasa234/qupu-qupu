// Level ladder for make-groups-leftover. Same param schema (total 8..60,
// groupSize 3..9); difficulty climbs by how many groups must be counted out and
// by how hard the group size is to skip-count:
//   L1: 2–4 groups of 3 or 4, small enough to draw   L2: up to 20, groups of 3–5
//   L3: up to 30, groups of 4–6                      L4: 31–45, groups of 6–8
//   L5: 46–60, groups of 7–9 (most groups, hardest skip-counts)
import type { Rng } from '../types.js'
import type { Params } from './index.js'

export function makeGroupsLeftoverLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    case 1:
      return { total: rng.int(8, 12), groupSize: rng.int(3, 4) }
    case 2:
      return { total: rng.int(13, 20), groupSize: rng.int(3, 5) }
    case 3:
      return { total: rng.int(21, 30), groupSize: rng.int(4, 6) }
    case 4:
      return { total: rng.int(31, 45), groupSize: rng.int(6, 8) }
    case 5:
      return { total: rng.int(46, 60), groupSize: rng.int(7, 9) }
  }
}
