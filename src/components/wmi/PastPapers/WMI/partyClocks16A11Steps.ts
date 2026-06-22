// SEAMO-16-A-Q11 — two-clock time-difference puzzle.
//
// "Jennifer's party started and ended at the times shown.
//  How long was her party in minutes?"  Answer: C = 310.
//
// START = 12:10, END = 5:20 → elapsed = 5h 10min = 310 min.
//
// Beat-by-beat strategy:
//   1. Read start time: 12:10.
//   2. Read end time:   5:20.
//   3. Calculate hours difference: 5:20 - 12:10 → cross to next PM.
//      More simply: from 12:10 to 5:10 = 5 hours = 300 min.
//   4. Add remaining 10 minutes: 300 + 10 = 310.
//   5. Announce C = 310 minutes.
//
// Bound quantities from breakdown.quantities:
//   start_time = "12:10", end_time = "5:20", duration = "310 minutes"

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export const START_TIME = '12:10'
export const END_TIME   = '5:20'
export const DURATION_MIN = 310
export const ANSWER = 'C'

export type StepTone = 'goal' | 'info' | 'check' | 'win'

export interface PartyClocks16A11Step {
  /** Time shown on start clock (may be highlighted in explainer). */
  startTime: string
  /** Time shown on end clock (may be highlighted in explainer). */
  endTime: string
  /** Whether to highlight the start clock hand. */
  highlightStart: boolean
  /** Whether to highlight the end clock hand. */
  highlightEnd: boolean
  tone: StepTone
  result: boolean
  math: string | null
  caption: string
  hold: number
}

export interface PartyClocks16A11Storyboard {
  steps: PartyClocks16A11Step[]
  finalIndex: number
}

export function buildPartyClocks16A11Steps(lang: Lang): PartyClocks16A11Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: PartyClocks16A11Step[] = [
    // Beat 1 — read start time
    {
      startTime: START_TIME,
      endTime: END_TIME,
      highlightStart: true,
      highlightEnd: false,
      tone: 'goal',
      result: false,
      math: null,
      caption: t(
        'The first clock shows the party started at 12:10.',
        'Jam pertama menunjukkan pesta dimulai pukul 12:10.',
      ),
      hold: 2400,
    },
    // Beat 2 — read end time
    {
      startTime: START_TIME,
      endTime: END_TIME,
      highlightStart: false,
      highlightEnd: true,
      tone: 'info',
      result: false,
      math: null,
      caption: t(
        'The second clock shows the party ended at 5:20.',
        'Jam kedua menunjukkan pesta selesai pukul 5:20.',
      ),
      hold: 2400,
    },
    // Beat 3 — count full hours
    {
      startTime: START_TIME,
      endTime: END_TIME,
      highlightStart: false,
      highlightEnd: false,
      tone: 'info',
      result: false,
      math: t('12:10 → 5:10 = 5 hours', '12:10 → 5:10 = 5 jam'),
      caption: t(
        'From 12:10 to 5:10 is exactly 5 hours = 300 minutes.',
        'Dari 12:10 ke 5:10 adalah tepat 5 jam = 300 menit.',
      ),
      hold: 2600,
    },
    // Beat 4 — add remaining minutes
    {
      startTime: START_TIME,
      endTime: END_TIME,
      highlightStart: false,
      highlightEnd: false,
      tone: 'check',
      result: false,
      math: t('300 + 10 = 310 min', '300 + 10 = 310 menit'),
      caption: t(
        'From 5:10 to 5:20 is 10 more minutes. So 300 + 10 = 310.',
        'Dari 5:10 ke 5:20 adalah 10 menit lagi. Jadi 300 + 10 = 310.',
      ),
      hold: 2600,
    },
    // Beat 5 — answer
    {
      startTime: START_TIME,
      endTime: END_TIME,
      highlightStart: true,
      highlightEnd: true,
      tone: 'win',
      result: true,
      math: t('5 h 10 min = 310 min ✓', '5 j 10 mnt = 310 mnt ✓'),
      caption: t(
        "Jennifer's party lasted 310 minutes — answer C.",
        'Pesta Jennifer berlangsung 310 menit — jawaban C.',
      ),
      hold: 0,
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
