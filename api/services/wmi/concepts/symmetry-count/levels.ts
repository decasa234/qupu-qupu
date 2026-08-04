// Level ladder for symmetry-count. Same param schema ({kind} ∈ 6 shapes);
// difficulty climbs with how many fold lines there are to find — the count IS
// the answer, and every extra line is one more the child can miss:
//   L1: isosceles triangle — 1 line, the single obvious top-to-base fold
//   L2: rectangle — 2 lines, and the diagonal that looks like one but is not
//   L3: equilateral triangle — 3 lines, one per vertex
//   L4: square — 4 lines; the two diagonals are the classic miss (kids say 2)
//   L5: regular pentagon / hexagon — 5–6 lines, the most the schema allows,
//       and the hexagon mixes two different KINDS of line (vertex, mid-side)
// NOTE: the whole schema admits only 6 instances (6 shape kinds), so L1–L4 draw
// a single fixed figure each and L5 draws one of two.
import type { Rng } from '../types.js'
import type { Params } from './index.js'

export function symmetryCountLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    case 1: return { kind: 'isosceles-triangle' }
    case 2: return { kind: 'rectangle' }
    case 3: return { kind: 'equilateral-triangle' }
    case 4: return { kind: 'square' }
    case 5: return { kind: rng.pick(['regular-pentagon', 'regular-hexagon'] as const) }
  }
}
