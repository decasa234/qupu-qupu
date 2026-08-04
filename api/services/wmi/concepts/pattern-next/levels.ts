// Level ladder for pattern-next. Climbs along the two axes the concept's own
// generate() varies: which rule shape the child must read off (arithmetic →
// growing gaps → two alternating operations) and how big the numbers get.
import type { Rng } from '../types.js'
import type { Params } from './index.js'

export function patternNextLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    // L1: count on by 1 or 2 from a small start — every term stays under 12.
    case 1:
      return { mode: 'arithmetic', start: rng.int(1, 5), step: rng.int(1, 2) }
    // L2: same one-step rule, but a big jump the child must skip-count.
    case 2:
      return { mode: 'arithmetic', start: rng.int(1, 15), step: rng.int(3, 9) }
    // L3: the gap itself grows — a two-level rule, kept small and gentle.
    case 3:
      return { mode: 'second-diff', start: rng.int(1, 10), diff0: rng.int(1, 3), diffStep: rng.int(1, 2) }
    // L4: gaps grow fast, so the terms run away and the growth must be tracked.
    case 4:
      return { mode: 'second-diff', start: rng.int(1, 10), diff0: rng.int(3, 5), diffStep: rng.int(3, 4) }
    // L5: two rules alternate (×m then +k) — the child must also work out WHICH
    // rule is due next, the hardest thing this schema can express.
    case 5:
      return { mode: 'alt-rule', start: rng.int(1, 5), addK: rng.int(2, 6), mulK: rng.int(2, 3) }
  }
}
