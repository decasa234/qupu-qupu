import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { A_TRIANGLES, I_SQUARES, SHAPE_DIFFERENCE } from './P25G2Q23Illustration'

export type DiffPhase = 'show' | 'countA' | 'countI' | 'subtract' | 'result'

export interface DiffStep {
  phase: DiffPhase
  aRevealed: number
  iRevealed: number
  showCounts: boolean
  caption: string
  hold: number
  result: boolean
}

export interface DiffStoryboard {
  aCount: number
  iCount: number
  difference: number
  answer: string
  steps: DiffStep[]
  finalIndex: number
}

/** Difference 7 is option B in the 5-option list. */
const ANSWER_LETTER = 'B'

export function buildP25G2Q23Steps(lang: Lang): DiffStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: DiffStep[] = [
    {
      phase: 'show',
      aRevealed: 0,
      iRevealed: 0,
      showCounts: false,
      hold: 1700,
      result: false,
      caption: t(
        'Count every shape in each letter, then subtract — count carefully, miss nothing.',
        'Hitung tiap bangun di setiap huruf, lalu kurangkan — hitung teliti, jangan terlewat.',
      ),
    },
    {
      phase: 'countA',
      aRevealed: A_TRIANGLES,
      iRevealed: 0,
      showCounts: true,
      hold: 2300,
      result: false,
      caption: t(
        `Letter A: 1 + 3 + 4 + 4 + 9 + 4 triangles = ${A_TRIANGLES}.`,
        `Huruf A: 1 + 3 + 4 + 4 + 9 + 4 segitiga = ${A_TRIANGLES}.`,
      ),
    },
    {
      phase: 'countI',
      aRevealed: A_TRIANGLES,
      iRevealed: I_SQUARES,
      showCounts: true,
      hold: 2200,
      result: false,
      caption: t(
        `Letter I: 5 (top) + 8 (stem) + 5 (bottom) squares = ${I_SQUARES}.`,
        `Huruf I: 5 (atas) + 8 (badan) + 5 (bawah) persegi = ${I_SQUARES}.`,
      ),
    },
    {
      phase: 'subtract',
      aRevealed: A_TRIANGLES,
      iRevealed: I_SQUARES,
      showCounts: true,
      hold: 2000,
      result: false,
      caption: t(
        `A has more shapes than I: ${A_TRIANGLES} − ${I_SQUARES}.`,
        `A punya lebih banyak bangun daripada I: ${A_TRIANGLES} − ${I_SQUARES}.`,
      ),
    },
    {
      phase: 'result',
      aRevealed: A_TRIANGLES,
      iRevealed: I_SQUARES,
      showCounts: true,
      hold: 0,
      result: true,
      caption: t(
        `${A_TRIANGLES} − ${I_SQUARES} = ${SHAPE_DIFFERENCE} — answer ${ANSWER_LETTER}.`,
        `${A_TRIANGLES} − ${I_SQUARES} = ${SHAPE_DIFFERENCE} — jawaban ${ANSWER_LETTER}.`,
      ),
    },
  ]

  return {
    aCount: A_TRIANGLES,
    iCount: I_SQUARES,
    difference: SHAPE_DIFFERENCE,
    answer: ANSWER_LETTER,
    steps,
    finalIndex: steps.length - 1,
  }
}
