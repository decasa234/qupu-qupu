// Steps storyboard for HKIMO-22-P1H-Q19 explainer.
// Count-squares puzzle: 8 unit squares + 2 two-by-two squares = 10.

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type SquaresHK22P1Q19Phase = 'intro' | 'unit' | 'large_a' | 'large_b' | 'result'

export interface SquaresHK22P1Q19Step {
  phase: SquaresHK22P1Q19Phase
  caption: string
  hold: number
}

export interface SquaresHK22P1Q19Story {
  steps: SquaresHK22P1Q19Step[]
  finalIndex: number
}

export function buildSquaresHK22P1Q19Steps(lang: Lang): SquaresHK22P1Q19Story {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: SquaresHK22P1Q19Step[] = [
    {
      phase: 'intro',
      caption: t('Count all squares by size', 'Hitung semua persegi berdasarkan ukuran'),
      hold: 60,
    },
    {
      phase: 'unit',
      caption: t('1×1 squares: 8', 'Persegi 1×1: 8'),
      hold: 90,
    },
    {
      phase: 'large_a',
      caption: t('2×2 square #1 (top-left block)', 'Persegi 2×2 ke-1 (blok kiri atas)'),
      hold: 90,
    },
    {
      phase: 'large_b',
      caption: t('2×2 square #2 (bottom-right block)', 'Persegi 2×2 ke-2 (blok kanan bawah)'),
      hold: 90,
    },
    {
      phase: 'result',
      caption: t('8 + 2 = 10 squares in total', '8 + 2 = 10 persegi seluruhnya'),
      hold: 120,
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
