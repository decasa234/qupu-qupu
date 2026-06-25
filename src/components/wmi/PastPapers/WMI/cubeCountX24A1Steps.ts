// Storyboard for SEAMOX-24-A-Q1 — post-answer explainer.
// "Count the number of cubes."
// The 3-step staircase (depth 2) has 16 cubes:
//   z=0 base (4×2): 8 cubes
//   z=1 middle row (3×2): 6 cubes
//   z=2 top tip (1×2): 2 cubes
// Each beat reveals the next z-layer and shows the running total.

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type LayerPhase = 'intro' | 'bottom' | 'middle' | 'top' | 'total'

export interface CubeCountX24A1Step {
  phase: LayerPhase
  /** How many z-layers are revealed (0 = none, 1 = z=0, 2 = z=0+1, 3 = all) */
  layersRevealed: number
  /** Running tally shown below the figure */
  runningTotal: number
  caption: string
  hold: number
  result: boolean
}

export interface CubeCountX24A1Storyboard {
  steps: CubeCountX24A1Step[]
  finalIndex: number
  answer: number
}

export function buildCubeCountX24A1Steps(lang: Lang): CubeCountX24A1Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CubeCountX24A1Step[] = []

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
      'Bottom layer (z=0): 4 wide × 2 deep = 8 cubes.',
      'Lapisan bawah: 4 kolom × 2 baris = 8 kubus.',
    ),
  })

  steps.push({
    phase: 'middle',
    layersRevealed: 2,
    runningTotal: 14,
    hold: 2400,
    result: false,
    caption: t(
      'Middle layer (z=1): 3 wide × 2 deep = 6 cubes. 8 + 6 = 14.',
      'Lapisan tengah: 3 kolom × 2 baris = 6 kubus. 8 + 6 = 14.',
    ),
  })

  steps.push({
    phase: 'top',
    layersRevealed: 3,
    runningTotal: 16,
    hold: 2400,
    result: false,
    caption: t(
      'Top layer (z=2): 1 wide × 2 deep = 2 cubes. 14 + 2 = 16.',
      'Lapisan atas: 1 kolom × 2 baris = 2 kubus. 14 + 2 = 16.',
    ),
  })

  steps.push({
    phase: 'total',
    layersRevealed: 3,
    runningTotal: 16,
    hold: 0,
    result: true,
    caption: t(
      'Total: 8 + 6 + 2 = 16 cubes.',
      'Total: 8 + 6 + 2 = 16 kubus.',
    ),
  })

  return { steps, finalIndex: steps.length - 1, answer: 16 }
}
