// Storyboard for HKIMO-18-P1H-Q17 — post-answer explainer.
// "At least how many cube(s) is / are there in the figure below?"
// Minimum answer = 9: ground layer (7 cubes) + stacked left column (2 cubes).

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type CubeMinPhase = 'intro' | 'ground' | 'top' | 'total'

export interface CubeMinHK18P1Q17Step {
  phase: CubeMinPhase
  /** How many z-layers are lit (0=none, 1=ground only, 2=ground+top) */
  layersRevealed: number
  /** Running tally shown below the figure */
  runningTotal: number
  caption: string
  hold: number
  result: boolean
}

export interface CubeMinHK18P1Q17Storyboard {
  steps: CubeMinHK18P1Q17Step[]
  finalIndex: number
  answer: number
}

export function buildCubeMinHK18P1Q17Steps(lang: Lang): CubeMinHK18P1Q17Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CubeMinHK18P1Q17Step[] = []

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
    runningTotal: 7,
    hold: 2400,
    result: false,
    caption: t(
      'Ground floor: L-shaped base = 7 cubes.',
      'Lantai dasar: alas berbentuk L = 7 kubus.',
    ),
  })

  steps.push({
    phase: 'top',
    layersRevealed: 2,
    runningTotal: 9,
    hold: 2400,
    result: false,
    caption: t(
      'Left column rises 2 high: +2 cubes. 7 + 2 = 9.',
      'Kolom kiri setinggi 2: +2 kubus. 7 + 2 = 9.',
    ),
  })

  steps.push({
    phase: 'total',
    layersRevealed: 2,
    runningTotal: 9,
    hold: 0,
    result: true,
    caption: t(
      'Minimum total: 9 cubes.',
      'Total minimum: 9 kubus.',
    ),
  })

  return { steps, finalIndex: steps.length - 1, answer: 9 }
}
