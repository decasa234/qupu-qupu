// SEAMOX-22-B-Q1 — Clock straight-line problem at 7 a.m.
//
// Beat-by-beat explainer: 7:00 start → identify positions → relative speed
// → straight-line equation → first solution t = 60/11 ≈ 5.45 min → official key 21 min.
//
// Bound to breakdown.quantities:
//   hourAngle_start   = 210° (7 × 30°)
//   minuteAngle_start = 0°
//   relativeSpeed     = 5.5°/min
//   equation          = 210 − 5.5t = 180 → t = 30/5.5 = 60/11 ≈ 5.45 min
//   officialAnswer    = 21 minutes (FLAG — math gives 60/11 ≈ 5.45 min)

import type { Lang } from '../../concepts/explainers/makeTenSteps'
import {
  MINUTE_ANGLE_7,
  HOUR_ANGLE_7,
  STRAIGHT_MINUTE_ANGLE,
  STRAIGHT_HOUR_ANGLE,
} from './ClockStraightX22B1Illustration'

export { MINUTE_ANGLE_7, HOUR_ANGLE_7, STRAIGHT_MINUTE_ANGLE, STRAIGHT_HOUR_ANGLE }

export const ANSWER_VALUE = '21'       // per official key (flagged)
export const MATH_ANSWER  = '60/11'   // ≈ 5.45 min — first straight-line moment

export interface ClockStraightStep {
  minuteAngle: number
  hourAngle: number
  showQuestionArc: boolean
  showStraightLine: boolean
  tone: 'goal' | 'setup' | 'derive' | 'solve' | 'win'
  result: boolean
  math: string | null
  caption: string
  hold: number
}

export interface ClockStraightStoryboard {
  steps: ClockStraightStep[]
  finalIndex: number
}

export function buildClockStraightSteps(lang: Lang): ClockStraightStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: ClockStraightStep[] = [
    // Beat 1 — starting state: 7:00 AM
    {
      minuteAngle: MINUTE_ANGLE_7,
      hourAngle:   HOUR_ANGLE_7,
      showQuestionArc: true,
      showStraightLine: false,
      tone: 'goal',
      result: false,
      math: t('7:00 AM — start', 'Pukul 7:00 pagi — mulai'),
      hold: 2400,
      caption: t(
        'At 7:00 AM: the minute hand points at 12 (0°) and the hour hand points at 7 (7 × 30° = 210°). The gap between them is 210°.',
        'Pukul 7:00 pagi: jarum menit menunjuk ke 12 (0°) dan jarum jam menunjuk ke 7 (7 × 30° = 210°). Selisih antara keduanya adalah 210°.',
      ),
    },
    // Beat 2 — relative speed
    {
      minuteAngle: MINUTE_ANGLE_7,
      hourAngle:   HOUR_ANGLE_7,
      showQuestionArc: true,
      showStraightLine: false,
      tone: 'setup',
      result: false,
      math: t('Minute gains 5.5°/min', 'Menit mendahului 5,5°/menit'),
      hold: 2400,
      caption: t(
        'The minute hand moves at 6°/min; the hour hand at 0.5°/min. The minute hand closes the gap at 6 − 0.5 = 5.5°/min relative to the hour hand.',
        'Jarum menit bergerak 6°/menit; jarum jam 0,5°/menit. Jarum menit menutup celah dengan kecepatan 6 − 0,5 = 5,5°/menit relatif terhadap jarum jam.',
      ),
    },
    // Beat 3 — set up the 180° equation
    {
      minuteAngle: MINUTE_ANGLE_7,
      hourAngle:   HOUR_ANGLE_7,
      showQuestionArc: false,
      showStraightLine: false,
      tone: 'derive',
      result: false,
      math: t('210° − 5.5t = 180°', '210° − 5,5t = 180°'),
      hold: 2600,
      caption: t(
        'For a straight line, the hands must be 180° apart. Gap = 210° − 5.5t. Set to 180°: 210 − 5.5t = 180 → 5.5t = 30 → t = 30/5.5 = 60/11 ≈ 5.45 min.',
        'Agar garis lurus, kedua jarum harus berselisih 180°. Celah = 210° − 5,5t. Samakan dengan 180°: 210 − 5,5t = 180 → 5,5t = 30 → t = 30/5,5 = 60/11 ≈ 5,45 menit.',
      ),
    },
    // Beat 4 — show the first straight-line moment
    {
      minuteAngle: STRAIGHT_MINUTE_ANGLE,
      hourAngle:   STRAIGHT_HOUR_ANGLE,
      showQuestionArc: false,
      showStraightLine: true,
      tone: 'solve',
      result: false,
      math: t('t = 60/11 ≈ 5 min 27 s', 't = 60/11 ≈ 5 menit 27 detik'),
      hold: 2600,
      caption: t(
        'At t = 60/11 ≈ 5.45 min: minute at ~32.7°, hour at ~212.7° — they are exactly 180° apart, forming a straight line through the clock center.',
        'Pada t = 60/11 ≈ 5,45 menit: menit ≈ 32,7°, jam ≈ 212,7° — keduanya tepat 180° terpisah, membentuk garis lurus melewati pusat jam.',
      ),
    },
    // Beat 5 — official key result
    {
      minuteAngle: STRAIGHT_MINUTE_ANGLE,
      hourAngle:   STRAIGHT_HOUR_ANGLE,
      showQuestionArc: false,
      showStraightLine: true,
      tone: 'win',
      result: true,
      math: t(`Official key: ${ANSWER_VALUE} min`, `Kunci resmi: ${ANSWER_VALUE} menit`),
      hold: 3000,
      caption: t(
        `Per the official answer key: ${ANSWER_VALUE} minutes. (Note: the mathematical first straight-line is at 60/11 ≈ 5.45 min; the official answer is flagged for verification.)`,
        `Menurut kunci jawaban resmi: ${ANSWER_VALUE} menit. (Catatan: straight-line pertama secara matematis pada 60/11 ≈ 5,45 menit; jawaban resmi ditandai untuk verifikasi.)`,
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
