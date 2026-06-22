import type { Lang } from '../../concepts/explainers/makeTenSteps'
import type { CandleH } from './Cake6PEIllustration'
import { LARGE_COUNT, SMALL_COUNT } from './Cake6PEIllustration'

// Storyboard for IKMC-23-PE-Q6 — birthday-cake candle place value.
// Large candle = 10 years, small candle = 1 year.
// 7 large + 6 small = 70 + 6 = 76 → answer C.
//
// Beat sequence:
//  0 — introduce the rule (all candles lit, no dim)
//  1 — focus large candles, count tens
//  2 — focus small candles, count ones
//  3 — reveal sum and answer

export type Cake6Phase = 'show' | 'tens' | 'ones' | 'result'

export interface Cake6Step {
  phase: Cake6Phase
  /** Dim candles NOT of this height (null = show all). */
  focus: CandleH | null
  /** Ring candles of this height (null = no ring). */
  ring: CandleH | null
  caption: string
  hold: number
  result: boolean
}

export interface Cake6Storyboard {
  largeCount: number
  smallCount: number
  tens: number
  ones: number
  answer: number
  letter: string
  steps: Cake6Step[]
  finalIndex: number
}

export function buildCake6PESteps(lang: Lang): Cake6Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const tens = LARGE_COUNT * 10 // 70
  const ones = SMALL_COUNT * 1 // 6
  const answer = tens + ones // 76

  const steps: Cake6Step[] = [
    {
      phase: 'show',
      focus: null,
      ring: null,
      hold: 1800,
      result: false,
      caption: t(
        'Large candle = 10 years, small candle = 1 year.',
        'Lilin besar = 10 tahun, lilin kecil = 1 tahun.',
      ),
    },
    {
      phase: 'tens',
      focus: 'large',
      ring: 'large',
      hold: 2200,
      result: false,
      caption: t(
        `${LARGE_COUNT} large candles, each 10 years: ${LARGE_COUNT} × 10 = ${tens}.`,
        `${LARGE_COUNT} lilin besar, tiap 10 tahun: ${LARGE_COUNT} × 10 = ${tens}.`,
      ),
    },
    {
      phase: 'ones',
      focus: 'small',
      ring: 'small',
      hold: 2200,
      result: false,
      caption: t(
        `${SMALL_COUNT} small candles, each 1 year: ${SMALL_COUNT} × 1 = ${ones}.`,
        `${SMALL_COUNT} lilin kecil, tiap 1 tahun: ${SMALL_COUNT} × 1 = ${ones}.`,
      ),
    },
    {
      phase: 'result',
      focus: null,
      ring: null,
      hold: 0,
      result: true,
      caption: t(
        `${tens} + ${ones} = ${answer} years — answer C.`,
        `${tens} + ${ones} = ${answer} tahun — jawaban C.`,
      ),
    },
  ]

  return {
    largeCount: LARGE_COUNT,
    smallCount: SMALL_COUNT,
    tens,
    ones,
    answer,
    letter: 'C',
    steps,
    finalIndex: steps.length - 1,
  }
}
