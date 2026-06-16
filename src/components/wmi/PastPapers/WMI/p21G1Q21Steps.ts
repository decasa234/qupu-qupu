// Storyboard for the WMI-21P1A-Q21 explainer (number-square puzzle).
//
// The grid gives four equations:
//   row 1:  A − 6  = 13   →  A = 19
//   col 1:  A − B  = 11   →  19 − B = 11  →  B = 8
//   col 3:  6 − C  = 1    →  6 − C = 1    →  C = 5
//   row 3:  B + C  = ?    →  8 + 5        =  13   (answer C)
//
// One idea per beat; the static grid never shows A, B, C or the answer.

import type { Lang } from '../concepts/explainers/makeTenSteps'
import { P21G1Q21_ANSWER } from './P21G1Q21Illustration'

export type Q21Phase = 'show' | 'solveA' | 'solveB' | 'solveC' | 'sum' | 'result'

export interface Q21Step {
  phase: Q21Phase
  showA: boolean
  showB: boolean
  showC: boolean
  revealAnswer: boolean
  highlight: 'rowA' | 'colA' | 'colC' | 'rowQ' | null
  caption: string
  hold: number
  result: boolean
}

export interface Q21Storyboard {
  answer: number
  steps: Q21Step[]
  finalIndex: number
}

export function buildP21G1Q21Steps(lang: Lang): Q21Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q21Step[] = [
    {
      phase: 'show',
      showA: false,
      showB: false,
      showC: false,
      revealAnswer: false,
      highlight: null,
      hold: 1700,
      result: false,
      caption: t(
        'Each row and each column is one little equation. Solve the boxes one at a time.',
        'Tiap baris dan tiap kolom adalah satu persamaan kecil. Selesaikan kotaknya satu per satu.',
      ),
    },
    {
      phase: 'solveA',
      showA: true,
      showB: false,
      showC: false,
      revealAnswer: false,
      highlight: 'rowA',
      hold: 2100,
      result: false,
      caption: t('Top row: □ − 6 = 13, so the box is 13 + 6 = 19.', 'Baris atas: □ − 6 = 13, jadi kotaknya 13 + 6 = 19.'),
    },
    {
      phase: 'solveB',
      showA: true,
      showB: true,
      showC: false,
      revealAnswer: false,
      highlight: 'colA',
      hold: 2100,
      result: false,
      caption: t(
        'Left column: 19 − □ = 11, so the bottom box is 19 − 11 = 8.',
        'Kolom kiri: 19 − □ = 11, jadi kotak bawah 19 − 11 = 8.',
      ),
    },
    {
      phase: 'solveC',
      showA: true,
      showB: true,
      showC: true,
      revealAnswer: false,
      highlight: 'colC',
      hold: 2100,
      result: false,
      caption: t(
        'Right column: 6 − □ = 1, so the bottom box is 6 − 1 = 5.',
        'Kolom kanan: 6 − □ = 1, jadi kotak bawah 6 − 1 = 5.',
      ),
    },
    {
      phase: 'sum',
      showA: true,
      showB: true,
      showC: true,
      revealAnswer: false,
      highlight: 'rowQ',
      hold: 2000,
      result: false,
      caption: t('Bottom row is 8 + 5, and that equals "?".', 'Baris bawah adalah 8 + 5, dan itu sama dengan "?".'),
    },
    {
      phase: 'result',
      showA: true,
      showB: true,
      showC: true,
      revealAnswer: true,
      highlight: 'rowQ',
      hold: 0,
      result: true,
      caption: t(`8 + 5 = ${P21G1Q21_ANSWER} — answer C.`, `8 + 5 = ${P21G1Q21_ANSWER} — jawaban C.`),
    },
  ]

  return { answer: P21G1Q21_ANSWER, steps, finalIndex: steps.length - 1 }
}
