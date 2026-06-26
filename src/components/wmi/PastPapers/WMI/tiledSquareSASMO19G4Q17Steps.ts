// tiledSquareSASMO19G4Q17Steps.ts — SASMO-19-G4-Q17
//
// "Persegi besar terbuat dari 8 persegi panjang identik dan 1 persegi kecil.
//  Lebar persegi panjang = 2 cm, luas persegi kecil = 64 cm².
//  Temukan keliling persegi besar."
//
// METHOD:
//   1. Small square area = 64 cm²  →  side = √64 = 8 cm
//   2. Big square side  = 2 + 8 + 2 = 12 cm  (one rectangle width on each side)
//   3. Perimeter        = 4 × 12 = 48 cm

import type { TiledSquareHighlight } from './TiledSquareSASMO19G4Q17Illustration'

export type Lang = 'en' | 'id'

export interface TiledSquareStep {
  highlight: TiledSquareHighlight
  showAnswer: boolean
  equationLine: string | null
  caption: string
  hold: number
  result: boolean
}

export interface TiledSquareStoryboard {
  steps: TiledSquareStep[]
  finalIndex: number
}

export function buildTiledSquareSASMO19G4Q17Steps(lang: Lang): TiledSquareStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: TiledSquareStep[] = [
    // Beat 1 — introduce the figure
    {
      highlight: null,
      showAnswer: false,
      equationLine: null,
      hold: 2400,
      result: false,
      caption: t(
        'The big square is made of 8 identical rectangles (width 2 cm) and 1 small square (area 64 cm²).',
        'Persegi besar terdiri dari 8 persegi panjang identik (lebar 2 cm) dan 1 persegi kecil (luas 64 cm²).',
      ),
    },
    // Beat 2 — find the inner square side
    {
      highlight: 'inner',
      showAnswer: false,
      equationLine: t('side of small square = √64 = 8 cm', 'sisi persegi kecil = √64 = 8 cm'),
      hold: 2800,
      result: false,
      caption: t(
        'The small square has area 64 cm². Its side length is √64 = 8 cm.',
        'Persegi kecil memiliki luas 64 cm². Panjang sisinya adalah √64 = 8 cm.',
      ),
    },
    // Beat 3 — add the frame widths
    {
      highlight: 'frame',
      showAnswer: false,
      equationLine: t('big side = 2 + 8 + 2 = 12 cm', 'sisi besar = 2 + 8 + 2 = 12 cm'),
      hold: 2800,
      result: false,
      caption: t(
        'Each rectangle is 2 cm wide. The big square\'s side = 2 + 8 + 2 = 12 cm.',
        'Setiap persegi panjang lebarnya 2 cm. Sisi persegi besar = 2 + 8 + 2 = 12 cm.',
      ),
    },
    // Beat 4 — calculate perimeter
    {
      highlight: 'side',
      showAnswer: true,
      equationLine: t('perimeter = 4 × 12 = 48 cm', 'keliling = 4 × 12 = 48 cm'),
      hold: 0,
      result: true,
      caption: t(
        'Perimeter of the big square = 4 × 12 = 48 cm.',
        'Keliling persegi besar = 4 × 12 = 48 cm.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
