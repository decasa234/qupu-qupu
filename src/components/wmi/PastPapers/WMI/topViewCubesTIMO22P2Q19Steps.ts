// Storyboard for TIMO-22-P2H-Q19 — post-answer explainer.
// "At least how many squares can be seen if viewing the figure from top?" → 9.
//
// Key insight: looking straight down, every (x, y) column position shows
// exactly 1 square regardless of the column's height. The staircase footprint
// is 4 cells (front row) + 3 cells (mid row) + 2 cells (back row) = 9 squares.
//
// Beats:
//   0. intro     — 3D iso staircase only; cue the student to look from above
//   1. footprint — top-view staircase grid appears; height labels per cell
//   2. count     — all 9 cells turn green; count badge shows 9
//   3. result    — green caption confirms the answer

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type TopViewCubesTIMO22Phase = 'intro' | 'footprint' | 'count' | 'result'

export interface TopViewCubesTIMO22P2Q19Beat {
  phase: TopViewCubesTIMO22Phase
  /** Show the top-view staircase grid beside the iso figure */
  showGrid: boolean
  /** Highlight all 9 grid cells green */
  highlightAll: boolean
  /** Count badge value (0 = hidden) */
  count: number
  caption: string
  hold: number
  result: boolean
}

export interface TopViewCubesTIMO22P2Q19Storyboard {
  steps: TopViewCubesTIMO22P2Q19Beat[]
  finalIndex: number
  answer: number
}

export function buildTopViewCubesTIMO22P2Q19Steps(
  lang: Lang,
): TopViewCubesTIMO22P2Q19Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: TopViewCubesTIMO22P2Q19Beat[] = []

  steps.push({
    phase: 'intro',
    showGrid: false,
    highlightAll: false,
    count: 0,
    hold: 2000,
    result: false,
    caption: t(
      'Observe the 3D staircase. Imagine looking straight down from above.',
      'Amati susunan kubus 3D ini. Bayangkan melihat langsung dari atas ke bawah.',
    ),
  })

  steps.push({
    phase: 'footprint',
    showGrid: true,
    highlightAll: false,
    count: 0,
    hold: 2400,
    result: false,
    caption: t(
      'From the top, each column — tall or short — shows as exactly 1 square.',
      'Dari atas, setiap kolom — tinggi maupun pendek — tampak sebagai tepat 1 persegi.',
    ),
  })

  steps.push({
    phase: 'count',
    showGrid: true,
    highlightAll: true,
    count: 9,
    hold: 2400,
    result: false,
    caption: t(
      '4 + 3 + 2 = 9 occupied column positions in the footprint.',
      '4 + 3 + 2 = 9 posisi kolom yang terisi dalam jejak tampak atas.',
    ),
  })

  steps.push({
    phase: 'result',
    showGrid: true,
    highlightAll: true,
    count: 9,
    hold: 0,
    result: true,
    caption: t(
      'At least 9 squares are visible from the top.',
      'Paling sedikit 9 persegi terlihat dari atas.',
    ),
  })

  return { steps, finalIndex: steps.length - 1, answer: 9 }
}
