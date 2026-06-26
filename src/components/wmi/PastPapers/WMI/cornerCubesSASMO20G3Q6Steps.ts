// Storyboard for SASMO-20-G3-Q6 — post-answer explainer.
// "Berapa banyak kubus semuanya?" — Answer B (30 cubes).
//
// Strategy: count horizontal layers bottom-to-top.
//   z=0  bottom : 4×4 = 16
//   z=1         : 3×3 =  9  → running 25
//   z=2         : 2×2 =  4  → running 29
//   z=3  top    : 1×1 =  1  → running 30 ✓

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type LayerPhase = 'intro' | 'layer1' | 'layer2' | 'layer3' | 'layer4' | 'total'

export interface CornerCubesSASMO20G3Q6Step {
  phase: LayerPhase
  /** How many layers (z-levels) are revealed (0 = none shown, 4 = all). */
  layersRevealed: number
  /** Running cube total shown below the figure. */
  runningTotal: number
  caption: string
  hold: number
  result: boolean
}

export interface CornerCubesSASMO20G3Q6Storyboard {
  steps: CornerCubesSASMO20G3Q6Step[]
  finalIndex: number
  answer: number
}

export function buildCornerCubesSASMO20G3Q6Steps(lang: Lang): CornerCubesSASMO20G3Q6Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CornerCubesSASMO20G3Q6Step[] = []

  steps.push({
    phase: 'intro',
    layersRevealed: 0,
    runningTotal: 0,
    hold: 2000,
    result: false,
    caption: t(
      'Cubes are stacked in a room corner — no gaps behind the visible ones. Count layer by layer from the bottom.',
      'Kubus ditumpuk di sudut ruangan — tidak ada celah di belakangnya. Hitung lapis demi lapis dari bawah.',
    ),
  })

  steps.push({
    phase: 'layer1',
    layersRevealed: 1,
    runningTotal: 16,
    hold: 2400,
    result: false,
    caption: t(
      'Bottom layer: 4 × 4 = 16 cubes (including hidden ones against the walls).',
      'Lapisan bawah: 4 × 4 = 16 kubus (termasuk yang tersembunyi di balik dinding).',
    ),
  })

  steps.push({
    phase: 'layer2',
    layersRevealed: 2,
    runningTotal: 25,
    hold: 2400,
    result: false,
    caption: t(
      '2nd layer: 3 × 3 = 9 cubes. Running total: 16 + 9 = 25.',
      'Lapisan ke-2: 3 × 3 = 9 kubus. Total sementara: 16 + 9 = 25.',
    ),
  })

  steps.push({
    phase: 'layer3',
    layersRevealed: 3,
    runningTotal: 29,
    hold: 2400,
    result: false,
    caption: t(
      '3rd layer: 2 × 2 = 4 cubes. Running total: 25 + 4 = 29.',
      'Lapisan ke-3: 2 × 2 = 4 kubus. Total sementara: 25 + 4 = 29.',
    ),
  })

  steps.push({
    phase: 'layer4',
    layersRevealed: 4,
    runningTotal: 30,
    hold: 2400,
    result: false,
    caption: t(
      'Top layer: 1 cube at the corner. Running total: 29 + 1 = 30.',
      'Lapisan teratas: 1 kubus di sudut. Total sementara: 29 + 1 = 30.',
    ),
  })

  steps.push({
    phase: 'total',
    layersRevealed: 4,
    runningTotal: 30,
    hold: 0,
    result: true,
    caption: t(
      '16 + 9 + 4 + 1 = 30 cubes in total — answer B.',
      '16 + 9 + 4 + 1 = 30 kubus semuanya — jawaban B.',
    ),
  })

  return { steps, finalIndex: steps.length - 1, answer: 30 }
}
