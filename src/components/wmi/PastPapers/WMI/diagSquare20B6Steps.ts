// diagSquare20B6Steps — SEAMO-20-B-Q6
//
// Square with diagonal d = 12 cm. Find the area.
//
// METHOD (beat by beat):
//   1. The diagonal splits the square into two right-angled isosceles triangles.
//      Each leg of the right triangle = side s.
//      By Pythagoras: s² + s² = d²  →  2s² = 144  →  s² = 72.
//   2. Area of the square = s² = 72 cm².
//   3. Answer = 72 cm² → choice B.
//
// Alternative (formula): Area = d² ÷ 2 = 12² ÷ 2 = 144 ÷ 2 = 72 cm².
//
// Builds a pure storyboard; no framer-motion, no Date, SSR-safe.

import type { Lang } from '../../concepts/explainers/makeTenSteps'

// ---- given -------------------------------------------------------------------
export const DIAGONAL = 12          // cm
export const AREA = DIAGONAL ** 2 / 2  // 72
export const ANSWER_CHOICE = 'B'

export interface DiagSquare20B6Step {
  showHalfLabel: boolean
  showArea: boolean
  math: string | null
  result: boolean
  caption: string
  hold: number   // ms; 0 on the final beat
}

export interface DiagSquare20B6Storyboard {
  answer: number
  answerChoice: string
  steps: DiagSquare20B6Step[]
  finalIndex: number
}

export function buildDiagSquare20B6Steps(lang: Lang): DiagSquare20B6Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: DiagSquare20B6Step[] = [
    // 1 — recall / state the formula
    {
      showHalfLabel: false,
      showArea: false,
      math: `d = ${DIAGONAL} cm  →  Area = d² ÷ 2`,
      result: false,
      hold: 2600,
      caption: t(
        `The diagonal splits the square into two right-angled triangles. Area = diagonal² ÷ 2.`,
        `Diagonal membagi persegi menjadi dua segitiga siku-siku. Luas = diagonal² ÷ 2.`,
      ),
    },
    // 2 — compute d²
    {
      showHalfLabel: true,
      showArea: false,
      math: `${DIAGONAL}² = ${DIAGONAL * DIAGONAL}`,
      result: false,
      hold: 2400,
      caption: t(
        `Square the diagonal: 12² = 144.`,
        `Kuadratkan diagonal: 12² = 144.`,
      ),
    },
    // 3 — divide by 2, land on answer
    {
      showHalfLabel: true,
      showArea: true,
      math: `${DIAGONAL * DIAGONAL} ÷ 2 = ${AREA} cm²`,
      result: true,
      hold: 0,
      caption: t(
        `144 ÷ 2 = 72 cm² → choice ${ANSWER_CHOICE}.`,
        `144 ÷ 2 = 72 cm² → pilihan ${ANSWER_CHOICE}.`,
      ),
    },
  ]

  return { answer: AREA, answerChoice: ANSWER_CHOICE, steps, finalIndex: steps.length - 1 }
}
