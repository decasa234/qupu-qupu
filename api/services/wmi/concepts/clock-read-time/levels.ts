// Level ladder for clock-read-time. Same param schema ({hour, minute, options});
// difficulty climbs by how finely the minute hand has to be read and by how close
// the distractors sit to the true time:
//   L1: o'clock only, distractor hours far away   L2: o'clock + half past
//   L3: all four quarters                          L4: quarter past / quarter to,
//       with the ±1-hour trap (the hour hand no longer points at a number)
//   L5: any five-minute mark, plus the swapped-hands distractor
import type { Rng } from '../types.js'
import { fmt, type Params } from './index.js'

/** Exactly four distinct option strings, always containing the true time. */
function build(rng: Rng, hour: number, minute: number, pool: string[]): Params {
  const correct = fmt(hour, minute)
  const seen = new Set([correct])
  const distractors: string[] = []
  for (const cand of rng.shuffle(pool)) {
    if (seen.has(cand)) continue
    seen.add(cand)
    distractors.push(cand)
    if (distractors.length === 3) break
  }
  // Top up from the other hours at the same minute (never runs dry: 11 candidates).
  for (let h = 1; distractors.length < 3 && h <= 12; h++) {
    const cand = fmt(h, minute)
    if (seen.has(cand)) continue
    seen.add(cand)
    distractors.push(cand)
  }
  return { hour, minute, options: rng.shuffle([correct, ...distractors]) }
}

/** Wrap an hour offset back into 1..12. */
function hourAt(hour: number, delta: number): number {
  return ((hour - 1 + delta + 120) % 12) + 1
}

export function clockReadTimeLevels(rng: Rng, level: 1 | 2 | 3 | 4 | 5): Params {
  switch (level) {
    // L1 — whole hours only; every wrong option is a far-away hour, so a rough
    // glance at the short hand is enough.
    case 1: {
      const hour = rng.int(1, 12)
      const pool = [3, 5, 7, 9].map((d) => fmt(hourAt(hour, d), 0))
      return build(rng, hour, 0, pool)
    }
    // L2 — half past joins o'clock: the long hand now has two places to be.
    case 2: {
      const hour = rng.int(1, 12)
      const minute = rng.pick([0, 30])
      const pool = [
        fmt(hour, minute === 0 ? 30 : 0),
        fmt(hourAt(hour, 2), minute),
        fmt(hourAt(hour, -3), minute),
        fmt(hourAt(hour, 4), minute),
      ]
      return build(rng, hour, minute, pool)
    }
    // L3 — all four quarters; the wrong options include the other quarters of the
    // same hour, so the minute hand has to be read properly.
    case 3: {
      const hour = rng.int(1, 12)
      const minute = rng.pick([0, 15, 30, 45])
      const pool = [
        ...[0, 15, 30, 45].filter((q) => q !== minute).map((q) => fmt(hour, q)),
        fmt(hourAt(hour, 2), minute),
      ]
      return build(rng, hour, minute, pool)
    }
    // L4 — quarter past / quarter to only. The short hand sits BETWEEN two
    // numbers, and the neighbouring hours are on the option list: the classic
    // "is it 3:45 or 4:45?" slip.
    case 4: {
      const hour = rng.int(1, 12)
      const minute = rng.pick([15, 45])
      const pool = [
        fmt(hourAt(hour, 1), minute),
        fmt(hourAt(hour, -1), minute),
        fmt(hour, minute === 15 ? 45 : 15),
        fmt(hour, 30),
      ]
      return build(rng, hour, minute, pool)
    }
    // L5 — any five-minute mark (no quarter to lean on), and the distractors add
    // the swapped-hands reading (long hand read as the hour), the ±1 hour, and a
    // neighbouring five-minute mark.
    case 5: {
      const hour = rng.int(1, 11) // keeps the swapped minute (hour × 5) under 60
      const minute = rng.pick([5, 10, 20, 25, 35, 40, 50, 55])
      const pool = [
        fmt(minute / 5, hour * 5), // hands read the wrong way round
        fmt(hourAt(hour, 1), minute),
        fmt(hour, minute === 55 ? 50 : minute + 5),
        fmt(hour, minute === 5 ? 10 : minute - 5),
      ]
      return build(rng, hour, minute, pool)
    }
  }
}
