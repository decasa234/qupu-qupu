// Storyboard for the WMI-19P3A-Q17 explainer (max sides of two triangles' overlap).
// Deterministic, language-parametric. The geometry constants live in the explainer;
// these beats only carry phase + captions + timing.

import type { Lang } from '../concepts/explainers/makeTenSteps'

export type Q17Phase = 'given' | 'oneEdge' | 'allEdges' | 'star' | 'countHex' | 'result'

export interface Q17Step {
  phase: Q17Phase
  caption: string
  hold: number
  result: boolean
}

export interface Q17Storyboard {
  answer: string
  maxSides: number
  steps: Q17Step[]
  finalIndex: number
}

export function buildP19G3Q17Steps(lang: Lang): Q17Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const MAX = 6

  const steps: Q17Step[] = [
    {
      phase: 'given',
      hold: 1900,
      result: false,
      caption: t(
        'As drawn, the overlap is a small triangle — 3 sides.',
        'Seperti digambar, irisannya segitiga kecil — 3 sisi.',
      ),
    },
    {
      phase: 'oneEdge',
      hold: 2100,
      result: false,
      caption: t(
        'One straight edge can cut through the other triangle in at most 2 points.',
        'Satu sisi lurus dapat memotong segitiga lain di paling banyak 2 titik.',
      ),
    },
    {
      phase: 'allEdges',
      hold: 2100,
      result: false,
      caption: t(
        'A triangle has 3 edges, so at most 3 × 2 = 6 crossing points.',
        'Segitiga punya 3 sisi, jadi paling banyak 3 × 2 = 6 titik potong.',
      ),
    },
    {
      phase: 'star',
      hold: 2200,
      result: false,
      caption: t(
        'Overlap them like a 6-pointed star to make every crossing happen.',
        'Tumpuk seperti bintang 6 sudut agar semua potongan terjadi.',
      ),
    },
    {
      phase: 'countHex',
      hold: 2200,
      result: false,
      caption: t(
        'Now the shaded middle is a hexagon — count its sides: 6.',
        'Sekarang bagian tengah berbentuk segi enam — hitung sisinya: 6.',
      ),
    },
    {
      phase: 'result',
      hold: 0,
      result: true,
      caption: t(
        `The greatest possible number of sides is ${MAX} — answer C.`,
        `Banyak sisi terbanyak yang mungkin adalah ${MAX} — jawaban C.`,
      ),
    },
  ]

  return { answer: 'C', maxSides: MAX, steps, finalIndex: steps.length - 1 }
}
