// WMI-20P2A-Q9 (2020 Grade 2 Semifinal) — storyboard for the "read the clock"
// animation.
//
// The short (hour) hand points to 8; the long (minute) hand points to 4.
//
// THE TRAP: confuse the two hands. The "4" the long hand sits on is also a clock
// number, so it is tempting to read 4 as the hour (4:20 / 4:08). The fix: the
// LONG hand is minutes, the SHORT hand is the hour — sort them by length first.
//
// THE METHOD: short hand at 8 -> hour = 8. Long hand at 4 -> minutes = 4 x 5 = 20.
// So the time is 8:20.
//
// Teaching walk, one idea per beat:
//   1. goal    — what we want: the time.
//   2. trap    — tempting wrong move: read the "4" as the hour (reject).
//   3. hour    — the SHORT hand points to 8 -> the hour is 8.
//   4. ring    — each number is 5 minutes; show the minute ring.
//   5. minute  — the LONG hand points to 4 -> 4 x 5 = 20 minutes.
//   6. result  — 8:20.
//
// Pure builder: (lang) => storyboard. No random, no dates, SSR-safe.

import type { Lang } from '../../concepts/explainers/makeTenSteps'
import {
  HOUR_NUMBER,
  MINUTE_NUMBER,
  MINUTE_VALUE,
  ANSWER_HOUR,
  ANSWER_TIME,
} from './P20G2Q9Illustration'

export type ClockPhase = 'goal' | 'trap' | 'hour' | 'ring' | 'minute' | 'result'

export interface ClockStep {
  phase: ClockPhase
  /** Which hand(s) to highlight on the clock. */
  emphasize: 'hour' | 'minute' | 'both' | 'none'
  /** Show the 0/5/10/... minute ring outside the dial. */
  showMinuteRing: boolean
  /** Arithmetic line to show under the figure, e.g. "4 × 5 = 20"; '' to hide. */
  sum: string
  caption: string
  hold: number
  result: boolean
}

export interface ClockStoryboard {
  hourNumber: number
  minuteNumber: number
  minuteValue: number
  answerTime: string
  steps: ClockStep[]
  finalIndex: number
}

export function buildP20G2Q9Steps(lang: Lang): ClockStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: ClockStep[] = [
    {
      phase: 'goal',
      emphasize: 'none',
      showMinuteRing: false,
      sum: '',
      hold: 1900,
      result: false,
      caption: t('What time is it? Two hands — sort them by length first.', 'Pukul berapa? Dua jarum — bedakan dulu dari panjangnya.'),
    },
    {
      phase: 'trap',
      emphasize: 'minute',
      showMinuteRing: false,
      sum: '',
      hold: 2100,
      result: false,
      caption: t(
        'Tempting: the long hand is on 4, so 4 o’clock? No — the LONG hand is minutes.',
        'Menggoda: jarum panjang di 4, jadi pukul 4? Bukan — jarum PANJANG itu menit.',
      ),
    },
    {
      phase: 'hour',
      emphasize: 'hour',
      showMinuteRing: false,
      sum: '',
      hold: 1900,
      result: false,
      caption: t(
        `The SHORT hand points to ${HOUR_NUMBER} → the hour is ${HOUR_NUMBER}.`,
        `Jarum PENDEK menunjuk ${HOUR_NUMBER} → jamnya ${HOUR_NUMBER}.`,
      ),
    },
    {
      phase: 'ring',
      emphasize: 'none',
      showMinuteRing: true,
      sum: '',
      hold: 1900,
      result: false,
      caption: t('Each number is 5 minutes: 1→5, 2→10, 3→15, 4→20 …', 'Tiap angka bernilai 5 menit: 1→5, 2→10, 3→15, 4→20 …'),
    },
    {
      phase: 'minute',
      emphasize: 'minute',
      showMinuteRing: true,
      sum: `${MINUTE_NUMBER} × 5 = ${MINUTE_VALUE}`,
      hold: 2000,
      result: false,
      caption: t(
        `The LONG hand points to ${MINUTE_NUMBER} → ${MINUTE_NUMBER} × 5 = ${MINUTE_VALUE} minutes.`,
        `Jarum PANJANG menunjuk ${MINUTE_NUMBER} → ${MINUTE_NUMBER} × 5 = ${MINUTE_VALUE} menit.`,
      ),
    },
    {
      phase: 'result',
      emphasize: 'both',
      showMinuteRing: true,
      sum: ANSWER_TIME,
      hold: 0,
      result: true,
      caption: t(
        `Hour ${ANSWER_HOUR}, ${MINUTE_VALUE} minutes → ${ANSWER_TIME} — answer C.`,
        `Jam ${ANSWER_HOUR}, ${MINUTE_VALUE} menit → ${ANSWER_TIME} — jawaban C.`,
      ),
    },
  ]

  return {
    hourNumber: HOUR_NUMBER,
    minuteNumber: MINUTE_NUMBER,
    minuteValue: MINUTE_VALUE,
    answerTime: ANSWER_TIME,
    steps,
    finalIndex: steps.length - 1,
  }
}
