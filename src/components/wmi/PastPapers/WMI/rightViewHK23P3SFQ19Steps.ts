// Storyboard for HKIMO-23-P3SF-Q19 — post-answer explainer.
// "At least how many squares can be seen from the right?" — answer: 7.
//
// Strategy: for each depth-row (y), the right-side view reveals only the tallest
// column at that depth. Highlight each group, count its visible squares, sum to 7.

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type RightViewPhase =
  | 'intro'
  | 'back'
  | 'middle'
  | 'frontleft'
  | 'staircase'
  | 'result'

export interface RightViewHK23P3SFQ19Step {
  phase: RightViewPhase
  /** y-depth groups highlighted (empty = show all dim) */
  highlightY: number[]
  runningTotal: number
  caption: string
  hold: number
  result: boolean
}

export interface RightViewHK23P3SFQ19Storyboard {
  steps: RightViewHK23P3SFQ19Step[]
  finalIndex: number
  answer: number
}

export function buildRightViewHK23P3SFQ19Steps(
  lang: Lang,
): RightViewHK23P3SFQ19Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: RightViewHK23P3SFQ19Step[] = []

  steps.push({
    phase: 'intro',
    highlightY: [],
    runningTotal: 0,
    hold: 2000,
    result: false,
    caption: t(
      'Stand to the right and look left — count the unit squares visible.',
      'Berdiri di kanan dan pandang ke kiri — hitung kotak satuan yang terlihat.',
    ),
  })

  steps.push({
    phase: 'back',
    highlightY: [5],
    runningTotal: 2,
    hold: 2200,
    result: false,
    caption: t(
      'Back group (depth y=5): 2-high stack → 2 visible squares from the right.',
      'Kelompok belakang (kedalaman y=5): tumpukan 2 tinggi → 2 kotak terlihat dari kanan.',
    ),
  })

  steps.push({
    phase: 'middle',
    highlightY: [3],
    runningTotal: 3,
    hold: 2200,
    result: false,
    caption: t(
      'Middle row (depth y=3): height 1 → 1 more square. Running: 2 + 1 = 3.',
      'Baris tengah (kedalaman y=3): tinggi 1 → 1 kotak lagi. Total: 2 + 1 = 3.',
    ),
  })

  steps.push({
    phase: 'frontleft',
    highlightY: [1],
    runningTotal: 4,
    hold: 2200,
    result: false,
    caption: t(
      'Front-left pair (depth y=1): height 1 → 1 more square. Running: 3 + 1 = 4.',
      'Pasangan kiri-depan (kedalaman y=1): tinggi 1 → 1 kotak lagi. Total: 3 + 1 = 4.',
    ),
  })

  steps.push({
    phase: 'staircase',
    highlightY: [0],
    runningTotal: 7,
    hold: 2400,
    result: false,
    caption: t(
      'Front staircase (depth y=0): tallest column is 3 high → 3 more squares. 4 + 3 = 7.',
      'Tangga depan (kedalaman y=0): kolom tertinggi setinggi 3 → 3 kotak lagi. 4 + 3 = 7.',
    ),
  })

  steps.push({
    phase: 'result',
    highlightY: [],
    runningTotal: 7,
    hold: 0,
    result: true,
    caption: t(
      'Minimum visible squares from the right: 2 + 1 + 1 + 3 = 7.',
      'Minimum kotak yang terlihat dari kanan: 2 + 1 + 1 + 3 = 7.',
    ),
  })

  return { steps, finalIndex: steps.length - 1, answer: 7 }
}
