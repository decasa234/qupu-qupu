// Level ladder for dice-opposite-faces. Only EIGHT geometrically valid face
// triples exist (one face from each of the pairs 1-6, 2-5, 3-4), so the ladder
// is built by rejection-sampling the concept's own `generate` — which proves the
// three visible faces are mutually adjacent — and keeping the visible sums that
// belong on that rung. Difficulty climbs with the visible sum: bigger addends to
// add up, and a 21 − visible subtraction that borrows.
// Proxy: visible sum t + f + r (possible values 6, 7, 9, 10, 11, 12, 14, 15).
//   L1: 6–7   L2: 9–10   L3: 11–12   L4: 14   L5: 15
import type { Rng } from '../types.js'
import { generate, type Params } from './index.js'

/** Resample `generate` (which guarantees a legal, adjacent face triple) until the visible sum fits. */
function sample(rng: Rng, ok: (visible: number) => boolean): Params {
  let p = generate(rng)
  for (let i = 0; i < 200 && !ok(p.t + p.f + p.r); i++) p = generate(rng)
  return p
}

export function diceOppositeFacesLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    // L1: faces 1,2,3 / 1,2,4 — three tiny numbers to add
    case 1: return sample(rng, (v) => v <= 7)
    // L2: a 5 appears — the visible sum reaches ten
    case 2: return sample(rng, (v) => v === 9 || v === 10)
    // L3: a 6 appears — the addition crosses ten
    case 3: return sample(rng, (v) => v === 11 || v === 12)
    // L4: 6, 5 and 3 together — big addition plus a borrowing subtraction
    case 4: return sample(rng, (v) => v === 14)
    // L5: 6, 5, 4 — the largest visible sum a die can show; hidden faces are 1, 2, 3
    case 5: return sample(rng, (v) => v === 15)
  }
}
