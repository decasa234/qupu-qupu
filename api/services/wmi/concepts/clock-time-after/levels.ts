// Level ladder for clock-time-after. Same param schema ({hour,minute,addHour,
// addMin}); difficulty climbs by how much time is added and by which of the two
// hard events the child must handle: the minute carry (minute + addMin ≥ 60)
// and the 12-hour wrap. Difficulty proxy = total minutes advanced
// (addHour × 60 + addMin).
//   L1: o'clock start, no carry, no wrap — pure count-on of whole hours
//   L2: quarter-hour start, still no carry and no wrap
//   L3: minute carry forced (5-minute values), wrap not required
//   L4: minute carry AND 12-hour wrap, still 5-minute values
//   L5: carry + wrap + off-grid minutes (any 1–59) and the longest jumps
import type { Rng } from '../types.js'
import type { Params } from './index.js'

/** Multiples of 5 in [lo, hi] (lo, hi already multiples of 5). */
function step5(rng: Rng, lo: number, hi: number): number {
  return rng.int(lo / 5, hi / 5) * 5
}

export function clockTimeAfterLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    // L1 — starts on the hour, adds 1–2 hours + 15 or 30 min: nothing rolls over.
    case 1: {
      const addHour = rng.int(1, 2)
      return { hour: rng.int(1, 12 - addHour), minute: 0, addHour, addMin: rng.pick([15, 30] as const) }
    }
    // L2 — quarter-hour start; the pair is chosen so the minutes still stay under 60.
    case 2: {
      const [minute, addMin] = rng.pick([
        [0, 15], [0, 30], [0, 45], [15, 15], [15, 30], [30, 15],
      ] as const)
      const addHour = rng.int(1, 3)
      return { hour: rng.int(1, 12 - addHour), minute, addMin, addHour }
    }
    // L3 — first level where the minutes always reach 60, so one hour must be carried.
    case 3: {
      const minute = step5(rng, 5, 55)
      return {
        hour: rng.int(1, 12),
        minute,
        addHour: rng.int(2, 4),
        addMin: step5(rng, 60 - minute, 55),
      }
    }
    // L4 — carry AND the hour hand passes 12, so the count must wrap back to 1.
    case 4: {
      const minute = step5(rng, 5, 55)
      const addHour = rng.int(3, 5)
      return {
        // hour ≥ 12 − addHour ⇒ hour + addHour + 1 carried > 12
        hour: rng.int(12 - addHour, 12),
        minute,
        addHour,
        addMin: step5(rng, 60 - minute, 55),
      }
    }
    // L5 — carry + wrap + minutes off the 5-minute grid, and the longest jumps.
    case 5: {
      const minute = rng.int(1, 59)
      const addHour = rng.int(4, 5)
      return {
        hour: rng.int(12 - addHour, 12),
        minute,
        addHour,
        addMin: rng.int(60 - minute, 59),
      }
    }
  }
}
