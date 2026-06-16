import type { Lang } from '../../concepts/explainers/makeTenSteps'
import type { GridShapeKind } from './SumGrid20Illustration'
import { ANSWER, CIRCLE_VALUE, PENTAGON_VALUE, SQUARE_VALUE } from './SumGrid20Illustration'

export type SumGridPhase = 'show' | 'compare' | 'square' | 'pentagon' | 'circle' | 'result'

export interface SumGridStep {
  phase: SumGridPhase
  /** Which grid rows (0..2, top first) to tint; empty = none. */
  highlightRows: number[]
  /** Which grid column (0..2, left first) to tint, or null. */
  highlightCol: number | null
  /** Show the deduced relation badge "⬠ = ◻ + 4" under the grid. */
  showRelation: boolean
  /** Solved shape values shown as badges on the shapes. */
  solved: Partial<Record<GridShapeKind, number>>
  /** Reveal □○ = 16 under the grid. */
  showAnswer: boolean
  caption: string
  hold: number
  result: boolean
}

export interface SumGridStoryboard {
  squareValue: number
  pentagonValue: number
  circleValue: number
  answer: string
  steps: SumGridStep[]
  finalIndex: number
}

export function buildSumGrid20Steps(lang: Lang): SumGridStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: SumGridStep[] = [
    {
      phase: 'show',
      highlightRows: [],
      highlightCol: null,
      showRelation: false,
      solved: {},
      showAnswer: false,
      hold: 1800,
      result: false,
      caption: t(
        'Every number on the side is the total of its whole row or column.',
        'Setiap angka di pinggir adalah jumlah seluruh baris atau kolomnya.',
      ),
    },
    {
      phase: 'compare',
      highlightRows: [1, 2],
      highlightCol: null,
      showRelation: true,
      solved: {},
      showAnswer: false,
      hold: 2400,
      result: false,
      caption: t(
        'Compare row 2 (⬠ ⬠ ◻ = 11) with row 3 (◻ ⬠ ◻ = 7): only one pentagon became a square, and the total dropped by 4 — so a pentagon is exactly 4 more than a square!',
        'Bandingkan baris 2 (⬠ ⬠ ◻ = 11) dengan baris 3 (◻ ⬠ ◻ = 7): hanya satu segilima berubah jadi persegi, dan jumlahnya turun 4 — jadi segilima tepat 4 lebih besar dari persegi!',
      ),
    },
    {
      phase: 'square',
      highlightRows: [2],
      highlightCol: null,
      showRelation: true,
      solved: { square: SQUARE_VALUE },
      showAnswer: false,
      hold: 2400,
      result: false,
      caption: t(
        `Row 3: ◻ + ⬠ + ◻ = 7. Swap the pentagon for "square + 4": three squares + 4 = 7, so three squares = 3 → ◻ = ${SQUARE_VALUE}.`,
        `Baris 3: ◻ + ⬠ + ◻ = 7. Ganti segilima dengan "persegi + 4": tiga persegi + 4 = 7, jadi tiga persegi = 3 → ◻ = ${SQUARE_VALUE}.`,
      ),
    },
    {
      phase: 'pentagon',
      highlightRows: [1],
      highlightCol: null,
      showRelation: true,
      solved: { square: SQUARE_VALUE, pentagon: PENTAGON_VALUE },
      showAnswer: false,
      hold: 2100,
      result: false,
      caption: t(
        `Then ⬠ = ${SQUARE_VALUE} + 4 = ${PENTAGON_VALUE}. Check row 2: 5 + 5 + 1 = 11 — it matches!`,
        `Maka ⬠ = ${SQUARE_VALUE} + 4 = ${PENTAGON_VALUE}. Periksa baris 2: 5 + 5 + 1 = 11 — cocok!`,
      ),
    },
    {
      phase: 'circle',
      highlightRows: [0],
      highlightCol: 0,
      showRelation: false,
      solved: { square: SQUARE_VALUE, pentagon: PENTAGON_VALUE, circle: CIRCLE_VALUE },
      showAnswer: false,
      hold: 2400,
      result: false,
      caption: t(
        `Top row: ○ + ○ + 5 = 17, so ○ + ○ = 12 → ○ = ${CIRCLE_VALUE}. Check column 1: 6 + 5 + 1 = 12 — it matches!`,
        `Baris atas: ○ + ○ + 5 = 17, jadi ○ + ○ = 12 → ○ = ${CIRCLE_VALUE}. Periksa kolom 1: 6 + 5 + 1 = 12 — cocok!`,
      ),
    },
    {
      phase: 'result',
      highlightRows: [],
      highlightCol: null,
      showRelation: false,
      solved: { square: SQUARE_VALUE, pentagon: PENTAGON_VALUE, circle: CIRCLE_VALUE },
      showAnswer: true,
      hold: 0,
      result: true,
      caption: t(
        `◻ = ${SQUARE_VALUE} then ○ = ${CIRCLE_VALUE} — the number ◻○ is ${ANSWER}, not 61. Square first!`,
        `◻ = ${SQUARE_VALUE} lalu ○ = ${CIRCLE_VALUE} — bilangan ◻○ adalah ${ANSWER}, bukan 61. Persegi dulu!`,
      ),
    },
  ]

  return {
    squareValue: SQUARE_VALUE,
    pentagonValue: PENTAGON_VALUE,
    circleValue: CIRCLE_VALUE,
    answer: ANSWER,
    steps,
    finalIndex: steps.length - 1,
  }
}
