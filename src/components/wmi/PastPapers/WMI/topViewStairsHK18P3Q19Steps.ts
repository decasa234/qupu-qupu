// Storyboard for HKIMO-18-P3H-Q19 — post-answer explainer.
// "At least how many squares can be seen from the top?" → 8.
//
// Key insight: looking straight down, every (x, y) column position shows
// exactly 1 square regardless of the column's height. The 4-step staircase
// has a 4-column × 2-row footprint = 8 occupied positions = 8 squares.
//
// Beats:
//   0. intro     — 3D iso staircase only; cue the student to imagine looking down
//   1. footprint — top-view 4-col×2-row grid appears; height labels per cell
//   2. count     — all 8 cells turn green; count badge shows 8
//   3. result    — green caption confirms the answer

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type TopViewStairsPhase = 'intro' | 'footprint' | 'count' | 'result'

export interface TopViewStairsHK18P3Q19Beat {
  phase: TopViewStairsPhase
  /** Show the top-view 4×2 grid beside the iso figure */
  showGrid: boolean
  /** Highlight all 8 grid cells green */
  highlightAll: boolean
  /** Count badge value (0 = hidden) */
  count: number
  caption: string
  hold: number
  result: boolean
}

export interface TopViewStairsHK18P3Q19Storyboard {
  steps: TopViewStairsHK18P3Q19Beat[]
  finalIndex: number
  answer: number
}

export function buildTopViewStairsHK18P3Q19Steps(
  lang: Lang,
): TopViewStairsHK18P3Q19Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: TopViewStairsHK18P3Q19Beat[] = []

  steps.push({
    phase: 'intro',
    showGrid: false,
    highlightAll: false,
    count: 0,
    hold: 2000,
    result: false,
    caption: t(
      'Observe the 3D staircase. Imagine looking straight down from above.',
      'Amati tangga 3D ini. Bayangkan melihat dari tepat di atas.',
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
      'From the top, tall and short columns alike show as 1 square each.',
      'Dari atas, kolom tinggi maupun pendek masing-masing tampak sebagai 1 persegi.',
    ),
  })

  steps.push({
    phase: 'count',
    showGrid: true,
    highlightAll: true,
    count: 8,
    hold: 2400,
    result: false,
    caption: t(
      '4 columns × 2 rows of cube positions = 8 squares.',
      '4 kolom × 2 baris posisi kubus = 8 persegi.',
    ),
  })

  steps.push({
    phase: 'result',
    showGrid: true,
    highlightAll: true,
    count: 8,
    hold: 0,
    result: true,
    caption: t(
      'At least 8 squares are visible from the top.',
      'Paling sedikit 8 persegi terlihat dari atas.',
    ),
  })

  return { steps, finalIndex: steps.length - 1, answer: 8 }
}
