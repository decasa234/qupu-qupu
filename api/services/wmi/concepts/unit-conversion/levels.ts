// Level ladder for unit-conversion. Same param schema ({mode,big,small});
// difficulty climbs by the size of the conversion rate and how messy the
// leftover is. Difficulty proxy = the answer value (big × factor + small).
//   L1: ×100 rate, round-tens leftover (just write the tens digit)
//   L2: ×100 rate, any 2-digit leftover — includes leftovers < 10 (hidden zero)
//   L3: ×1000 rate, round-hundreds leftover (new, bigger rate; easy leftover)
//   L4: ×1000 rate, any 3-digit leftover
//   L5: ×1000 rate, big ≥ 5 and a 3-digit leftover that is not a round ten
import type { Rng } from '../types.js'
import type { Params } from './index.js'

export function unitConversionLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    // L1 — 1 m = 100 cm, leftover is a whole number of tens: 3 m 40 cm → 340.
    case 1:
      return { mode: 'm-cm', big: rng.int(1, 5), small: rng.int(0, 9) * 10 }
    // L2 — same ×100 rate, but any leftover: 4 m 7 cm → 407 needs the zero.
    case 2:
      return {
        mode: rng.pick(['m-cm', 'dollar-cent'] as const),
        big: rng.int(1, 9),
        small: rng.int(1, 99),
      }
    // L3 — the rate jumps to ×1000 (kg → g); leftover stays a round hundred.
    case 3:
      return { mode: 'kg-g', big: rng.int(1, 5), small: rng.int(0, 9) * 100 }
    // L4 — ×1000 with any 3-digit leftover: four-digit answers with two zeros to place.
    case 4:
      return { mode: 'kg-g', big: rng.int(1, 9), small: rng.int(1, 999) }
    // L5 — ×1000, biggest kilograms, leftover 101–999 and never a round ten.
    case 5:
      return { mode: 'kg-g', big: rng.int(5, 9), small: rng.int(10, 99) * 10 + rng.int(1, 9) }
  }
}
