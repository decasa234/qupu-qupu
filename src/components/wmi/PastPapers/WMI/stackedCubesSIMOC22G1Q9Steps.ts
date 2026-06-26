// Storyboard for SIMOC-22-G1-Q9 — post-answer explainer.
// "How many cubes are stacked in the corner?" — answer: E (24).
//
// Arrangement: 4-wide × 3-deep staircase (y=0→1, y=1→2, y=2→3 high).
//
// Teaching beats:
//   intro      — full staircase dimmed; introduce front-to-back strategy
//   row_front  — front row (y=0) lit in amber: 4 cubes high × 1 = 4
//   row_mid    — middle row (y=1) lit: 4 × 2 = 8 cubes
//   row_back   — back row (y=2) lit: 4 × 3 = 12 cubes
//   answer     — all cubes lit green; 4+8+12 = 24

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type StackedCubesPhase =
  | 'intro'
  | 'row_front'
  | 'row_mid'
  | 'row_back'
  | 'answer'

export interface StackedCubesStep {
  phase: StackedCubesPhase
  caption: string
  count: number | null
  hold: number
  result: boolean
}

export interface StackedCubesStoryboard {
  steps: StackedCubesStep[]
  finalIndex: number
  answer: number
}

export function buildStackedCubesSIMOC22G1Q9Steps(lang: Lang): StackedCubesStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps: StackedCubesStep[] = []

  steps.push({
    phase: 'intro',
    hold: 2200,
    count: null,
    result: false,
    caption: t(
      'Count row by row, from front to back. Hidden cubes are all filled in.',
      'Hitung baris demi baris, dari depan ke belakang. Kubus tersembunyi semuanya terisi.',
    ),
  })

  steps.push({
    phase: 'row_front',
    hold: 2200,
    count: 4,
    result: false,
    caption: t(
      'Front row: 4 columns × 1 high = 4 cubes.',
      'Baris depan: 4 kolom × tinggi 1 = 4 kubus.',
    ),
  })

  steps.push({
    phase: 'row_mid',
    hold: 2200,
    count: 8,
    result: false,
    caption: t(
      'Middle row: 4 columns × 2 high = 8 cubes.',
      'Baris tengah: 4 kolom × tinggi 2 = 8 kubus.',
    ),
  })

  steps.push({
    phase: 'row_back',
    hold: 2200,
    count: 12,
    result: false,
    caption: t(
      'Back row (against wall): 4 columns × 3 high = 12 cubes.',
      'Baris belakang (menempel dinding): 4 kolom × tinggi 3 = 12 kubus.',
    ),
  })

  steps.push({
    phase: 'answer',
    hold: 0,
    count: 24,
    result: true,
    caption: t(
      'Total: 4 + 8 + 12 = 24 cubes.',
      'Total: 4 + 8 + 12 = 24 kubus.',
    ),
  })

  return { steps, finalIndex: steps.length - 1, answer: 24 }
}
