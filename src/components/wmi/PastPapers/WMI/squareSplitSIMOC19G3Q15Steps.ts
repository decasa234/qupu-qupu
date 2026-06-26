// Steps for SIMOC-19-G3-Q15
// "ABCD adalah persegi yang dibagi menjadi 2 persegi panjang (44 cm² dan 28 cm²) dan sebuah persegi kecil."
// Answer: C → 170 cm²
//
// Solution:
//   Let s = big-square side, p = left-strip width (= top-strip height, since small sq is square).
//   Left rect:        p × s = 44
//   Upper-right rect: (s−p) × p = s·p − p² = 44 − p² = 28 → p² = 16 → p = 4, s = 11
//   Big square area:  s² = 121 cm²
//   Small square:     side = s−p = 7 → area = 49 cm²
//   Sum = 121 + 49 = 170 cm²

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type SplitPhase =
  | 'intro'
  | 'left_rect'
  | 'right_rect'
  | 'big_sq'
  | 'small_sq'
  | 'answer'

export interface SplitStep {
  phase: SplitPhase
  caption: string
  badge: string | null
  hold: number
  result: boolean
}

export interface SplitStoryboard {
  steps: SplitStep[]
  finalIndex: number
}

export function buildSquareSplitSIMOC19G3Q15Steps(lang: Lang): SplitStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps: SplitStep[] = []

  steps.push({
    phase: 'intro',
    hold: 2200,
    result: false,
    badge: null,
    caption: t(
      'ABCD is a square split into 2 rectangles (44 cm² and 28 cm²) and a small square. Find the sum of both square areas.',
      'ABCD adalah persegi yang dibagi menjadi 2 persegi panjang (44 cm² dan 28 cm²) dan sebuah persegi kecil. Temukan jumlah luas kedua persegi.',
    ),
  })

  steps.push({
    phase: 'left_rect',
    hold: 2500,
    result: false,
    badge: null,
    caption: t(
      'Let s = big square side, p = left strip width. Left rectangle area: p × s = 44.',
      'Misalkan s = sisi persegi besar, p = lebar strip kiri. Luas persegi panjang kiri: p × s = 44.',
    ),
  })

  steps.push({
    phase: 'right_rect',
    hold: 2800,
    result: false,
    badge: t('p = 4, s = 11', 'p = 4, s = 11'),
    caption: t(
      'Upper-right: (s−p)×p = 28. Since sp=44 → 44−p²=28 → p²=16 → p=4, s=11.',
      'Kanan atas: (s−p)×p = 28. Karena sp=44 → 44−p²=28 → p²=16 → p=4, s=11.',
    ),
  })

  steps.push({
    phase: 'big_sq',
    hold: 2200,
    result: false,
    badge: t('s² = 11² = 121 cm²', 's² = 11² = 121 cm²'),
    caption: t(
      'Big square area = s² = 11² = 121 cm².',
      'Luas persegi besar = s² = 11² = 121 cm².',
    ),
  })

  steps.push({
    phase: 'small_sq',
    hold: 2200,
    result: false,
    badge: t('7² = 49 cm²', '7² = 49 cm²'),
    caption: t(
      'Small square side = s − p = 11 − 4 = 7. Area = 7² = 49 cm².',
      'Sisi persegi kecil = s − p = 11 − 4 = 7. Luas = 7² = 49 cm².',
    ),
  })

  steps.push({
    phase: 'answer',
    hold: 0,
    result: true,
    badge: t('121 + 49 = 170 cm²', '121 + 49 = 170 cm²'),
    caption: t(
      'Sum of both square areas = 121 + 49 = 170 cm² → answer C.',
      'Jumlah luas kedua persegi = 121 + 49 = 170 cm² → jawaban C.',
    ),
  })

  return { steps, finalIndex: steps.length - 1 }
}
