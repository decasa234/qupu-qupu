// Level ladder for direction-orientation. Same param schema ({start,turns});
// difficulty climbs by the number of quarter-turns to track, and by whether the
// child must first fold away a full circle (4 turns) before counting the rest.
// Difficulty proxy = turns.
//   L1: 1–2 turns — step round the compass once or twice
//   L2: 2–4 turns — reaches the full circle (4 turns = back where you started)
//   L3: 4–5 turns — full circle plus a leftover step
//   L4: 5–6 turns   L5: 6–7 turns — the most the schema allows
// POOL WARNING: the schema admits only 4 starts × 7 turns = 28 params in total,
// so EVERY level here has 8–12 distinct instances. A child repeating one level
// will see the same handful of questions; widening `turns` in index.ts is the
// only real fix.
import type { Rng } from '../types.js'
import type { Params } from './index.js'

export function directionOrientationLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    // L1 — one or two steps clockwise, no wrap-around thinking. (8 params)
    case 1: return { start: rng.int(0, 3), turns: rng.int(1, 2) }
    // L2 — includes 4 turns, the "full circle brings you back" case. (12 params)
    case 2: return { start: rng.int(0, 3), turns: rng.int(2, 4) }
    // L3 — a full circle plus a leftover turn to count on. (8 params)
    case 3: return { start: rng.int(0, 3), turns: rng.int(4, 5) }
    // L4 — more leftover turns after the circle. (8 params)
    case 4: return { start: rng.int(0, 3), turns: rng.int(5, 6) }
    // L5 — the longest turn sequences the schema allows. (8 params)
    case 5: return { start: rng.int(0, 3), turns: rng.int(6, 7) }
  }
}
