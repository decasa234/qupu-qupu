// Level ladder for number-pyramid. Same param schema ({a,b,c} ∈ 1..20); the top
// block is a + 2b + c, so difficulty is just how big the three additions get:
//   L1: 1–5   — both middle blocks stay ≤ 10, the top ≤ 20
//   L2: 2–9   — the middle row crosses ten
//   L3: 4–13  — two-digit middle blocks, top in the thirties
//   L4: 7–17 with b ≥ 10 — the doubled middle block is itself two-digit
//   L5: 11–20 — everything two-digit, top from 44 up to 80
import type { Rng } from '../types.js'
import type { Params } from './index.js'

export function numberPyramidLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    case 1:
      return { a: rng.int(1, 5), b: rng.int(1, 5), c: rng.int(1, 5) }
    case 2:
      return { a: rng.int(2, 9), b: rng.int(2, 9), c: rng.int(2, 9) }
    case 3:
      return { a: rng.int(4, 13), b: rng.int(4, 13), c: rng.int(4, 13) }
    case 4:
      return { a: rng.int(7, 17), b: rng.int(10, 17), c: rng.int(7, 17) }
    case 5:
      return { a: rng.int(11, 20), b: rng.int(13, 20), c: rng.int(11, 20) }
  }
}
