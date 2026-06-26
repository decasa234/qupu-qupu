// Storyboard for OSN-20-SD-KAB-Q1 post-answer explainer.
// "Panjang kawat yang dibutuhkan untuk mengikat kayu adalah ⋯ cm" — answer: 370.
//
// Cross-section: 3×20=60 cm wide, 3×10=30 cm tall.
// Perimeter per band: 2×(60+30)=180 cm. With 5 cm extra: 185 cm.
// 2 bands total: 2×185 = 370 cm.

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type PlankBundlePhase = 'intro' | 'section' | 'perimeter' | 'bands' | 'result'

export interface PlankBundleOSN20KQ1Step {
  phase: PlankBundlePhase
  highlightSection: boolean
  highlightBands: boolean
  caption: string
  hold: number
  result: boolean
}

export interface PlankBundleOSN20KQ1Storyboard {
  steps: PlankBundleOSN20KQ1Step[]
  finalIndex: number
  answer: number
}

export function buildPlankBundleOSN20KQ1Steps(lang: Lang): PlankBundleOSN20KQ1Storyboard {
  const t = (en: string, id: string) => lang === 'id' ? id : en

  const steps: PlankBundleOSN20KQ1Step[] = [
    {
      phase: 'intro',
      highlightSection: false,
      highlightBands: false,
      hold: 2000,
      result: false,
      caption: t(
        '9 planks (20 cm × 10 cm cross-section, 150 cm long) arranged 3 wide × 3 tall.',
        '9 balok (penampang 20 cm × 10 cm, panjang 150 cm) disusun 3 berjajar dan 3 bertingkat.',
      ),
    },
    {
      phase: 'section',
      highlightSection: true,
      highlightBands: false,
      hold: 2400,
      result: false,
      caption: t(
        'Bundle cross-section: width = 3 × 20 = 60 cm, height = 3 × 10 = 30 cm.',
        'Penampang ikatan: lebar = 3 × 20 = 60 cm, tinggi = 3 × 10 = 30 cm.',
      ),
    },
    {
      phase: 'perimeter',
      highlightSection: true,
      highlightBands: false,
      hold: 2400,
      result: false,
      caption: t(
        'Perimeter of one binding = 2 × (60 + 30) = 180 cm.',
        'Keliling satu ikatan = 2 × (60 + 30) = 180 cm.',
      ),
    },
    {
      phase: 'bands',
      highlightSection: false,
      highlightBands: true,
      hold: 2400,
      result: false,
      caption: t(
        'Each binding needs 180 + 5 = 185 cm (5 cm extra for wrapping). There are 2 bindings.',
        'Setiap ikatan butuh 180 + 5 = 185 cm (5 cm kelebihan untuk dililit). Ada 2 ikatan.',
      ),
    },
    {
      phase: 'result',
      highlightSection: false,
      highlightBands: true,
      hold: 0,
      result: true,
      caption: t(
        'Total wire = 2 × 185 = 370 cm.',
        'Total kawat = 2 × 185 = 370 cm.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1, answer: 370 }
}
