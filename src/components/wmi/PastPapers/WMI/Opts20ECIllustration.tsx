// IKMC-23-EC-Q20 — five wall clocks: option pictures ARE the A–E choices.
//
// "There are five clocks on the wall. One clock is an hour fast, one is an hour
// slow, one shows the correct time, and two have stopped. Which shows the correct
// time?"  Answer: D (3:30).
//
// The A–E choices are five analog clock-face pictures (source crops 055–059.jpg).
// There is NO separate stem figure — the options ARE the figures, so we build
// ONLY this Option renderer + an Explainer + steps (no Illustration).
//
// CLOCK TIMES reconstructed from source crops:
//   A — 12:30  (minute at 6 ↓, hour near 12 ↑)          stopped
//   B —  2:30  (minute at 6 ↓, hour between 2 and 3)     1 hour slow
//   C —  9:15  (minute at 3 →, hour between 9 and 10)    stopped
//   D —  3:30  (minute at 6 ↓, hour at 3 →)              CORRECT ← answer
//   E —  4:30  (minute at 6 ↓, hour between 4 and 5)     1 hour fast
//
// Pattern: B (2:30) is 1h slow, D (3:30) correct, E (4:30) is 1h fast.
// A (12:30) and C (9:15) are the two stopped clocks.
//
// Reuses AnalogClock20 from ClockMatch20Illustration (same clock primitive).
// Bound quantities from breakdown:
//   correct_clock = D, correct_time = 3:30
//   slow_clock  = B (2:30 = 3:30 − 1h)
//   fast_clock  = E (4:30 = 3:30 + 1h)
//
// Pure render — no Math.random, no Date — SSR-safe and deterministic.

import type { WmiChoice } from '../../../../types/wmi'
import { AnalogClock20 } from './ClockMatch20Illustration'

/** Canonical time (h:mm) for each option label as observed in the source crops. */
const TIME_BY_LABEL: Record<string, string> = {
  A: '12:30', // stopped — hour near 12, minute at 6
  B: '2:30',  // 1 hour slow
  C: '9:15',  // stopped — hour between 9-10, minute at 3
  D: '3:30',  // correct time
  E: '4:30',  // 1 hour fast
}

const ARIA_BY_LABEL: Record<string, string> = {
  A: 'Pilihan A: jam menunjukkan 12:30 (berhenti).',
  B: 'Pilihan B: jam menunjukkan 2:30 (lambat 1 jam).',
  C: 'Pilihan C: jam menunjukkan 9:15 (berhenti).',
  D: 'Pilihan D: jam menunjukkan 3:30 (waktu yang benar).',
  E: 'Pilihan E: jam menunjukkan 4:30 (cepat 1 jam).',
}

/** Renders ONE answer option as a small SVG analog clock face. */
export function Opts20ECOption({ choice }: { choice: WmiChoice }) {
  const time = TIME_BY_LABEL[choice.label]
  if (!time) return <span>{choice.text}</span>
  return (
    <span
      role="img"
      aria-label={ARIA_BY_LABEL[choice.label] ?? choice.text}
      style={{ display: 'inline-flex', justifyContent: 'center', padding: 4 }}
    >
      <AnalogClock20 time={time} size={108} />
    </span>
  )
}

export default Opts20ECOption
