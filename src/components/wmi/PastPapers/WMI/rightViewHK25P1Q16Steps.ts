// Storyboard for HKIMO-25-P1H-Q16 — post-answer explainer.
// "At least how many square(s) can be seen if observing the figure below from the right?"
// Answer: 7 squares.
//
// Right-side view (looking in the -x direction) projects onto the yz plane:
//   y=2 (back column)  : z=0,1,2,3  → 4 squares
//   y=1 (middle step)  : z=0,1      → 2 squares
//   y=0 (front cube)   : z=0        → 1 square
//   Total: 4 + 2 + 1 = 7

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type RightViewPhase = 'intro' | 'back' | 'mid' | 'front' | 'total'

export interface RightViewHK25Step {
  phase: RightViewPhase
  /** depth rows (y values) whose right-face squares are now visible in the 2-D grid */
  revealedDepths: number[]
  runningTotal: number
  caption: string
  hold: number
  result: boolean
}

export interface RightViewHK25Storyboard {
  steps: RightViewHK25Step[]
  finalIndex: number
  answer: number
}

export function buildRightViewHK25P1Q16Steps(lang: Lang): RightViewHK25Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: RightViewHK25Step[] = []

  steps.push({
    phase: 'intro',
    revealedDepths: [],
    runningTotal: 0,
    hold: 2000,
    result: false,
    caption: t(
      'Look at the 3-D figure from the RIGHT side — count each visible unit square.',
      'Lihat bangun 3-D dari sisi KANAN — hitung setiap satuan persegi yang terlihat.',
    ),
  })

  steps.push({
    phase: 'back',
    revealedDepths: [2],
    runningTotal: 4,
    hold: 2400,
    result: false,
    caption: t(
      'Back column: 4 squares tall (heights 0 – 3).',
      'Kolom belakang: 4 persegi tinggi (tingkat 0 – 3).',
    ),
  })

  steps.push({
    phase: 'mid',
    revealedDepths: [2, 1],
    runningTotal: 6,
    hold: 2400,
    result: false,
    caption: t(
      'Middle row: 2 more squares (heights 0 – 1). Total so far: 4 + 2 = 6.',
      'Baris tengah: 2 persegi lagi (tingkat 0 – 1). Total sejauh ini: 4 + 2 = 6.',
    ),
  })

  steps.push({
    phase: 'front',
    revealedDepths: [2, 1, 0],
    runningTotal: 7,
    hold: 2400,
    result: false,
    caption: t(
      'Front: 1 more square (height 0). Total: 6 + 1 = 7.',
      'Depan: 1 persegi lagi (tingkat 0). Total: 6 + 1 = 7.',
    ),
  })

  steps.push({
    phase: 'total',
    revealedDepths: [2, 1, 0],
    runningTotal: 7,
    hold: 0,
    result: true,
    caption: t(
      'From the right: 4 + 2 + 1 = 7 squares.',
      'Dari sisi kanan: 4 + 2 + 1 = 7 persegi.',
    ),
  })

  return { steps, finalIndex: steps.length - 1, answer: 7 }
}
