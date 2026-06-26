// Storyboard for SIMOC-19-G3-Q22 — post-answer explainer.
// "Berapa banyak persegi yang terdapat pada gambar di bawah ini?"
// Answer: 27.
//
// Figure: two 3×3 blocks joined at one corner (row 2, col 2).
// Counts by size:
//   1×1 → 17 (every unit cell)
//   2×2 → 8  (4 in top block + 4 in bottom block)
//   3×3 → 2  (one complete block each)
//   Total: 17 + 8 + 2 = 27

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type PhaseSIMOC19G3Q22 = 'intro' | 'size1' | 'size2' | 'size3' | 'total'

export interface StepSIMOC19G3Q22 {
  phase: PhaseSIMOC19G3Q22
  /** Show amber overlay on every 1×1 cell */
  show1x1: boolean
  /** Show green outlines on all 2×2 squares */
  show2x2: boolean
  /** Show blue outlines on both 3×3 squares */
  show3x3: boolean
  /** Count to display in the running counter (size-specific, then total) */
  sizeCount: number
  caption: string
  hold: number
  result: boolean
}

export interface StoryboardSIMOC19G3Q22 {
  steps: StepSIMOC19G3Q22[]
  finalIndex: number
  answer: number
}

export function buildCountSquaresSIMOC19G3Q22Steps(lang: Lang): StoryboardSIMOC19G3Q22 {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps: StepSIMOC19G3Q22[] = []

  // 0 – intro: show bare figure
  steps.push({
    phase: 'intro',
    show1x1: false, show2x2: false, show3x3: false,
    sizeCount: 0, hold: 2000, result: false,
    caption: t(
      'Count squares of ALL sizes — 1×1, 2×2, and 3×3!',
      'Hitung persegi semua ukuran — 1×1, 2×2, dan 3×3!',
    ),
  })

  // 1 – 1×1 squares
  steps.push({
    phase: 'size1',
    show1x1: true, show2x2: false, show3x3: false,
    sizeCount: 17, hold: 2400, result: false,
    caption: t(
      '1×1 squares: every small cell counts — 17 in total.',
      'Persegi 1×1: setiap sel kecil dihitung — total 17.',
    ),
  })

  // 2 – 2×2 squares
  steps.push({
    phase: 'size2',
    show1x1: false, show2x2: true, show3x3: false,
    sizeCount: 8, hold: 2400, result: false,
    caption: t(
      '2×2 squares: 4 in the top block + 4 in the bottom block = 8.',
      'Persegi 2×2: 4 di blok atas + 4 di blok bawah = 8.',
    ),
  })

  // 3 – 3×3 squares
  steps.push({
    phase: 'size3',
    show1x1: false, show2x2: false, show3x3: true,
    sizeCount: 2, hold: 2400, result: false,
    caption: t(
      '3×3 squares: each complete block is one — 2 in total.',
      'Persegi 3×3: setiap blok penuh adalah satu — total 2.',
    ),
  })

  // 4 – final total
  steps.push({
    phase: 'total',
    show1x1: false, show2x2: false, show3x3: false,
    sizeCount: 27, hold: 0, result: true,
    caption: t(
      '17 + 8 + 2 = 27 squares in all!',
      '17 + 8 + 2 = 27 persegi semuanya!',
    ),
  })

  return { steps, finalIndex: steps.length - 1, answer: 27 }
}
