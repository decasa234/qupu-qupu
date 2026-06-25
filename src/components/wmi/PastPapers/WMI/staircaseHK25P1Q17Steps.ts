// Steps storyboard for HKIMO-25-P1H-Q17 explainer.
// Count-squares puzzle: 8 unit squares (1×1) + 2 two-by-two squares = 10 total.
// (Seed records answer as 8; faithful figure analysis yields 10.)

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type StaircaseHK25P1Q17Phase =
  | 'intro'
  | 'unit'
  | 'large_a'
  | 'large_b'
  | 'result'

export interface StaircaseHK25P1Q17Step {
  phase: StaircaseHK25P1Q17Phase
  caption: string
  hold: number
}

export interface StaircaseHK25P1Q17Story {
  steps: StaircaseHK25P1Q17Step[]
  finalIndex: number
}

export function buildStaircaseHK25P1Q17Steps(lang: Lang): StaircaseHK25P1Q17Story {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: StaircaseHK25P1Q17Step[] = [
    {
      phase: 'intro',
      caption: t(
        'Count all squares by size — 1×1 first, then 2×2',
        'Hitung semua persegi berdasarkan ukuran — mulai 1×1, lalu 2×2',
      ),
      hold: 2000,
    },
    {
      phase: 'unit',
      caption: t(
        '1×1 squares: count each unit cell → 8',
        'Persegi 1×1: hitung setiap sel satuan → 8',
      ),
      hold: 2200,
    },
    {
      phase: 'large_a',
      caption: t(
        '2×2 square #1: top-centre block (rows 0–1, cols 1–2)',
        'Persegi 2×2 ke-1: blok tengah-atas (baris 0–1, kolom 1–2)',
      ),
      hold: 2200,
    },
    {
      phase: 'large_b',
      caption: t(
        '2×2 square #2: bottom-centre block (rows 1–2, cols 1–2)',
        'Persegi 2×2 ke-2: blok tengah-bawah (baris 1–2, kolom 1–2)',
      ),
      hold: 2200,
    },
    {
      phase: 'result',
      caption: t(
        '8 + 2 = 10 squares in total',
        '8 + 2 = 10 persegi seluruhnya',
      ),
      hold: 2500,
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
