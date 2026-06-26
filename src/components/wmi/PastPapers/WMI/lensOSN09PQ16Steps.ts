// lensOSN09PQ16Steps.ts — OSN-09-SD-PROV-Q16
//
// "A 7 cm × 7 cm square contains a leaf-shaped (lens) region. The curved lines
//  are arcs of a circle. Find the area of the shaded region."
// Answer: 49(π/2 − 1) cm²
//
// METHOD (inclusion–exclusion with two quarter-circle sectors):
//   Each arc is a quarter-circle of radius r = 7 cm centred at a corner.
//   The two sectors together exactly tile the square:
//     Sector₁ (⊂ square, centred at TR) + Sector₂ (⊂ square, centred at BL) = Square + Lens
//   ↔  Lens = S₁ + S₂ − Square = ¼πr² + ¼πr² − r²
//            = ½πr² − r² = r²(π/2 − 1) = 49(π/2 − 1) cm²

import type { LensHighlight } from './LensOSN09PQ16Illustration'

export type Lang = 'en' | 'id'

export interface LensStep {
  highlight: LensHighlight
  showAnswer: boolean
  equationLine: string | null
  caption: string
  hold: number
  result: boolean
}

export interface LensStoryboard {
  steps: LensStep[]
  finalIndex: number
}

export function buildLensOSN09PQ16Steps(lang: Lang): LensStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: LensStep[] = [
    // 1. Introduce the figure
    {
      highlight: null,
      showAnswer: false,
      equationLine: null,
      hold: 2600,
      result: false,
      caption: t(
        'A 7 cm × 7 cm square contains a leaf-shaped (lens) region bounded by two circular arcs. Find the shaded area.',
        'Persegi 7 cm × 7 cm mengandung daerah berbentuk daun (lensa) yang dibatasi dua busur lingkaran. Cari luas yang diarsir.',
      ),
    },
    // 2. Identify Sector 1 (centred at TR)
    {
      highlight: 'sector1',
      showAnswer: false,
      equationLine: t('Sector₁ = ¼ × π × 7² = 49π/4 cm²', 'Sektor₁ = ¼ × π × 7² = 49π/4 cm²'),
      hold: 2800,
      result: false,
      caption: t(
        'One arc is a quarter-circle of radius 7 cm centred at the top-right corner. Its sector area is ¼πr² = 49π/4 cm².',
        'Satu busur adalah seperempat lingkaran berjari-jari 7 cm berpusat di sudut kanan atas. Luas sektornya ¼πr² = 49π/4 cm².',
      ),
    },
    // 3. Both sectors cover the square exactly once (outside the lens) plus twice (inside)
    {
      highlight: 'sectors',
      showAnswer: false,
      equationLine: t('Sector₁ + Sector₂ = 49π/4 + 49π/4 = 49π/2 cm²', 'Sektor₁ + Sektor₂ = 49π/4 + 49π/4 = 49π/2 cm²'),
      hold: 2800,
      result: false,
      caption: t(
        'The second arc (centred at the bottom-left corner) gives an equal sector. Together the two sectors cover the square once outside the lens and twice inside it.',
        'Busur kedua (berpusat di sudut kiri bawah) memberikan sektor yang sama. Bersama-sama kedua sektor menutup persegi sekali di luar daun dan dua kali di dalamnya.',
      ),
    },
    // 4. Subtract the square
    {
      highlight: 'sectors',
      showAnswer: false,
      equationLine: t('Lens = 49π/2 − 7² = 49π/2 − 49 cm²', 'Daun = 49π/2 − 7² = 49π/2 − 49 cm²'),
      hold: 2600,
      result: false,
      caption: t(
        'By inclusion–exclusion: Sector₁ + Sector₂ = Square + Lens, so Lens = 49π/2 − 49 cm².',
        'Dengan inklusi–eksklusi: Sektor₁ + Sektor₂ = Persegi + Daun, jadi Daun = 49π/2 − 49 cm².',
      ),
    },
    // 5. Final answer
    {
      highlight: null,
      showAnswer: true,
      equationLine: t('= 49(π/2 − 1) cm²', '= 49(π/2 − 1) cm²'),
      hold: 0,
      result: true,
      caption: t(
        'Factor out 49: Lens area = 49(π/2 − 1) cm².',
        'Faktorkan 49: Luas daun = 49(π/2 − 1) cm².',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
