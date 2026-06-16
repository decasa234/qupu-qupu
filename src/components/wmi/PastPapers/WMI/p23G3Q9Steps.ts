import type { Lang } from '../../concepts/explainers/makeTenSteps'
import {
  RECT_AREA,
  RECT_H,
  RECT_W,
  SHADED_AREA,
  SQUARE_AREA,
  SQUARE_SIDE,
} from './P23G3Q9Illustration'

export type Q9Phase = 'show' | 'square' | 'rect' | 'subtract' | 'result'

export interface Q9Step {
  phase: Q9Phase
  highlightShaded: boolean
  emphasizeSquare: boolean
  emphasizeRect: boolean
  rectTag?: string
  caption: string
  hold: number
  result: boolean
}

export interface Q9Storyboard {
  squareArea: number
  rectArea: number
  shaded: number
  steps: Q9Step[]
  finalIndex: number
}

export function buildP23G3Q9Steps(lang: Lang): Q9Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q9Step[] = [
    {
      phase: 'show',
      highlightShaded: false,
      emphasizeSquare: false,
      emphasizeRect: false,
      hold: 1700,
      result: false,
      caption: t(
        'Shaded = the whole square minus the rectangle cut out of it.',
        'Diarsir = seluruh persegi dikurangi persegi panjang yang dipotong.',
      ),
    },
    {
      phase: 'square',
      highlightShaded: false,
      emphasizeSquare: true,
      emphasizeRect: false,
      hold: 2000,
      result: false,
      caption: t(
        `Whole square: ${SQUARE_SIDE} × ${SQUARE_SIDE} = ${SQUARE_AREA} m².`,
        `Seluruh persegi: ${SQUARE_SIDE} × ${SQUARE_SIDE} = ${SQUARE_AREA} m².`,
      ),
    },
    {
      phase: 'rect',
      highlightShaded: false,
      emphasizeSquare: false,
      emphasizeRect: true,
      rectTag: `${RECT_AREA} m²`,
      hold: 2000,
      result: false,
      caption: t(
        `Cut-out rectangle: ${RECT_W} × ${RECT_H} = ${RECT_AREA} m².`,
        `Persegi panjang yang dipotong: ${RECT_W} × ${RECT_H} = ${RECT_AREA} m².`,
      ),
    },
    {
      phase: 'subtract',
      highlightShaded: true,
      emphasizeSquare: false,
      emphasizeRect: true,
      rectTag: `${RECT_AREA} m²`,
      hold: 1900,
      result: false,
      caption: t(
        `Take the rectangle out: ${SQUARE_AREA} − ${RECT_AREA}.`,
        `Buang persegi panjangnya: ${SQUARE_AREA} − ${RECT_AREA}.`,
      ),
    },
    {
      phase: 'result',
      highlightShaded: true,
      emphasizeSquare: false,
      emphasizeRect: false,
      hold: 0,
      result: true,
      caption: t(
        `${SQUARE_AREA} − ${RECT_AREA} = ${SHADED_AREA} m² — answer C.`,
        `${SQUARE_AREA} − ${RECT_AREA} = ${SHADED_AREA} m² — jawaban C.`,
      ),
    },
  ]

  return {
    squareArea: SQUARE_AREA,
    rectArea: RECT_AREA,
    shaded: SHADED_AREA,
    steps,
    finalIndex: steps.length - 1,
  }
}
