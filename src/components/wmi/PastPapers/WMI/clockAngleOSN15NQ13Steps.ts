// OSN-15-SD-NAS-Q13 — papan cerita explainer sudut jarum jam.
//
// Pukul 03:25. Sudut lancip antara jarum menit (150°) dan jarum jam (102,5°) = 47,5°.
//
// Urutan beat:
//   0. intro     — tampilkan jam pukul 03:25 statis; "Berapa sudut lancipnya?"
//   1. minute    — sorot jarum menit; hitung 25 × 6° = 150°
//   2. hour      — sorot jarum jam; hitung 90° + 25×0,5° = 102,5°
//   3. subtract  — tampilkan busur & hitung 150° − 102,5° = 47,5°
//   4. answer    — konfirmasi: sudut lancip = 47,5°
//
// Murni builder: (lang) => storyboard. Aman untuk SSR (tidak ada Math.random / Date).

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export const MINUTE_DEG  = 150
export const HOUR_DEG    = 102.5
export const ANSWER_DEG  = 47.5

export type ClockAngleOSN15Phase = 'intro' | 'minute' | 'hour' | 'subtract' | 'answer'

export interface ClockAngleOSN15Step {
  phase: ClockAngleOSN15Phase
  caption: string
  hold: number
  result: boolean
}

export interface ClockAngleOSN15Storyboard {
  minuteDeg: number
  hourDeg:   number
  answerDeg: number
  steps: ClockAngleOSN15Step[]
  finalIndex: number
}

export function buildClockAngleOSN15NQ13Steps(lang: Lang): ClockAngleOSN15Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: ClockAngleOSN15Step[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      hold: 2000,
      result: false,
      caption: t(
        'Clock at 03:25. What is the acute angle between the two hands?',
        'Jam menunjukkan pukul 03:25. Berapa sudut lancip antara kedua jarum?',
      ),
    },
    // Beat 1 — jarum menit
    {
      phase: 'minute',
      hold: 2400,
      result: false,
      caption: t(
        'Minute hand: 25 min × 6°/min = 150° (pointing between 4 and 5).',
        'Jarum menit: 25 menit × 6°/menit = 150° (menunjuk antara angka 4 dan 5).',
      ),
    },
    // Beat 2 — jarum jam
    {
      phase: 'hour',
      hold: 2400,
      result: false,
      caption: t(
        'Hour hand at 03:25: 3 × 30° + 25 × 0.5° = 90° + 12.5° = 102.5° (just past 3).',
        'Jarum jam pukul 03:25: 3 × 30° + 25 × 0,5° = 90° + 12,5° = 102,5° (sedikit melewati 3).',
      ),
    },
    // Beat 3 — hitung selisih
    {
      phase: 'subtract',
      hold: 2400,
      result: false,
      caption: t(
        'Angle between = 150° − 102.5° = 47.5°.',
        'Sudut di antara jarum = 150° − 102,5° = 47,5°.',
      ),
    },
    // Beat 4 — jawaban
    {
      phase: 'answer',
      hold: 0,
      result: true,
      caption: t(
        'The acute angle at 03:25 is 47.5°.',
        'Sudut lancip pada pukul 03:25 adalah 47,5°.',
      ),
    },
  ]

  return {
    minuteDeg: MINUTE_DEG,
    hourDeg:   HOUR_DEG,
    answerDeg: ANSWER_DEG,
    steps,
    finalIndex: steps.length - 1,
  }
}
