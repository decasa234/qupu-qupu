// Storyboard for SIMOC-19-G2-Q4 — post-answer explainer.
// "How many 1×1×1 cubes make up the 3×3×3 figure?" — answer: 27.
//
// Teaching beats:
//   intro        — show full cube, dimmed; introduce layer-by-layer strategy
//   layer_bottom — illuminate bottom layer (z=0): 9 cubes
//   layer_mid    — illuminate middle layer (z=1): 9 cubes
//   layer_top    — illuminate top layer (z=2): 9 cubes
//   answer       — all cubes lit; 9+9+9 = 27

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type CubeCountPhase =
  | 'intro'
  | 'layer_bottom'
  | 'layer_mid'
  | 'layer_top'
  | 'answer'

export interface CubeCountStep {
  phase: CubeCountPhase
  caption: string
  count: number | null
  hold: number
  result: boolean
}

export interface CubeCountStoryboard {
  steps: CubeCountStep[]
  finalIndex: number
  answer: number
}

export function buildCubeCountSIMOC19G2Q4Steps(lang: Lang): CubeCountStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps: CubeCountStep[] = []

  steps.push({
    phase: 'intro',
    hold: 2200,
    count: null,
    result: false,
    caption: t(
      'Count the cubes layer by layer — bottom, middle, then top.',
      'Hitung kubus per lapisan — bawah, tengah, lalu atas.',
    ),
  })

  steps.push({
    phase: 'layer_bottom',
    hold: 2200,
    count: 9,
    result: false,
    caption: t(
      'Bottom layer: a 3×3 grid = 9 cubes.',
      'Lapisan bawah: susunan 3×3 = 9 kubus.',
    ),
  })

  steps.push({
    phase: 'layer_mid',
    hold: 2200,
    count: 9,
    result: false,
    caption: t(
      'Middle layer: another 3×3 grid = 9 cubes.',
      'Lapisan tengah: susunan 3×3 lagi = 9 kubus.',
    ),
  })

  steps.push({
    phase: 'layer_top',
    hold: 2200,
    count: 9,
    result: false,
    caption: t(
      'Top layer: one more 3×3 grid = 9 cubes.',
      'Lapisan atas: satu lagi susunan 3×3 = 9 kubus.',
    ),
  })

  steps.push({
    phase: 'answer',
    hold: 0,
    count: 27,
    result: true,
    caption: t(
      'Total: 9 + 9 + 9 = 27 unit cubes.',
      'Total: 9 + 9 + 9 = 27 kubus satuan.',
    ),
  })

  return { steps, finalIndex: steps.length - 1, answer: 27 }
}
