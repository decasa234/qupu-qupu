// Storyboard for HKIMO-20-P2H-Q17 — post-answer explainer.
// "At least how many squares can be seen if viewing the figure below from the top?" — answer: 13.
//
// Teaching beats:
//   intro    — show 3D figure, explain "look straight down"
//   topview  — show 2D footprint, count 10 × 1×1 squares
//   count2x2 — highlight 3 valid 2×2 squares (A amber, B blue, C green)
//   answer   — total 10 + 3 = 13

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type TopViewCubesPhase = 'intro' | 'topview' | 'count2x2' | 'answer'

export interface TopViewCubesStep {
  phase: TopViewCubesPhase
  caption: string
  hold: number
  result: boolean
}

export interface TopViewCubesStoryboard {
  steps: TopViewCubesStep[]
  finalIndex: number
  answer: number
}

export function buildTopViewCubesHK20P2Q17Steps(lang: Lang): TopViewCubesStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps: TopViewCubesStep[] = []

  steps.push({
    phase: 'intro',
    hold: 2200,
    result: false,
    caption: t(
      'Look straight down at the figure from above — what 2D shape do you see?',
      'Lihat bangun ini dari atas secara tegak lurus — bentuk 2D apa yang terlihat?',
    ),
  })

  steps.push({
    phase: 'topview',
    hold: 2600,
    result: false,
    caption: t(
      'Top view: 10 unit cells → 10 × 1×1 squares.',
      'Tampak atas: 10 sel satuan → 10 × persegi 1×1.',
    ),
  })

  steps.push({
    phase: 'count2x2',
    hold: 2800,
    result: false,
    caption: t(
      'Find all 2×2 squares — 3 fit exactly within the footprint (A, B, C).',
      'Temukan semua persegi 2×2 — tepat 3 muat dalam denah (A, B, C).',
    ),
  })

  steps.push({
    phase: 'answer',
    hold: 0,
    result: true,
    caption: t(
      'Total: 10 (1×1) + 3 (2×2) = 13 squares.',
      'Total: 10 (1×1) + 3 (2×2) = 13 persegi.',
    ),
  })

  return { steps, finalIndex: steps.length - 1, answer: 13 }
}
