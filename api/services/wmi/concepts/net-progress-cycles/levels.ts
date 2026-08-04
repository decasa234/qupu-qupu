// Level ladder for net-progress-cycles. Same param schema ({up, down, cycles});
// down < up at every level so the climber really does make progress. Difficulty
// climbs on gross climb (up x cycles — which is exactly the tempting wrong
// answer), so the gap the child has to resist grows with the level:
//   L1: small climb, small slip, 2-3 rounds
//   L2: slip up to 3, up to 4 rounds
//   L3: mid-size numbers, 3-5 rounds
//   L4: big climb and big slip, 4-6 rounds
//   L5: net of only 2-3 repeated 6-8 times — most rounds, widest trap gap
import type { Rng } from '../types.js'
import type { Params } from './index.js'

export function netProgressCyclesLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    case 1: {
      const up = rng.int(3, 5)
      return { up, down: rng.int(1, 2), cycles: rng.int(2, 3) }
    }
    case 2: {
      const up = rng.int(4, 6)
      return { up, down: rng.int(1, 3), cycles: rng.int(2, 4) }
    }
    case 3: {
      const up = rng.int(5, 7)
      return { up, down: rng.int(2, 4), cycles: rng.int(3, 5) }
    }
    case 4: {
      const up = rng.int(6, 8)
      return { up, down: rng.int(3, 5), cycles: rng.int(4, 6) }
    }
    case 5: {
      // Net gain is only 2 or 3, but it repeats 6-8 times: the "forgot the
      // slips" answer (up x cycles) is now more than double the true one.
      const up = rng.int(6, 8)
      const net = rng.int(2, 3)
      return { up, down: up - net, cycles: rng.int(6, 8) }
    }
  }
}
