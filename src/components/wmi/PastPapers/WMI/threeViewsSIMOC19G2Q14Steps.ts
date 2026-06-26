// Storyboard for SIMOC-19-G2-Q14 — post-answer explainer.
// "What is the minimum number of cubes to build the figure shown by three views?" → Answer: D (9)
//
// Teaching beats:
//   intro    — all 9 cubes shown dimmed; introduce the three-view strategy
//   ground   — 7 ground-level cubes (z=0) lit amber; "tampak atas = footprint of 7 cells"
//   tower    — the tall corner column (x=3,y=2: z=0,1,2) lit amber; "+2 extra height"
//   answer   — all 9 cubes lit green; total = 9

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type ThreeViewsPhase = 'intro' | 'ground' | 'tower' | 'answer'

export interface ThreeViewsStep {
  phase: ThreeViewsPhase
  caption: string
  count: number | null
  hold: number
  result: boolean
}

export interface ThreeViewsStoryboard {
  steps: ThreeViewsStep[]
  finalIndex: number
  answer: number
}

export function buildThreeViewsSIMOC19G2Q14Steps(lang: Lang): ThreeViewsStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps: ThreeViewsStep[] = []

  steps.push({
    phase: 'intro',
    hold: 2400,
    count: null,
    result: false,
    caption: t(
      'Three views (front, side, top) each constrain where cubes must go.',
      'Ketiga tampak (depan, samping, atas) masing-masing membatasi posisi kubus.',
    ),
  })

  steps.push({
    phase: 'ground',
    hold: 2400,
    count: 7,
    result: false,
    caption: t(
      'Top view shows 7 cells — place 1 cube in each cell at ground level.',
      'Tampak atas menunjukkan 7 sel — tempatkan 1 kubus di setiap sel pada lantai dasar.',
    ),
  })

  steps.push({
    phase: 'tower',
    hold: 2400,
    count: null,
    result: false,
    caption: t(
      'Front & side views both require this back-right corner to reach height 3. Stack 2 extra cubes.',
      'Tampak depan & samping menunjukkan pojok kanan-belakang harus setinggi 3. Tumpuk 2 kubus tambahan.',
    ),
  })

  steps.push({
    phase: 'answer',
    hold: 0,
    count: 9,
    result: true,
    caption: t(
      'Minimum: 7 (ground) + 2 (tower) = 9 unit cubes.',
      'Minimum: 7 (dasar) + 2 (menara) = 9 kubus satuan.',
    ),
  })

  return { steps, finalIndex: steps.length - 1, answer: 9 }
}
