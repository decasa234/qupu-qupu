// Storyboard for HKIMO-19-P1H-Q17 — post-answer explainer.
// "At least how many cubes is/are there in the figure below?" — answer: 9 (minimum).
//
// Teaching beats:
//   intro    — explain what "at least / minimum" means for hidden cubes
//   ground   — highlight 7 ground-level cubes (z=0)
//   elevated — highlight 2 elevated cubes (z=1), running total = 9
//   verify   — confirm no hidden support cubes are needed
//   answer   — final result 7 + 2 = 9

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type CubeMinPhase = 'intro' | 'ground' | 'elevated' | 'verify' | 'answer'

export interface CubeMinStep {
  phase: CubeMinPhase
  caption: string
  hold: number
  result: boolean
}

export interface CubeMinStoryboard {
  steps: CubeMinStep[]
  finalIndex: number
  answer: number
}

export function buildIsoCubeMinHK19P1Q17Steps(lang: Lang): CubeMinStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps: CubeMinStep[] = []

  steps.push({
    phase: 'intro',
    hold: 2200,
    result: false,
    caption: t(
      '"At least" = minimum. Assume hidden spots are EMPTY unless a cube above forces support.',
      '"Paling sedikit" = minimum. Anggap ruang tersembunyi KOSONG kecuali ada kubus di atasnya.',
    ),
  })

  steps.push({
    phase: 'ground',
    hold: 2400,
    result: false,
    caption: t(
      'Ground layer (z = 0): count all base cubes visible at the bottom — 7 cubes.',
      'Lapisan dasar (z = 0): hitung semua kubus dasar yang terlihat di bawah — 7 kubus.',
    ),
  })

  steps.push({
    phase: 'elevated',
    hold: 2400,
    result: false,
    caption: t(
      'Elevated layer (z = 1): 2 cubes sit on top. 7 + 2 = 9.',
      'Lapisan atas (z = 1): 2 kubus di atasnya. 7 + 2 = 9.',
    ),
  })

  steps.push({
    phase: 'verify',
    hold: 2400,
    result: false,
    caption: t(
      'Check: each elevated cube sits directly on a ground cube — no hidden support needed.',
      'Periksa: setiap kubus atas langsung ditopang kubus dasar — tidak ada kubus tersembunyi yang dipaksa ada.',
    ),
  })

  steps.push({
    phase: 'answer',
    hold: 0,
    result: true,
    caption: t(
      'Minimum total = 7 + 2 = 9 cubes.',
      'Total minimum = 7 + 2 = 9 kubus.',
    ),
  })

  return { steps, finalIndex: steps.length - 1, answer: 9 }
}
