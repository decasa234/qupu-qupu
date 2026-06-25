// Storyboard for SEAMOX-20-A-Q8 — post-answer explainer.
// "How many cubes are there in the figure below?"
// The staircase solid has 13 cubes. We teach layer-by-layer counting:
//   z=0 bottom (9 cubes), z=1 middle (3 cubes), z=2 top (1 cube).
// Each beat reveals one more layer and shows the running total.

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type LayerPhase = 'intro' | 'bottom' | 'middle' | 'top' | 'total'

export interface StaircubeStep {
  phase: LayerPhase
  /** How many layers are lit (0 = none, 1 = bottom only, 2 = bottom+middle, 3 = all) */
  layersRevealed: number
  /** Running tally shown below the figure */
  runningTotal: number
  caption: string
  hold: number
  result: boolean
}

export interface StaircubeStoryboard {
  steps: StaircubeStep[]
  finalIndex: number
  answer: number
}

export function buildStaircubeX20A8Steps(lang: Lang): StaircubeStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: StaircubeStep[] = []

  steps.push({
    phase: 'intro',
    layersRevealed: 0,
    runningTotal: 0,
    hold: 2000,
    result: false,
    caption: t(
      'Count the cubes layer by layer — from the bottom up.',
      'Hitung kubus lapis per lapis — mulai dari bawah.',
    ),
  })

  steps.push({
    phase: 'bottom',
    layersRevealed: 1,
    runningTotal: 9,
    hold: 2400,
    result: false,
    caption: t(
      'Bottom layer: 3 wide × 3 deep = 9 cubes.',
      'Lapisan bawah: 3 kolom × 3 baris = 9 kubus.',
    ),
  })

  steps.push({
    phase: 'middle',
    layersRevealed: 2,
    runningTotal: 12,
    hold: 2400,
    result: false,
    caption: t(
      'Middle layer: 3 cubes at the front. 9 + 3 = 12.',
      'Lapisan tengah: 3 kubus di depan. 9 + 3 = 12.',
    ),
  })

  steps.push({
    phase: 'top',
    layersRevealed: 3,
    runningTotal: 13,
    hold: 2400,
    result: false,
    caption: t(
      'Top layer: 1 cube at the peak. 12 + 1 = 13.',
      'Lapisan atas: 1 kubus di puncak. 12 + 1 = 13.',
    ),
  })

  steps.push({
    phase: 'total',
    layersRevealed: 3,
    runningTotal: 13,
    hold: 0,
    result: true,
    caption: t(
      'Total: 9 + 3 + 1 = 13 cubes.',
      'Total: 9 + 3 + 1 = 13 kubus.',
    ),
  })

  return { steps, finalIndex: steps.length - 1, answer: 13 }
}
