// Storyboard for TIMO-22-P1H-Q16 — post-answer explainer.
// "Ada berapa kubus dalam gambar 2?" — Answer: 20
//
// Strategy: identify the unit shape (figure 1 = 5 cubes),
// then reveal figure 2 as 4 copies of the unit → 4 × 5 = 20.

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type TIMO22P1Q16Phase = 'intro' | 'unit' | 'copies' | 'total'

export interface TIMO22P1Q16Step {
  phase: TIMO22P1Q16Phase
  /** How many copies of figure 1 are shown in figure 2 (0 = none yet). */
  copiesRevealed: number
  runningTotal: number
  caption: string
  hold: number
  result: boolean
}

export interface TIMO22P1Q16Storyboard {
  steps: TIMO22P1Q16Step[]
  finalIndex: number
  answer: number
}

export function buildIsoCubeStairTIMO22P1Q16Steps(lang: Lang): TIMO22P1Q16Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps: TIMO22P1Q16Step[] = []

  steps.push({
    phase: 'intro',
    copiesRevealed: 0,
    runningTotal: 0,
    hold: 2000,
    result: false,
    caption: t(
      'Figure 1 is the unit shape. Count its cubes first.',
      'Gambar 1 adalah bentuk satuan. Hitung dulu berapa kubus di dalamnya.',
    ),
  })

  steps.push({
    phase: 'unit',
    copiesRevealed: 1,
    runningTotal: 5,
    hold: 2400,
    result: false,
    caption: t(
      'Figure 1 = 5 cubes: 3 along the base row + 2 stacked at the near end.',
      'Gambar 1 = 5 kubus: 3 di barisan bawah + 2 ditumpuk di ujung depan.',
    ),
  })

  steps.push({
    phase: 'copies',
    copiesRevealed: 4,
    runningTotal: 20,
    hold: 2400,
    result: false,
    caption: t(
      'Figure 2 is made from 4 copies of figure 1 side by side: 4 × 5 = 20.',
      'Gambar 2 tersusun dari 4 salinan gambar 1 berjajar: 4 × 5 = 20.',
    ),
  })

  steps.push({
    phase: 'total',
    copiesRevealed: 4,
    runningTotal: 20,
    hold: 0,
    result: true,
    caption: t(
      '4 copies × 5 cubes = 20 cubes in figure 2.',
      '4 salinan × 5 kubus = 20 kubus dalam gambar 2.',
    ),
  })

  return { steps, finalIndex: steps.length - 1, answer: 20 }
}
