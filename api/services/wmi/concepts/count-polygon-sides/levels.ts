// Level ladder for count-polygon-sides. Same param schema ({sides} ∈ 3..8);
// difficulty climbs with how many edges the child has to track while tracing
// the outline without losing count or double-counting a corner:
//   L1: 3–4 sides (triangle / quadrilateral — the two shapes a 6-year-old names)
//   L2: 4–5 sides (pentagon appears; still countable at a glance)
//   L3: 5–6 sides (past "subitising" range — must trace, not glance)
//   L4: 6–7 sides (heptagon: no everyday name to fall back on)
//   L5: 7–8 sides (most edges the schema allows; easiest to lose the start point)
// NOTE: the whole schema admits only 6 instances (sides 3..8), so the rungs
// overlap by one shape — each level still draws 2 distinct figures.
import type { Rng } from '../types.js'
import type { Params } from './index.js'

export function countPolygonSidesLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    case 1: return { sides: rng.int(3, 4) }
    case 2: return { sides: rng.int(4, 5) }
    case 3: return { sides: rng.int(5, 6) }
    case 4: return { sides: rng.int(6, 7) }
    case 5: return { sides: rng.int(7, 8) }
  }
}
