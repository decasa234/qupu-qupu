// Level ladder for angle-type. Same param schema (degrees ∈ 10..170); the only
// lever is HOW FAR the drawn angle sits from the 90° square corner it must be
// compared with, plus whether the exact right angle is in play at all.
// Proxy: nearness to 90° = 90 − |degrees − 90| (bigger = harder to eyeball).
//   L1: 45°+ away, no right angle   L2: same, right angle added
//   L3: ~15–35° away   L4: ~8–18° away   L5: ~4–8° away
// This is a thin concept: rungs 3–5 differ only by shrinking the visual margin.
import type { Rng } from '../types.js'
import type { Params } from './index.js'

export function angleTypeLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    // L1: unmistakably narrow or unmistakably wide — a two-way choice
    case 1: return { degrees: rng.pick([rng.int(20, 45), rng.int(135, 160)]) }
    // L2: same obvious angles, but the exact square corner (90°) joins the field
    case 2: return { degrees: rng.pick([rng.int(20, 45), 90, rng.int(135, 160)]) }
    // L3: margin shrinks to 15–35° — the angle no longer screams its category
    case 3: return { degrees: rng.pick([rng.int(55, 75), 90, rng.int(105, 125)]) }
    // L4: within 8–18° of the square corner — must be compared, not glanced at
    case 4: return { degrees: rng.pick([rng.int(72, 82), 90, rng.int(98, 108)]) }
    // L5: within 4–8° of 90° — the closest call the figure can still show fairly
    case 5: return { degrees: rng.pick([rng.int(82, 86), 90, rng.int(94, 98)]) }
  }
}
