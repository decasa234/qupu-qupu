// Storyboard for HKIMO-19-P3H-Q16 — post-answer explainer.
// "At least how many squares can be seen if observing the figure from the right?"
// Answer: 4.
//
// Structure: front staircase (y=0) with heights 3-2-1 at x=0,1,2
// + flat back row (y=1) at z=0.
//
// Right-side view (looking in −X direction → see YZ plane):
//   y=0: z=0,1,2  → 3 squares
//   y=1: z=0      → 1 square
//   Total = 4

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type Phase19HKP3Q16 = 'intro' | 'front' | 'back' | 'total'

export interface Step19HKP3Q16 {
  phase: Phase19HKP3Q16
  /** Highlight front staircase cubes (y=0) */
  frontLit: boolean
  /** Highlight back flat-row cubes (y=1) */
  backLit: boolean
  /** How many depth-columns of the 2-D right-side view to fill (0, 1, or 2) */
  rightViewCols: 0 | 1 | 2
  /** Running count shown below the right-view panel */
  squaresFound: number
  caption: string
  hold: number
  result: boolean
}

export interface Storyboard19HKP3Q16 {
  steps: Step19HKP3Q16[]
  finalIndex: number
  answer: number
}

export function buildCubeStair19HKP3Q16Steps(lang: Lang): Storyboard19HKP3Q16 {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Step19HKP3Q16[] = []

  // 0 – intro: show the 3-D structure, nothing highlighted yet
  steps.push({
    phase: 'intro',
    frontLit: false,
    backLit: false,
    rightViewCols: 0,
    squaresFound: 0,
    hold: 2000,
    result: false,
    caption: t(
      'Observe this 3-D figure from the RIGHT side — what do you see?',
      'Amati gambar 3-D ini dari sisi KANAN — apa yang kamu lihat?',
    ),
  })

  // 1 – reveal the front staircase
  steps.push({
    phase: 'front',
    frontLit: true,
    backLit: false,
    rightViewCols: 1,
    squaresFound: 3,
    hold: 2400,
    result: false,
    caption: t(
      'The front column (heights 3-2-1) shows 3 squares from the right.',
      'Kolom depan (tinggi 3-2-1) menampilkan 3 persegi dari sisi kanan.',
    ),
  })

  // 2 – reveal the back flat row
  steps.push({
    phase: 'back',
    frontLit: true,
    backLit: true,
    rightViewCols: 2,
    squaresFound: 4,
    hold: 2400,
    result: false,
    caption: t(
      'The back row adds 1 more square at the base — 3 + 1 = 4.',
      'Baris belakang menambah 1 persegi di dasar — 3 + 1 = 4.',
    ),
  })

  // 3 – answer confirmed
  steps.push({
    phase: 'total',
    frontLit: true,
    backLit: true,
    rightViewCols: 2,
    squaresFound: 4,
    hold: 0,
    result: true,
    caption: t(
      'At least 4 squares are visible from the right — answer: 4.',
      'Minimal 4 persegi terlihat dari sisi kanan — jawaban: 4.',
    ),
  })

  return { steps, finalIndex: steps.length - 1, answer: 4 }
}
