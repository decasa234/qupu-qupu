// Level ladder for consecutive-integer-sum. Same param schema ({n, start, ask,
// neighbour}); difficulty climbs by how long the run is, whether it has ONE
// middle or two, and how big the total gets:
//   L1: n = 3, start 2–9    — shortest run, totals under 30, one clean middle
//   L2: n = 3, start 5–15   — same method, totals to 48
//   L3: n ∈ {3, 5}          — a five-long run: two pairs plus a middle
//   L4: n ∈ {4, 6}          — even runs have NO single middle; you split a pair total
//   L5: n ∈ {5, 6}, start 18–30 — longest runs at the top of the range, totals to 195
import type { Rng } from '../types.js'
import type { Params } from './index.js'

export function consecutiveIntegerSumLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  const ask = rng.pick(['smallest', 'largest'] as const)
  const neighbour = rng.pick(['low', 'high'] as const)
  switch (level) {
    case 1:
      return { n: 3, start: rng.int(2, 9), ask, neighbour }
    case 2:
      return { n: 3, start: rng.int(5, 15), ask, neighbour }
    case 3:
      return { n: rng.pick([3, 5] as const), start: rng.int(8, 20), ask, neighbour }
    case 4:
      return { n: rng.pick([4, 6] as const), start: rng.int(6, 18), ask, neighbour }
    case 5:
      return { n: rng.pick([5, 6] as const), start: rng.int(18, 30), ask, neighbour }
  }
}
