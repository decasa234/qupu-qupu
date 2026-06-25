// Storyboard for HKIMO-24-P1H-Q16 — post-answer explainer.
// "Figure 1 has 8 cubes (2×2×2). How many cubes in figure 2?"
// Figure 2 is a 4-step staircase: each step 4 wide, heights 1→4.
// Total = 4+8+12+16 = 40 cubes.

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type StairPhase = 'intro' | 'step1' | 'step2' | 'step3' | 'step4' | 'total'

export interface CubeStairsHK24P1Q16Step {
  phase: StairPhase
  /** Number of depth-steps revealed (0=none, 1=front only … 4=all) */
  stepsRevealed: number
  runningTotal: number
  caption: string
  hold: number
  result: boolean
}

export interface CubeStairsHK24P1Q16Storyboard {
  steps: CubeStairsHK24P1Q16Step[]
  finalIndex: number
  answer: number
}

export function buildCubeStairsHK24P1Q16Steps(lang: Lang): CubeStairsHK24P1Q16Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CubeStairsHK24P1Q16Step[] = []

  steps.push({
    phase: 'intro',
    stepsRevealed: 0,
    runningTotal: 0,
    hold: 2000,
    result: false,
    caption: t(
      'Figure 2 is a staircase. Count each step from front to back.',
      'Gambar 2 adalah tangga. Hitung setiap anak tangga dari depan ke belakang.',
    ),
  })

  steps.push({
    phase: 'step1',
    stepsRevealed: 1,
    runningTotal: 4,
    hold: 2200,
    result: false,
    caption: t(
      'Front step (height 1): 4 wide × 1 high = 4 cubes.',
      'Anak tangga depan (tinggi 1): 4 kolom × 1 = 4 kubus.',
    ),
  })

  steps.push({
    phase: 'step2',
    stepsRevealed: 2,
    runningTotal: 12,
    hold: 2200,
    result: false,
    caption: t(
      'Step 2 (height 2): 4 wide × 2 high = 8 cubes. Running: 4 + 8 = 12.',
      'Anak tangga 2 (tinggi 2): 4 × 2 = 8 kubus. Total sementara: 4 + 8 = 12.',
    ),
  })

  steps.push({
    phase: 'step3',
    stepsRevealed: 3,
    runningTotal: 24,
    hold: 2200,
    result: false,
    caption: t(
      'Step 3 (height 3): 4 wide × 3 high = 12 cubes. Running: 12 + 12 = 24.',
      'Anak tangga 3 (tinggi 3): 4 × 3 = 12 kubus. Total sementara: 12 + 12 = 24.',
    ),
  })

  steps.push({
    phase: 'step4',
    stepsRevealed: 4,
    runningTotal: 40,
    hold: 2400,
    result: false,
    caption: t(
      'Back step (height 4): 4 wide × 4 high = 16 cubes. 24 + 16 = 40.',
      'Anak tangga belakang (tinggi 4): 4 × 4 = 16 kubus. 24 + 16 = 40.',
    ),
  })

  steps.push({
    phase: 'total',
    stepsRevealed: 4,
    runningTotal: 40,
    hold: 0,
    result: true,
    caption: t(
      'Total: 4 + 8 + 12 + 16 = 40 cubes.',
      'Total: 4 + 8 + 12 + 16 = 40 kubus.',
    ),
  })

  return { steps, finalIndex: steps.length - 1, answer: 40 }
}
