// Level ladder for painted-cube-faces-count. Same param schema ({n, k});
// difficulty climbs on the SHAPE OF THE COUNT the child has to reason out — the
// corners are a constant, the edges grow in a line, the face centres grow as a
// square, the hidden interior grows as a cube — and then on how big n is.
//   L1: k = 3, any n — corners; always 8, no matter how big the cube
//   L2: k = 2, n = 3–4 — edges: 12 lots of (n − 2)
//   L3: k = 2 at n = 5, or k = 1 at n = 3 — the last linear case / the first square
//   L4: k = 1 at n = 4–5, and k = 0 at n = 3 — squares, plus meeting the hidden
//       interior at its smallest (exactly one unpainted cube)
//   L5: k = 0, n = 4–5 — the interior as a cube: 8 and 27 cubes nobody can see
// NOTE: the schema admits only n 3–5 × k 0–3 = TWELVE params in total, so every
// rung is a short list rather than a range.
import type { Rng } from '../types.js'
import type { Params } from './index.js'

const POOLS: Record<1 | 2 | 3 | 4 | 5, Params[]> = {
  1: [{ n: 3, k: 3 }, { n: 4, k: 3 }, { n: 5, k: 3 }],
  2: [{ n: 3, k: 2 }, { n: 4, k: 2 }],
  3: [{ n: 5, k: 2 }, { n: 3, k: 1 }],
  4: [{ n: 4, k: 1 }, { n: 5, k: 1 }, { n: 3, k: 0 }],
  5: [{ n: 4, k: 0 }, { n: 5, k: 0 }],
}

export function paintedCubeFacesCountLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  return { ...rng.pick(POOLS[level]) }
}
