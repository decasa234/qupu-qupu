// Level ladder for compare-order-numbers. Same param schema ({x,y,z} ∈ 11..98,
// distinct); difficulty climbs as the three numbers crowd together, so the
// comparison moves from "one glance at the tens" down to "the ones digit alone".
import type { Rng } from '../types.js'
import type { Params } from './index.js'

function shuffled(rng: Rng, a: number, b: number, c: number): Params {
  const [x, y, z] = rng.shuffle([a, b, c])
  return { x, y, z }
}

export function compareOrderNumbersLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    // L1: three different decades, far apart — the tens digit settles everything.
    case 1: {
      const a = rng.int(11, 25)
      const b = a + rng.int(30, 35)
      return shuffled(rng, a, b, b + rng.int(30, 35))
    }
    // L2: still different decades, but only one or two apart.
    case 2: {
      const a = rng.int(11, 45)
      const b = a + rng.int(15, 22)
      return shuffled(rng, a, b, b + rng.int(15, 22))
    }
    // L3: gaps under ten, so two of the three often share a decade.
    case 3: {
      const a = rng.int(11, 70)
      const b = a + rng.int(5, 10)
      return shuffled(rng, a, b, b + rng.int(5, 10))
    }
    // L4: all three inside ONE decade — the tens digit is useless, compare ones.
    case 4: {
      const t = rng.int(2, 8)
      const o1 = rng.int(0, 3)
      const o2 = o1 + rng.int(2, 3)
      const o3 = o2 + rng.int(2, 3)
      return shuffled(rng, t * 10 + o1, t * 10 + o2, t * 10 + o3)
    }
    // L5: three consecutive numbers — ones digits one apart, no room to slip.
    case 5: {
      const base = rng.int(2, 8) * 10 + rng.int(0, 7)
      return shuffled(rng, base, base + 1, base + 2)
    }
  }
}
