// Storyboard for OSN-25-SD-KAB-Q23 — post-answer explainer.
// "10 unit cubes, minimum surface area?" → answer C (30 cm²)
//
// Strategy: SA = 10×6 − 2×(contacts). Maximize contacts → minimize SA.
// Beat 0 — intro: 10 × 6 = 60 total faces.
// Beat 1 — line: 9 contacts → SA = 42.
// Beat 2 — flat 2×5: 13 contacts → SA = 34.
// Beat 3 — compact 2×2×2+2: 15 contacts → SA = 30.
// Beat 4 — result: minimum SA = 30 cm².

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type CubeMinSAPhase = 'intro' | 'line' | 'flat' | 'compact' | 'result'

export interface CubeMinSAStep {
  phase: CubeMinSAPhase
  /** Which arrangement to render: 'line' | 'flat' | 'compact' | 'none' */
  arrangement: 'none' | 'line' | 'flat' | 'compact'
  contacts: number
  sa: number | null
  caption: string
  hold: number
  result: boolean
}

export interface CubeMinSAStoryboard {
  steps: CubeMinSAStep[]
  finalIndex: number
  answer: number
}

export function buildCubeMinSAOSN25KQ23Steps(lang: Lang): CubeMinSAStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CubeMinSAStep[] = []

  steps.push({
    phase: 'intro',
    arrangement: 'none',
    contacts: 0,
    sa: null,
    hold: 2000,
    result: false,
    caption: t(
      '10 cubes × 6 faces each = 60 faces. Each shared contact hides 2 faces.',
      '10 kubus × 6 sisi = 60 sisi. Setiap kontak bersama menyembunyikan 2 sisi.',
    ),
  })

  steps.push({
    phase: 'line',
    arrangement: 'line',
    contacts: 9,
    sa: 42,
    hold: 2400,
    result: false,
    caption: t(
      'Line of 10: 9 contacts → SA = 60 − 18 = 42.',
      'Baris 10: 9 kontak → LA = 60 − 18 = 42.',
    ),
  })

  steps.push({
    phase: 'flat',
    arrangement: 'flat',
    contacts: 13,
    sa: 34,
    hold: 2400,
    result: false,
    caption: t(
      'Flat 2×5 slab: 13 contacts → SA = 60 − 26 = 34.',
      'Lempengan 2×5: 13 kontak → LA = 60 − 26 = 34.',
    ),
  })

  steps.push({
    phase: 'compact',
    arrangement: 'compact',
    contacts: 15,
    sa: 30,
    hold: 2600,
    result: false,
    caption: t(
      'Compact 3D (2×2×2 + 2 on top): 15 contacts → SA = 60 − 30 = 30.',
      'Kompak 3D (2×2×2 + 2 di atas): 15 kontak → LA = 60 − 30 = 30.',
    ),
  })

  steps.push({
    phase: 'result',
    arrangement: 'compact',
    contacts: 15,
    sa: 30,
    hold: 0,
    result: true,
    caption: t(
      'Minimum surface area = 30 cm² — answer C.',
      'Luas permukaan minimum = 30 cm² — jawaban C.',
    ),
  })

  return { steps, finalIndex: steps.length - 1, answer: 30 }
}
