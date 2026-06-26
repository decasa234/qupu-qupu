// OSN-25-SD-NAS-FINAL-Q3 — Luas segitiga dengan kaki tegak lurus
//
// Metode (rasio luas sub-segitiga):
//   1. Tinggi dari C ke AB (kaki h di titik tengah AB): h = √(10²−6²) = 8 cm
//      Luas △ACB = ½ × 12 × 8 = 48 cm²
//   2. cos ∠ABC dalam △ABC: (AB²+BC²−AC²)/(2·AB·BC) = 144/240 = 3/5
//      BD = AB · cos B = 12 × 3/5 = 36/5 cm
//   3. △ABD dan △ACB berbagi puncak A di atas garis BC:
//      Luas △ABD / Luas △ACB = BD / BC = (36/5)/10 = 18/25
//   4. Luas △ABD = 48 × 18/25 = 864/25 cm²

import type { AltitudeHighlight } from './IsoscelesAltitudeOSN25NFQ3Illustration'

export type Lang = 'en' | 'id'

export interface IsoscelesAltitudeStep {
  highlight: AltitudeHighlight
  showAnswer: boolean
  equationLine: string | null
  caption: string
  hold: number
  result: boolean
}

export interface IsoscelesAltitudeStoryboard {
  steps: IsoscelesAltitudeStep[]
  finalIndex: number
}

export function buildIsoscelesAltitudeOSN25NFQ3Steps(lang: Lang): IsoscelesAltitudeStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: IsoscelesAltitudeStep[] = [
    // Beat 0 — Intro
    {
      highlight: null,
      showAnswer: false,
      equationLine: null,
      hold: 2600,
      result: false,
      caption: t(
        'Isosceles △ACB: AC = BC = 10 cm, AB = 12 cm. D is on BC with AD ⊥ BC. Find the area of △ABD.',
        'Segitiga sama kaki ACB: AC = BC = 10 cm, AB = 12 cm. D di BC dengan AD ⊥ BC. Cari luas △ABD.',
      ),
    },
    // Beat 1 — Height from C → area of △ACB
    {
      highlight: 'height-c',
      showAnswer: false,
      equationLine: 'h = √(10²−6²) = 8 cm   →   Luas △ACB = ½×12×8 = 48 cm²',
      hold: 3000,
      result: false,
      caption: t(
        'Drop a height from C to the midpoint of AB (half of AB = 6). h = √(100−36) = 8 cm, so area △ACB = 48 cm².',
        'Tarik tinggi dari C ke titik tengah AB (setengah AB = 6). h = √(100−36) = 8 cm, luas △ACB = 48 cm².',
      ),
    },
    // Beat 2 — Find BD via cosine
    {
      highlight: 'altitude',
      showAnswer: false,
      equationLine: 'cos B = 3/5   →   BD = 12 × 3/5 = 36/5 cm',
      hold: 3000,
      result: false,
      caption: t(
        'By law of cosines in △ABC: cos B = (AB²+BC²−AC²)/(2·AB·BC) = 144/240 = 3/5. Right △ABD gives BD = AB·cos B = 36/5 cm.',
        'Hukum kosinus di △ABC: cos B = 144/240 = 3/5. Karena siku-siku di D: BD = AB × cos B = 36/5 cm.',
      ),
    },
    // Beat 3 — Area ratio
    {
      highlight: 'sub-tri',
      showAnswer: false,
      equationLine: 'Luas △ABD / Luas △ACB = BD / BC = (36/5)/10 = 18/25',
      hold: 2800,
      result: false,
      caption: t(
        '△ABD and △ACB share vertex A above line BC, so their areas are proportional to their bases BD and BC.',
        '△ABD dan △ACB berbagi puncak A di atas garis BC, sehingga luasnya sebanding dengan BD dan BC.',
      ),
    },
    // Beat 4 — Answer
    {
      highlight: 'sub-tri',
      showAnswer: true,
      equationLine: 'Luas △ABD = 48 × 18/25 = 864/25 cm²',
      hold: 0,
      result: true,
      caption: t(
        'Area △ABD = 48 × 18/25 = 864/25 cm².',
        'Luas △ABD = 48 × 18/25 = 864/25 cm².',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
