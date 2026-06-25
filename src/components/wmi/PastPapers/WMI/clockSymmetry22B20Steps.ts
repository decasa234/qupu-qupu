// SEAMO-22-B-Q20 — Clock symmetry about the '5' at 5:00 pm
//
// "The time on the clock is now 5 pm. How many minutes later will the
// minute- and hour-hands first be of equal distance on both sides of
// the number '5'?"   Answer: A = 23 1/13 minutes.
//
// METHOD (clock-symmetry):
//   1. State starting positions: minute at 0 min-marks (12), hour at 25 (5).
//   2. Name the symmetry axis: the '5' sits at 25 min-marks from 12.
//   3. Write the symmetry condition: hour is 25 + d, minute is 25 − d.
//   4. Express in terms of t: minute = t, hour = 25 + t/12 → d = t/12.
//   5. Substitute: t = 25 − t/12 → 13t/12 = 25 → t = 300/13.
//   6. Simplify: 300/13 = 23 1/13 minutes. Answer: A.
//
// Bound to breakdown.quantities:
//   START: minute = 0, hour = 25 (min-marks from 12)
//   AXIS = 25 min-marks (the '5')
//   SYMMETRY: hour = 25 + d, minute = 25 − d → d = t/12
//   EQUATION: t = 25 − t/12 → 13t/12 = 25 → t = 300/13 = 23 1/13

import type { Lang } from '../../concepts/explainers/makeTenSteps'
import {
  START_MINUTE_ANGLE,
  START_HOUR_ANGLE,
  TARGET_MINUTE_ANGLE,
  TARGET_HOUR_ANGLE,
} from './ClockSymmetry22B20Illustration'

export { START_MINUTE_ANGLE, START_HOUR_ANGLE, TARGET_MINUTE_ANGLE, TARGET_HOUR_ANGLE }

export const ANSWER_LABEL = 'A'
export const ANSWER_VALUE = '23 1/13'   // t = 300/13 minutes

export interface ClockSymmetryStep {
  minuteAngle: number
  hourAngle: number
  showQuestion: boolean
  showAxis: boolean
  highlightFive: boolean
  tone: 'goal' | 'setup' | 'derive' | 'solve' | 'win'
  result: boolean
  math: string | null
  caption: string
  hold: number
}

export interface ClockSymmetryStoryboard {
  steps: ClockSymmetryStep[]
  finalIndex: number
}

export function buildClockSymmetrySteps(lang: Lang): ClockSymmetryStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: ClockSymmetryStep[] = [
    // Beat 1 — starting position: 5:00 pm.
    {
      minuteAngle: START_MINUTE_ANGLE,
      hourAngle:   START_HOUR_ANGLE,
      showQuestion: false,
      showAxis: false,
      highlightFive: true,
      tone: 'goal',
      result: false,
      math: t('Start: 5:00 pm', 'Mulai: pukul 5:00 sore'),
      hold: 2200,
      caption: t(
        'At 5:00 pm: minute hand is at the 12 (0 min-marks from 12), hour hand is at the 5 (25 min-marks from 12).',
        'Pukul 5:00 sore: jarum menit di angka 12 (0 tanda menit dari 12), jarum jam di angka 5 (25 tanda menit dari 12).',
      ),
    },
    // Beat 2 — axis: the '5' sits at 25 min-marks.
    {
      minuteAngle: START_MINUTE_ANGLE,
      hourAngle:   START_HOUR_ANGLE,
      showQuestion: false,
      showAxis: true,
      highlightFive: true,
      tone: 'setup',
      result: false,
      math: t('Axis = 25 min-marks (the 5)', 'Sumbu = 25 tanda menit (angka 5)'),
      hold: 2400,
      caption: t(
        "The '5' on the clock face is at 25 min-marks (= 5 × 5). We want both hands equidistant from this axis.",
        "Angka '5' pada jam berada di 25 tanda menit (= 5 × 5). Kita ingin kedua jarum berjarak sama dari sumbu ini.",
      ),
    },
    // Beat 3 — symmetry condition: hour = 25 + d, minute = 25 − d.
    {
      minuteAngle: TARGET_MINUTE_ANGLE,
      hourAngle:   TARGET_HOUR_ANGLE,
      showQuestion: true,
      showAxis: true,
      highlightFive: true,
      tone: 'derive',
      result: false,
      math: t('hour = 25 + d ; minute = 25 − d', 'jam = 25 + d ; menit = 25 − d'),
      hold: 2600,
      caption: t(
        'After t minutes: minute hand is at t min-marks; hour hand is at 25 + t/12. For symmetry about 25: t = 25 − d and 25 + t/12 = 25 + d, so d = t/12.',
        'Setelah t menit: jarum menit di posisi t; jarum jam di 25 + t/12. Untuk simetri terhadap 25: t = 25 − d dan 25 + t/12 = 25 + d, sehingga d = t/12.',
      ),
    },
    // Beat 4 — solve: substitute d = t/12 → t = 25 − t/12.
    {
      minuteAngle: TARGET_MINUTE_ANGLE,
      hourAngle:   TARGET_HOUR_ANGLE,
      showQuestion: true,
      showAxis: true,
      highlightFive: true,
      tone: 'solve',
      result: false,
      math: t('t = 25 − t/12 → 13t/12 = 25', 't = 25 − t/12 → 13t/12 = 25'),
      hold: 2600,
      caption: t(
        'Substitute d = t/12 into t = 25 − d: t = 25 − t/12 → t + t/12 = 25 → 13t/12 = 25 → t = 300/13.',
        'Substitusi d = t/12 ke t = 25 − d: t = 25 − t/12 → t + t/12 = 25 → 13t/12 = 25 → t = 300/13.',
      ),
    },
    // Beat 5 — answer: t = 300/13 = 23 1/13 minutes.
    {
      minuteAngle: TARGET_MINUTE_ANGLE,
      hourAngle:   TARGET_HOUR_ANGLE,
      showQuestion: false,
      showAxis: true,
      highlightFive: true,
      tone: 'win',
      result: true,
      math: t('t = 300 ÷ 13 = 23 1/13 min', 't = 300 ÷ 13 = 23 1/13 menit'),
      hold: 0,
      caption: t(
        '300 ÷ 13 = 23 remainder 1, so t = 23 1/13 minutes. The answer is A (23 1/13).',
        '300 ÷ 13 = 23 sisa 1, sehingga t = 23 1/13 menit. Jawaban: A (23 1/13).',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
