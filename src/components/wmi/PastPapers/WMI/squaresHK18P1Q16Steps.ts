// Steps storyboard for HKIMO-18-P1H-Q16 explainer.
// Count-squares puzzle: 7 unit squares + 2 two-by-two squares = 9.

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type SquaresHK18P1Q16Phase = 'intro' | 'unit' | 'large_a' | 'large_b' | 'result'

export interface SquaresHK18P1Q16Step {
  phase: SquaresHK18P1Q16Phase
  caption: string
  hold: number
}

export interface SquaresHK18P1Q16Story {
  steps: SquaresHK18P1Q16Step[]
  finalIndex: number
}

export function buildSquaresHK18P1Q16Steps(lang: Lang): SquaresHK18P1Q16Story {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: SquaresHK18P1Q16Step[] = [
    {
      phase: 'intro',
      caption: t('Count all squares by size', 'Hitung semua persegi berdasarkan ukuran'),
      hold: 60,
    },
    {
      phase: 'unit',
      caption: t('1×1 squares: 7', 'Persegi 1×1: 7'),
      hold: 90,
    },
    {
      phase: 'large_a',
      caption: t('2×2 square #1 (columns 2–3)', 'Persegi 2×2 ke-1 (kolom 2–3)'),
      hold: 90,
    },
    {
      phase: 'large_b',
      caption: t('2×2 square #2 (columns 3–4)', 'Persegi 2×2 ke-2 (kolom 3–4)'),
      hold: 90,
    },
    {
      phase: 'result',
      caption: t('7 + 2 = 9 squares in total', '7 + 2 = 9 persegi seluruhnya'),
      hold: 120,
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
