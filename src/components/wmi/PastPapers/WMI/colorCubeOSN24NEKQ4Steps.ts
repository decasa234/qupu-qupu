// Storyboard for OSN-24-SD-NAS-EKSPERIMEN-Q4 — post-answer explainer.
// "Color 27 unit cubes in a 3×3×3 with 3 colors, no two adjacent same color.
//  How many cubes get color 1?" — answer: 9.
//
// Teaching beats:
//   intro   — show full cube, introduce the (i+j+k) mod 3 rule
//   layer0  — highlight bottom layer (z=0): 3 cubes per color visible
//   rule    — explain any two adjacent cubes differ by 1 in one coord → mod differs
//   count   — each of 3 residue classes has exactly 27÷3 = 9 cubes
//   answer  — color 1 gets exactly 9 unit cubes

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type ColorCubePhase = 'intro' | 'layer0' | 'rule' | 'count' | 'answer'

export interface ColorCubeStep {
  phase: ColorCubePhase
  caption: string
  hold: number
  result: boolean
}

export interface ColorCubeStoryboard {
  steps: ColorCubeStep[]
  finalIndex: number
  answer: number
}

export function buildColorCubeOSN24NEKQ4Steps(lang: Lang): ColorCubeStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps: ColorCubeStep[] = []

  steps.push({
    phase: 'intro',
    hold: 2400,
    result: false,
    caption: t(
      'Label each cube by its position (i, j, k) where i, j, k ∈ {0, 1, 2}. Assign color = (i+j+k) mod 3.',
      'Beri label setiap kubus dengan posisinya (i, j, k) di mana i, j, k ∈ {0, 1, 2}. Warna = (i+j+k) mod 3.',
    ),
  })

  steps.push({
    phase: 'layer0',
    hold: 2400,
    result: false,
    caption: t(
      'Bottom layer (z=0): positions give residues 0, 1, 2, 1, 2, 0, 2, 0, 1 — all three colors appear.',
      'Lapisan bawah (z=0): posisi menghasilkan sisa 0, 1, 2, 1, 2, 0, 2, 0, 1 — ketiga warna muncul.',
    ),
  })

  steps.push({
    phase: 'rule',
    hold: 2400,
    result: false,
    caption: t(
      'Two adjacent cubes differ in one coordinate by 1, so their (i+j+k) values differ by 1 mod 3 — never equal!',
      'Dua kubus yang bersisian berbeda satu koordinat sebesar 1, sehingga nilai (i+j+k)-nya berbeda 1 mod 3 — tidak pernah sama!',
    ),
  })

  steps.push({
    phase: 'count',
    hold: 2400,
    result: false,
    caption: t(
      'By symmetry, the 27 cubes split evenly: 9 with residue 0 (color 1), 9 with residue 1 (color 2), 9 with residue 2 (color 3).',
      'Berdasarkan simetri, 27 kubus terbagi rata: 9 dengan sisa 0 (warna 1), 9 dengan sisa 1 (warna 2), 9 dengan sisa 2 (warna 3).',
    ),
  })

  steps.push({
    phase: 'answer',
    hold: 0,
    result: true,
    caption: t(
      'Color 1 receives exactly 27 ÷ 3 = 9 unit cubes.',
      'Warna 1 menerima tepat 27 ÷ 3 = 9 kubus satuan.',
    ),
  })

  return { steps, finalIndex: steps.length - 1, answer: 9 }
}
