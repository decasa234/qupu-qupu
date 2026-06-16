import type { Lang } from '../concepts/explainers/makeTenSteps'
import { A_VALUE_Q25, AB_SUM_Q25, B_VALUE_Q25 } from './P21G2Q25Illustration'

export type TilingPhase = 'intro' | 'findA' | 'findB' | 'result'

export interface TilingStep {
  phase: TilingPhase
  /** Glow the cell A lands on. */
  glowA: boolean
  /** Glow the cell B lands on. */
  glowB: boolean
  caption: string
  hold: number
  result: boolean
}

export interface TilingStoryboard {
  aValue: number
  bValue: number
  answer: number
  steps: TilingStep[]
  finalIndex: number
}

export function buildP21G2Q25Steps(lang: Lang): TilingStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: TilingStep[] = [
    {
      phase: 'intro',
      glowA: false,
      glowB: false,
      hold: 1900,
      result: false,
      caption: t(
        'The 5 pieces rotate (no flipping) to fill the 4×4 square. The finished grid is already given.',
        '5 keping diputar (tanpa dibalik) untuk mengisi persegi 4×4. Susunan jadinya sudah diberikan.',
      ),
    },
    {
      phase: 'findA',
      glowA: true,
      glowB: false,
      hold: 2100,
      result: false,
      caption: t(
        `Fit the piece carrying A into the grid. The A cell lands on a square holding ${A_VALUE_Q25}, so A = ${A_VALUE_Q25}.`,
        `Pasang keping yang memuat A ke dalam grid. Kotak A jatuh pada kotak berisi ${A_VALUE_Q25}, jadi A = ${A_VALUE_Q25}.`,
      ),
    },
    {
      phase: 'findB',
      glowA: true,
      glowB: true,
      hold: 2100,
      result: false,
      caption: t(
        `Fit the piece carrying B too. The B cell lands on a square holding ${B_VALUE_Q25}, so B = ${B_VALUE_Q25}.`,
        `Pasang juga keping yang memuat B. Kotak B jatuh pada kotak berisi ${B_VALUE_Q25}, jadi B = ${B_VALUE_Q25}.`,
      ),
    },
    {
      phase: 'result',
      glowA: true,
      glowB: true,
      hold: 0,
      result: true,
      caption: t(
        `A + B = ${A_VALUE_Q25} + ${B_VALUE_Q25} = ${AB_SUM_Q25} — answer A.`,
        `A + B = ${A_VALUE_Q25} + ${B_VALUE_Q25} = ${AB_SUM_Q25} — jawaban A.`,
      ),
    },
  ]

  return {
    aValue: A_VALUE_Q25,
    bValue: B_VALUE_Q25,
    answer: AB_SUM_Q25,
    steps,
    finalIndex: steps.length - 1,
  }
}
