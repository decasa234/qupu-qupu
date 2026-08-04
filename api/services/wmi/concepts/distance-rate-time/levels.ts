// Level ladder for distance-rate-time. Same param schema ({mode, rate, t});
// difficulty climbs by which way the formula runs and how big the arithmetic is.
// `t` never drops below 2, so the body never reads "in 1 hours".
//   L1: distance, rate a multiple of 10, trip ≤ 5 h — a ×10 table fact
//   L2: distance, rate a multiple of 5 — half of a ×10 fact, longer trip
//   L3: time, rate a multiple of 10 — the formula has to be turned around (÷)
//   L4: distance, 2-digit rate off the 5s — a real 2-digit × 1-digit product
//   L5: time, rate off the 5s, up to 12 h — dividing a 3–4 digit trip by an awkward rate
import type { Rng } from '../types.js'
import type { Params } from './index.js'

/** A rate in [lo, hi] that is NOT a multiple of 5 — nothing to round off. */
function offFives(rng: Rng, lo: number, hi: number): number {
  for (let i = 0; i < 24; i++) {
    const r = rng.int(lo, hi)
    if (r % 5 !== 0) return r
  }
  return lo % 5 === 0 ? lo + 1 : lo
}

export function distanceRateTimeLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    case 1:
      return { mode: 'distance', rate: 10 * rng.int(1, 6), t: rng.int(2, 5) }
    case 2:
      return { mode: 'distance', rate: 5 * rng.int(3, 12), t: rng.int(2, 6) }
    case 3:
      return { mode: 'time', rate: 10 * rng.int(2, 9), t: rng.int(3, 7) }
    case 4:
      return { mode: 'distance', rate: offFives(rng, 21, 89), t: rng.int(4, 9) }
    case 5:
      return { mode: 'time', rate: offFives(rng, 31, 89), t: rng.int(7, 12) }
  }
}
