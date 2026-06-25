import type { Lang } from '../../concepts/explainers/makeTenSteps'

// Quantities bound directly to seed breakdown.quantities (SEAMO-20-A-Q18)
export const HOUND_SPEED = 15    // m/s  (60 ÷ 4)
export const RABBIT_SPEED = 10   // m/s  (20 ÷ 2)
export const GAP = 30            // metres
export const CLOSING_SPEED = HOUND_SPEED - RABBIT_SPEED  // 5 m/s
export const CATCH_TIME = GAP / CLOSING_SPEED             // 6 seconds
export const ANSWER_LABEL = 'D'

export type HoundRabbitPhase = 'start' | 'speeds' | 'closing' | 'time' | 'result'

export interface HoundRabbitStep {
  phase: HoundRabbitPhase
  /** 0 = initial positions, >0 = seconds elapsed to show on diagram */
  elapsed: number
  caption: string
  hold: number
  result: boolean
}

export interface HoundRabbitStoryboard {
  steps: HoundRabbitStep[]
  finalIndex: number
}

/**
 * Beat-by-beat storyboard for SEAMO-20-A-Q18:
 *  1. Show initial positions (hound 30 m behind rabbit).
 *  2. Calculate hound speed: 60 ÷ 4 = 15 m/s.
 *  3. Calculate rabbit speed: 20 ÷ 2 = 10 m/s.
 *  4. Closing speed = 15 − 10 = 5 m/s.
 *  5. Time = 30 ÷ 5 = 6 s — answer D.
 */
export function buildHoundRabbit20A18Steps(lang: Lang): HoundRabbitStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: HoundRabbitStep[] = [
    {
      phase: 'start',
      elapsed: 0,
      hold: 1600,
      result: false,
      caption: t(
        `A hound and a rabbit both run to the right. The rabbit starts ${GAP} m ahead.`,
        `Seekor anjing dan kelinci berlari ke kanan. Kelinci mulai ${GAP} m di depan.`,
      ),
    },
    {
      phase: 'speeds',
      elapsed: 0,
      hold: 2000,
      result: false,
      caption: t(
        `Hound: 60 ÷ 4 = ${HOUND_SPEED} m/s.   Rabbit: 20 ÷ 2 = ${RABBIT_SPEED} m/s.`,
        `Anjing: 60 ÷ 4 = ${HOUND_SPEED} m/detik.   Kelinci: 20 ÷ 2 = ${RABBIT_SPEED} m/detik.`,
      ),
    },
    {
      phase: 'closing',
      elapsed: 0,
      hold: 2000,
      result: false,
      caption: t(
        `Closing speed = ${HOUND_SPEED} − ${RABBIT_SPEED} = ${CLOSING_SPEED} m/s.  The gap shrinks by ${CLOSING_SPEED} m every second.`,
        `Kecepatan mendekat = ${HOUND_SPEED} − ${RABBIT_SPEED} = ${CLOSING_SPEED} m/detik.  Jarak berkurang ${CLOSING_SPEED} m setiap detik.`,
      ),
    },
    {
      phase: 'time',
      elapsed: CATCH_TIME,
      hold: 2200,
      result: false,
      caption: t(
        `Time = ${GAP} ÷ ${CLOSING_SPEED} = ${CATCH_TIME} seconds.  At t = ${CATCH_TIME} s the hound reaches the rabbit.`,
        `Waktu = ${GAP} ÷ ${CLOSING_SPEED} = ${CATCH_TIME} detik.  Pada t = ${CATCH_TIME} detik anjing menyusul kelinci.`,
      ),
    },
    {
      phase: 'result',
      elapsed: CATCH_TIME,
      hold: 0,
      result: true,
      caption: t(
        `Answer ${ANSWER_LABEL} — the hound catches the rabbit in ${CATCH_TIME} seconds. ✓`,
        `Jawaban ${ANSWER_LABEL} — anjing mengejar kelinci dalam ${CATCH_TIME} detik. ✓`,
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
