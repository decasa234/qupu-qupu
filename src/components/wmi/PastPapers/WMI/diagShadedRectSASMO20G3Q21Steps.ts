// diagShadedRectSASMO20G3Q21Steps.ts
//
// SASMO-20-G3-Q21 — storyboard for the shaded-triangle area explainer.
//
// Strategy:
//   1. Observe the 6×4 grid (24 unit squares).
//   2. Each unit square = 96 ÷ 24 = 4 cm².
//   3. The shaded triangle = ½ of the rectangle.
//   4. Shaded area = ½ × 96 = 48 cm².

export type Lang = 'en' | 'id'

export interface DiagShadedRectStep {
  key: string
  highlightShaded: boolean
  highlightAll: boolean
  /** Running area label to display below the figure (empty = hidden). */
  areaLabel: string
  caption: string
  result: boolean
  hold: number   // ms to auto-advance (0 = final beat, stays)
}

export interface DiagShadedRectStoryboard {
  steps: DiagShadedRectStep[]
  finalIndex: number
}

export function buildDiagShadedRectSASMO20G3Q21Steps(lang: Lang): DiagShadedRectStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: DiagShadedRectStep[] = [
    // Beat 0 — introduce the grid
    {
      key: 'intro',
      highlightShaded: false,
      highlightAll: true,
      areaLabel: '',
      caption: t(
        'The rectangle is divided into 6 × 4 = 24 equal squares.',
        'Persegi panjang dibagi menjadi 6 × 4 = 24 petak yang sama besar.',
      ),
      result: false,
      hold: 2600,
    },

    // Beat 1 — find area of one unit square
    {
      key: 'unitArea',
      highlightShaded: false,
      highlightAll: true,
      areaLabel: t('1 square = 96 ÷ 24 = 4 cm²', '1 petak = 96 ÷ 24 = 4 cm²'),
      caption: t(
        'Total area = 96 cm² ÷ 24 squares = 4 cm² per square.',
        'Luas total = 96 cm² ÷ 24 petak = 4 cm² per petak.',
      ),
      result: false,
      hold: 2600,
    },

    // Beat 2 — highlight the shaded triangle
    {
      key: 'shadedRegion',
      highlightShaded: true,
      highlightAll: false,
      areaLabel: t('Shaded = ½ of rectangle', 'Diarsir = ½ persegi panjang'),
      caption: t(
        'The shaded triangle has the same base and height as the rectangle — it covers exactly half.',
        'Segitiga yang diarsir memiliki alas dan tinggi sama dengan persegi panjang — luasnya tepat setengah.',
      ),
      result: false,
      hold: 2800,
    },

    // Beat 3 — count the shaded squares
    {
      key: 'countSquares',
      highlightShaded: true,
      highlightAll: false,
      areaLabel: t('Shaded = 12 squares', 'Diarsir = 12 petak'),
      caption: t(
        'Counting: 8 whole squares + 8 half-triangles (= 4 squares) = 12 squares total.',
        'Hitungan: 8 petak penuh + 8 setengah segitiga (= 4 petak) = 12 petak.',
      ),
      result: false,
      hold: 2800,
    },

    // Beat 4 — final answer
    {
      key: 'answer',
      highlightShaded: true,
      highlightAll: false,
      areaLabel: t('12 × 4 = 48 cm²', '12 × 4 = 48 cm²'),
      caption: t(
        'Shaded area = 12 × 4 cm² = 48 cm².',
        'Luas yang diarsir = 12 × 4 cm² = 48 cm².',
      ),
      result: true,
      hold: 0,
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
