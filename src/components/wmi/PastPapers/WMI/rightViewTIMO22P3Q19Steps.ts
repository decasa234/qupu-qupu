// Storyboard for TIMO-22-P3H-Q19 — post-answer explainer.
// "At least how many squares can be seen from the right?" — answer: 8.
//
// Strategy: for each depth-row (y), the right-side projection reveals only the
// tallest column at that depth. Highlight each group, count its visible squares,
// accumulate 1 + 2 + 3 + 2 = 8.

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type RightViewTIMO22P3Q19Phase =
  | 'intro'
  | 'front'
  | 'second'
  | 'third'
  | 'back'
  | 'result'

export interface RightViewTIMO22P3Q19Step {
  phase: RightViewTIMO22P3Q19Phase
  /** y-depth values to highlight (empty = show all / result) */
  highlightY: number[]
  runningTotal: number
  caption: string
  hold: number
  result: boolean
}

export interface RightViewTIMO22P3Q19Storyboard {
  steps: RightViewTIMO22P3Q19Step[]
  finalIndex: number
  answer: number
}

export function buildRightViewTIMO22P3Q19Steps(
  lang: Lang,
): RightViewTIMO22P3Q19Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: RightViewTIMO22P3Q19Step[] = []

  steps.push({
    phase: 'intro',
    highlightY: [],
    runningTotal: 0,
    hold: 2000,
    result: false,
    caption: t(
      'Stand to the right and look left — count unit squares visible per depth row.',
      'Berdiri di kanan, pandang ke kiri — hitung kotak satuan terlihat per baris kedalaman.',
    ),
  })

  steps.push({
    phase: 'front',
    highlightY: [0],
    runningTotal: 1,
    hold: 2200,
    result: false,
    caption: t(
      'Front row (depth 1): tallest column is 1 high → 1 visible square.',
      'Baris depan (kedalaman 1): kolom tertinggi setinggi 1 → 1 kotak terlihat.',
    ),
  })

  steps.push({
    phase: 'second',
    highlightY: [1],
    runningTotal: 3,
    hold: 2200,
    result: false,
    caption: t(
      'Second row (depth 2): tallest is 2 high → 2 more squares. Total: 1 + 2 = 3.',
      'Baris kedua (kedalaman 2): tertinggi 2 → 2 kotak lagi. Total: 1 + 2 = 3.',
    ),
  })

  steps.push({
    phase: 'third',
    highlightY: [2],
    runningTotal: 6,
    hold: 2400,
    result: false,
    caption: t(
      'Third row (depth 3): 3-high tower → 3 more squares. Total: 3 + 3 = 6.',
      'Baris ketiga (kedalaman 3): menara 3 tinggi → 3 kotak lagi. Total: 3 + 3 = 6.',
    ),
  })

  steps.push({
    phase: 'back',
    highlightY: [3],
    runningTotal: 8,
    hold: 2400,
    result: false,
    caption: t(
      'Back row (depth 4): tallest is 2 high → 2 more squares. Total: 6 + 2 = 8.',
      'Baris belakang (kedalaman 4): tertinggi 2 → 2 kotak lagi. Total: 6 + 2 = 8.',
    ),
  })

  steps.push({
    phase: 'result',
    highlightY: [],
    runningTotal: 8,
    hold: 0,
    result: true,
    caption: t(
      'Minimum visible squares from the right: 1 + 2 + 3 + 2 = 8.',
      'Minimum kotak terlihat dari kanan: 1 + 2 + 3 + 2 = 8.',
    ),
  })

  return { steps, finalIndex: steps.length - 1, answer: 8 }
}
