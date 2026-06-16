import type { Lang } from '../concepts/explainers/makeTenSteps'
import { BIG_SIDE, HOLE_SIDE, RECT_LONG, RECT_WIDE } from './P21G3Q20Illustration'

export type PinPhase = 'show' | 'hole' | 'sum' | 'diff' | 'solve' | 'result'

export interface PinStep {
  phase: PinPhase
  markHole: boolean
  showWidth: boolean
  showLength: boolean
  showAnswer: boolean
  caption: string
  hold: number
  result: boolean
}

export interface PinStoryboard {
  answer: number
  steps: PinStep[]
  finalIndex: number
}

export function buildP21G3Q20Steps(lang: Lang): PinStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: PinStep[] = [
    {
      phase: 'show',
      markHole: false,
      showWidth: false,
      showLength: false,
      showAnswer: false,
      hold: 1700,
      result: false,
      caption: t(
        'Four equal rectangles spin around a square hole. Call each one L long and w wide.',
        'Empat persegi panjang sama mengelilingi sebuah lubang persegi. Sebut panjangnya L dan lebarnya w.',
      ),
    },
    {
      phase: 'sum',
      markHole: false,
      showWidth: true,
      showLength: true,
      showAnswer: false,
      hold: 2100,
      result: false,
      caption: t(
        `Along one big side, a long edge meets the next short edge: L + w = ${BIG_SIDE}.`,
        `Sepanjang satu sisi besar, sisi panjang bertemu sisi pendek berikutnya: L + w = ${BIG_SIDE}.`,
      ),
    },
    {
      phase: 'diff',
      markHole: true,
      showWidth: false,
      showLength: false,
      showAnswer: false,
      hold: 2100,
      result: false,
      caption: t(
        `The long edge sticks out past the short one by the hole: L − w = ${HOLE_SIDE}.`,
        `Sisi panjang menonjol melewati sisi pendek sebesar lubang: L − w = ${HOLE_SIDE}.`,
      ),
    },
    {
      phase: 'solve',
      markHole: true,
      showWidth: false,
      showLength: false,
      showAnswer: false,
      hold: 2100,
      result: false,
      caption: t(
        `Subtract: (L + w) − (L − w) = 2w, so ${BIG_SIDE} − ${HOLE_SIDE} = ${BIG_SIDE - HOLE_SIDE} = 2w.`,
        `Kurangkan: (L + w) − (L − w) = 2w, jadi ${BIG_SIDE} − ${HOLE_SIDE} = ${BIG_SIDE - HOLE_SIDE} = 2w.`,
      ),
    },
    {
      phase: 'result',
      markHole: true,
      showWidth: true,
      showLength: false,
      showAnswer: true,
      hold: 0,
      result: true,
      caption: t(
        `w = ${BIG_SIDE - HOLE_SIDE} ÷ 2 = ${RECT_WIDE} cm. Width = ${RECT_WIDE} — answer A. (And L = ${RECT_LONG}.)`,
        `w = ${BIG_SIDE - HOLE_SIDE} ÷ 2 = ${RECT_WIDE} cm. Lebar = ${RECT_WIDE} — jawaban A. (Dan L = ${RECT_LONG}.)`,
      ),
    },
  ]

  return { answer: RECT_WIDE, steps, finalIndex: steps.length - 1 }
}
