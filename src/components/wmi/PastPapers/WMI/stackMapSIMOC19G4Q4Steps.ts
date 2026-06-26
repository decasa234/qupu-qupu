// Storyboard for SIMOC-19-G4-Q4 — stack map front view.
//
// Stack map Figure 4:
//   Back row  (row 0): col1=2, col2=2, col3=4
//   Front row (row 1): col1=1, col2=3, col3=1
//
// Strategy: front view = column-wise max height.
//   col1 = max(2,1) = 2
//   col2 = max(2,3) = 3
//   col3 = max(4,1) = 4
// Answer: B — heights [2, 3, 4] left to right.

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type StackMapPhase = 'intro' | 'col1' | 'col2' | 'col3' | 'answer'

export interface StackMapStep {
  phase: StackMapPhase
  caption: string
  hold: number
  result: boolean
}

export interface StackMapStoryboard {
  steps: StackMapStep[]
  finalIndex: number
}

export function buildStackMapSIMOC19G4Q4Steps(lang: Lang): StackMapStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps: StackMapStep[] = []

  steps.push({
    phase: 'intro',
    hold: 2200,
    result: false,
    caption: t(
      'The front view shows the tallest stack in each column (left to right).',
      'Tampak depan menunjukkan tumpukan tertinggi di setiap kolom (kiri ke kanan).',
    ),
  })

  steps.push({
    phase: 'col1',
    hold: 2200,
    result: false,
    caption: t(
      'Column 1: back row = 2, front row = 1 → max(2, 1) = 2.',
      'Kolom 1: baris belakang = 2, baris depan = 1 → max(2, 1) = 2.',
    ),
  })

  steps.push({
    phase: 'col2',
    hold: 2200,
    result: false,
    caption: t(
      'Column 2: back row = 2, front row = 3 → max(2, 3) = 3.',
      'Kolom 2: baris belakang = 2, baris depan = 3 → max(2, 3) = 3.',
    ),
  })

  steps.push({
    phase: 'col3',
    hold: 2200,
    result: false,
    caption: t(
      'Column 3: back row = 4, front row = 1 → max(4, 1) = 4.',
      'Kolom 3: baris belakang = 4, baris depan = 1 → max(4, 1) = 4.',
    ),
  })

  steps.push({
    phase: 'answer',
    hold: 0,
    result: true,
    caption: t(
      'Front view heights: 2, 3, 4 — matches choice B.',
      'Tinggi tampak depan: 2, 3, 4 — sesuai pilihan B.',
    ),
  })

  return { steps, finalIndex: steps.length - 1 }
}
