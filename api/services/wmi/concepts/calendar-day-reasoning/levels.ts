// Level ladder for calendar-day-reasoning. Same param schema (startDay 0..6,
// delta 1..60); difficulty climbs on how many whole weeks have to be peeled off
// before the remainder can be hopped:
//   L1: delta 1..6   — under a week, count forward, no division at all
//   L2: delta 8..13  — exactly one full week to discard first
//   L3: delta 15..27 — two or three weeks; ÷7 is now a real division
//   L4: delta 29..45 — four to six weeks
//   L5: delta 46..60 — up to eight weeks, the largest span the schema allows
// INVARIANT at every rung: delta % 7 !== 0, so the answer day is never the start
// day and the "count r days on" step is never a no-op.
import type { Rng } from '../types.js'
import type { Params } from './index.js'

// Draw a delta in [lo, hi] that is not a whole number of weeks.
function pickDelta(rng: Rng, lo: number, hi: number, fallback: number): number {
  for (let i = 0; i < 30; i++) {
    const d = rng.int(lo, hi)
    if (d % 7 !== 0) return d
  }
  return fallback
}

export function calendarDayReasoningLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  const startDay = rng.int(0, 6)
  switch (level) {
    case 1: return { startDay, delta: rng.int(1, 6) } // 1..6 is never ÷7
    case 2: return { startDay, delta: pickDelta(rng, 8, 13, 9) }
    case 3: return { startDay, delta: pickDelta(rng, 15, 27, 16) }
    case 4: return { startDay, delta: pickDelta(rng, 29, 45, 30) }
    case 5: return { startDay, delta: pickDelta(rng, 46, 60, 47) }
  }
}
