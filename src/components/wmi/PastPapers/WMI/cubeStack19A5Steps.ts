// Storyboard for SEAMO-19-A-Q5 — post-answer explainer.
// "How many cubes are there in the figure below?"
// The stepped solid has 12 cubes. We teach layer-by-layer counting:
//   z=0 bottom (8 cubes), z=1 middle (3 cubes), z=2 top (1 cube).
// Each beat reveals one more layer and shows the running total.

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type LayerPhase = 'intro' | 'bottom' | 'middle' | 'top' | 'total'

export interface CubeStackStep {
  phase: LayerPhase
  /** How many layers are lit (0 = none, 1 = bottom only, 2 = bottom+middle, 3 = all) */
  layersRevealed: number
  /** Running tally shown below the figure */
  runningTotal: number
  caption: string
  hold: number
  result: boolean
}

export interface CubeStackStoryboard {
  steps: CubeStackStep[]
  finalIndex: number
  answer: number
}

export function buildCubeStack19A5Steps(lang: Lang): CubeStackStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CubeStackStep[] = []

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
    runningTotal: 8,
    hold: 2400,
    result: false,
    caption: t(
      'Bottom layer: 4 wide × 2 deep = 8 cubes.',
      'Lapisan bawah: 4 kolom × 2 baris = 8 kubus.',
    ),
  })

  steps.push({
    phase: 'middle',
    layersRevealed: 2,
    runningTotal: 11,
    hold: 2400,
    result: false,
    caption: t(
      'Middle layer: 3 cubes on the front-left. 8 + 3 = 11.',
      'Lapisan tengah: 3 kubus di depan-kiri. 8 + 3 = 11.',
    ),
  })

  steps.push({
    phase: 'top',
    layersRevealed: 3,
    runningTotal: 12,
    hold: 2400,
    result: false,
    caption: t(
      'Top layer: 1 cube at the peak. 11 + 1 = 12.',
      'Lapisan atas: 1 kubus di puncak. 11 + 1 = 12.',
    ),
  })

  steps.push({
    phase: 'total',
    layersRevealed: 3,
    runningTotal: 12,
    hold: 0,
    result: true,
    caption: t(
      'Total: 8 + 3 + 1 = 12 cubes — answer A.',
      'Total: 8 + 3 + 1 = 12 kubus — jawaban A.',
    ),
  })

  return { steps, finalIndex: steps.length - 1, answer: 12 }
}
