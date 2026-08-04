// Level ladder for legs-items-rate. Same param schema ({kinds, counts});
// difficulty climbs by the leg-rates in play (2 and 4 are known by heart, 6 and
// 8 must be read off the note) and by how big each group is:
//   L1: only 2- and 4-legged animals, 1-2 of each
//   L2: same familiar animals, up to 3 of each
//   L3: one unfamiliar rate (spider 8 or ant 6) joins, up to 4 of each
//   L4: the unfamiliar rate stays, groups are 2-5 (no group is a freebie 1)
//   L5: BOTH spider (8) and ant (6), 3-5 of every animal — biggest totals
import type { Rng } from '../types.js'
import type { Params } from './index.js'

const FAMILIAR = ['cat', 'dog', 'cow', 'chicken', 'duck'] as const // 4 or 2 legs
const ODD = ['spider', 'ant'] as const // 8 and 6 legs — stated as a note in the stem

function build(rng: Rng, kinds: string[], lo: number, hi: number): Params {
  return { kinds: rng.shuffle(kinds), counts: [rng.int(lo, hi), rng.int(lo, hi), rng.int(lo, hi)] }
}

export function legsItemsRateLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    case 1:
      return build(rng, rng.shuffle(FAMILIAR).slice(0, 3), 1, 2)
    case 2:
      return build(rng, rng.shuffle(FAMILIAR).slice(0, 3), 1, 3)
    case 3:
      return build(rng, [rng.pick(ODD), ...rng.shuffle(FAMILIAR).slice(0, 2)], 1, 4)
    case 4:
      return build(rng, [rng.pick(ODD), ...rng.shuffle(FAMILIAR).slice(0, 2)], 2, 5)
    case 5:
      return build(rng, [...ODD, rng.pick(FAMILIAR)], 3, 5)
  }
}
