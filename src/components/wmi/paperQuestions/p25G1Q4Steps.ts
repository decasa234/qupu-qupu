import type { Lang } from '../concepts/explainers/makeTenSteps'
import type { CandleH } from './P25G1Q4Illustration'
import { LONG_COUNT, SHORT_COUNT } from './P25G1Q4Illustration'

// Storyboard for WMI-25P1A-Q4 — candle place value.
// Long candle = 10, short candle = 1. 6 long + 4 short = 60 + 4 = 64 => answer D.
// We focus the long candles (tens), then the short candles (ones), then add.

export type Q4Phase = 'show' | 'tens' | 'ones' | 'result'

export interface Q4Step {
  phase: Q4Phase
  /** dim every candle that is not this height. */
  focus: CandleH | null
  /** ring the candles of this height. */
  ring: CandleH | null
  caption: string
  hold: number
  result: boolean
}

export interface Q4Storyboard {
  longCount: number
  shortCount: number
  tens: number
  ones: number
  answer: number
  letter: string
  steps: Q4Step[]
  finalIndex: number
}

export function buildP25G1Q4Steps(lang: Lang): Q4Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const tens = LONG_COUNT * 10 // 60
  const ones = SHORT_COUNT * 1 // 4
  const answer = tens + ones // 64

  const steps: Q4Step[] = [
    {
      phase: 'show',
      focus: null,
      ring: null,
      hold: 1700,
      result: false,
      caption: t(
        'Long candle = 10 years, short candle = 1 year.',
        'Lilin panjang = 10 tahun, lilin pendek = 1 tahun.',
      ),
    },
    {
      phase: 'tens',
      focus: 'long',
      ring: 'long',
      hold: 2100,
      result: false,
      caption: t(
        `${LONG_COUNT} long candles, each 10: ${LONG_COUNT} x 10 = ${tens}.`,
        `${LONG_COUNT} lilin panjang, tiap 10: ${LONG_COUNT} x 10 = ${tens}.`,
      ),
    },
    {
      phase: 'ones',
      focus: 'short',
      ring: 'short',
      hold: 2100,
      result: false,
      caption: t(
        `${SHORT_COUNT} short candles, each 1: ${SHORT_COUNT} x 1 = ${ones}.`,
        `${SHORT_COUNT} lilin pendek, tiap 1: ${SHORT_COUNT} x 1 = ${ones}.`,
      ),
    },
    {
      phase: 'result',
      focus: null,
      ring: null,
      hold: 0,
      result: true,
      caption: t(`${tens} + ${ones} = ${answer} — answer D.`, `${tens} + ${ones} = ${answer} — jawaban D.`),
    },
  ]

  return {
    longCount: LONG_COUNT,
    shortCount: SHORT_COUNT,
    tens,
    ones,
    answer,
    letter: 'D',
    steps,
    finalIndex: steps.length - 1,
  }
}
