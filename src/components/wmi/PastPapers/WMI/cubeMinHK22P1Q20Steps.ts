// Storyboard for HKIMO-22-P1H-Q20 — post-answer explainer.
// "At least how many cube(s) is / are there in the figure below?"
// Minimum answer = 10: ground layer (9 cubes) + tower top (1 cube).

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type CubeMinPhase = 'intro' | 'ground' | 'top' | 'total'

export interface CubeMinHK22P1Q20Step {
  phase: CubeMinPhase
  /** How many z-layers are lit (0=none, 1=ground only, 2=ground+top) */
  layersRevealed: number
  /** Running tally shown below the figure */
  runningTotal: number
  caption: string
  hold: number
  result: boolean
}

export interface CubeMinHK22P1Q20Storyboard {
  steps: CubeMinHK22P1Q20Step[]
  finalIndex: number
  answer: number
}

export function buildCubeMinHK22P1Q20Steps(lang: Lang): CubeMinHK22P1Q20Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CubeMinHK22P1Q20Step[] = []

  steps.push({
    phase: 'intro',
    layersRevealed: 0,
    runningTotal: 0,
    hold: 2000,
    result: false,
    caption: t(
      'Count the minimum cubes — layer by layer from the bottom.',
      'Hitung kubus minimum — lapis per lapis dari bawah.',
    ),
  })

  steps.push({
    phase: 'ground',
    layersRevealed: 1,
    runningTotal: 9,
    hold: 2400,
    result: false,
    caption: t(
      'Ground floor: staircase-S base = 9 cubes.',
      'Lantai dasar: alas tangga-S = 9 kubus.',
    ),
  })

  steps.push({
    phase: 'top',
    layersRevealed: 2,
    runningTotal: 10,
    hold: 2400,
    result: false,
    caption: t(
      'Left column rises 2 high: +1 cube. 9 + 1 = 10.',
      'Kolom kiri setinggi 2: +1 kubus. 9 + 1 = 10.',
    ),
  })

  steps.push({
    phase: 'total',
    layersRevealed: 2,
    runningTotal: 10,
    hold: 0,
    result: true,
    caption: t(
      'Minimum total: 10 cubes.',
      'Total minimum: 10 kubus.',
    ),
  })

  return { steps, finalIndex: steps.length - 1, answer: 10 }
}
