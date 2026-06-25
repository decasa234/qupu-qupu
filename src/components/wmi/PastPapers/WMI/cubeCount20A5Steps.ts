// Storyboard for SEAMO-20-A-Q5 — post-answer explainer.
// "How many cubes are there in the model below?"
// The stepped pyramid has 10 cubes: 6 on the bottom, 4 on top.
// Each beat reveals one more layer and shows the running total.

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type LayerPhase = 'intro' | 'bottom' | 'top' | 'total'

export interface CubeCount20A5Step {
  phase: LayerPhase
  /** How many layers are lit (0 = none, 1 = bottom only, 2 = both) */
  layersRevealed: number
  /** Running tally shown below the figure */
  runningTotal: number
  caption: string
  hold: number
  result: boolean
}

export interface CubeCount20A5Storyboard {
  steps: CubeCount20A5Step[]
  finalIndex: number
  answer: number
}

export function buildCubeCount20A5Steps(lang: Lang): CubeCount20A5Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CubeCount20A5Step[] = []

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
    runningTotal: 6,
    hold: 2400,
    result: false,
    caption: t(
      'Bottom layer: 3 wide × 2 deep = 6 cubes.',
      'Lapisan bawah: 3 kolom × 2 baris = 6 kubus.',
    ),
  })

  steps.push({
    phase: 'top',
    layersRevealed: 2,
    runningTotal: 10,
    hold: 2400,
    result: false,
    caption: t(
      'Top layer: 2 wide × 2 deep = 4 cubes. 6 + 4 = 10.',
      'Lapisan atas: 2 kolom × 2 baris = 4 kubus. 6 + 4 = 10.',
    ),
  })

  steps.push({
    phase: 'total',
    layersRevealed: 2,
    runningTotal: 10,
    hold: 0,
    result: true,
    caption: t(
      'Total: 6 + 4 = 10 cubes — answer C.',
      'Total: 6 + 4 = 10 kubus — jawaban C.',
    ),
  })

  return { steps, finalIndex: steps.length - 1, answer: 10 }
}
