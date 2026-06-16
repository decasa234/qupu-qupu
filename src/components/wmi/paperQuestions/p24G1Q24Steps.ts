// Storyboard for WMI-24P1A-Q24 (2024 Semifinal Grade 1 Paper A).
//
// Question: a 3×3 grid of ★ △ ○ with row sums (17, 18, 19) and column sums
// (16, 24, 14). Find the value of the star.
//
// Method taught (chain from the easiest single-shape line):
//   1) The middle row is three circles summing to 18 → ○ = 18 / 3 = 6.
//   2) The middle column is △ ○ △ summing to 24 → 2△ + 6 = 24 → △ = 9.
//   3) The top row is ★ △ ★ summing to 17 → 2★ + 9 = 17 → ★ = 4.
// Lands on ★ = 4, choice C.
//
// Pure (lang) => storyboard. Deterministic: all numbers derive from the
// illustration constants, no Math.random / Date. SSR-safe.

import type { Lang } from '../concepts/explainers/makeTenSteps'
import {
  CIRCLE_VALUE,
  TRIANGLE_VALUE,
  STAR_VALUE,
  Q24_ANSWER_LETTER,
  type Q24ShapeKind,
} from './P24G1Q24Illustration'

export type Q24Phase = 'show' | 'circle' | 'triangle' | 'star' | 'result'

export interface Q24Step {
  phase: Q24Phase
  highlightRows: number[]
  highlightCol: number | null
  solved: Partial<Record<Q24ShapeKind, number>>
  showAnswer: boolean
  caption: string
  hold: number
  result: boolean
}

export interface Q24Storyboard {
  circle: number
  triangle: number
  star: number
  answerLetter: string
  steps: Q24Step[]
  finalIndex: number
}

export function buildP24G1Q24Steps(lang: Lang): Q24Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q24Step[] = [
    {
      phase: 'show',
      highlightRows: [],
      highlightCol: null,
      solved: {},
      showAnswer: false,
      hold: 1900,
      result: false,
      caption: t(
        'Start with the easiest line — one shape repeated.',
        'Mulai dari baris termudah — satu bentuk yang berulang.',
      ),
    },
    {
      phase: 'circle',
      highlightRows: [1],
      highlightCol: null,
      solved: { circle: CIRCLE_VALUE },
      showAnswer: false,
      hold: 2100,
      result: false,
      caption: t(
        `Middle row is 3 circles = 18, so ○ = 18 ÷ 3 = ${CIRCLE_VALUE}.`,
        `Baris tengah 3 lingkaran = 18, jadi ○ = 18 ÷ 3 = ${CIRCLE_VALUE}.`,
      ),
    },
    {
      phase: 'triangle',
      highlightRows: [],
      highlightCol: 1,
      solved: { circle: CIRCLE_VALUE, triangle: TRIANGLE_VALUE },
      showAnswer: false,
      hold: 2200,
      result: false,
      caption: t(
        `Middle column is △ ○ △ = 24. Take out ○: 24 − ${CIRCLE_VALUE} = 18, so 2△ = 18, △ = ${TRIANGLE_VALUE}.`,
        `Kolom tengah △ ○ △ = 24. Keluarkan ○: 24 − ${CIRCLE_VALUE} = 18, jadi 2△ = 18, △ = ${TRIANGLE_VALUE}.`,
      ),
    },
    {
      phase: 'star',
      highlightRows: [0],
      highlightCol: null,
      solved: { circle: CIRCLE_VALUE, triangle: TRIANGLE_VALUE, star: STAR_VALUE },
      showAnswer: false,
      hold: 2200,
      result: false,
      caption: t(
        `Top row is ★ △ ★ = 17. Take out △: 17 − ${TRIANGLE_VALUE} = 8, so 2★ = 8, ★ = ${STAR_VALUE}.`,
        `Baris atas ★ △ ★ = 17. Keluarkan △: 17 − ${TRIANGLE_VALUE} = 8, jadi 2★ = 8, ★ = ${STAR_VALUE}.`,
      ),
    },
    {
      phase: 'result',
      highlightRows: [],
      highlightCol: null,
      solved: { circle: CIRCLE_VALUE, triangle: TRIANGLE_VALUE, star: STAR_VALUE },
      showAnswer: true,
      hold: 0,
      result: true,
      caption: t(
        `The star is ${STAR_VALUE} — answer ${Q24_ANSWER_LETTER}.`,
        `Bintang bernilai ${STAR_VALUE} — jawaban ${Q24_ANSWER_LETTER}.`,
      ),
    },
  ]

  return {
    circle: CIRCLE_VALUE,
    triangle: TRIANGLE_VALUE,
    star: STAR_VALUE,
    answerLetter: Q24_ANSWER_LETTER,
    steps,
    finalIndex: steps.length - 1,
  }
}
