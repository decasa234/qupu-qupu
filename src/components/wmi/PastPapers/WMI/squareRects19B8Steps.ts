// SEAMO-19-B-Q8 — storyboard for "2 squares + 4 identical rectangles" animation.
//
// Problem: figure made of 2 squares (areas 64 cm² and 4 cm²) + 4 identical rectangles.
// Find the perimeter of a rectangle.
//
// Solution path:
//   0. intro    — show the figure; label both square areas.
//   1. sides    — derive sides: √64 = 8 cm, √4 = 2 cm.
//   2. rect-dim — identify rectangle dimension = big side − small side = 8 − 2 = 6 cm;
//                 width = 2 cm (equals small square side).
//   3. perimeter— 2 × (6 + 2) = 16 cm.
//   4. result   — 16 cm → answer A.

export type Lang = 'en' | 'id'

export type SR19B8Phase = 'intro' | 'sides' | 'rect-dim' | 'perimeter' | 'result'

export interface SR19B8Beat {
  phase: SR19B8Phase
  /** Show area labels on both squares. */
  showAreaLabels: boolean
  /** Show derived side lengths (8 cm, 2 cm) as dimension annotations. */
  showSideLabels: boolean
  /** Highlight the four rectangles in green + show their dims. */
  highlightRects: boolean
  /** Show rectangle dimension labels (6 and 2). */
  showRectDims: boolean
  /** Equation to display; '' = hidden. */
  equation: string
  /** Caption text. */
  caption: string
  /** Auto-hold ms (0 = final / manual). */
  hold: number
  result: boolean
}

export interface SR19B8Storyboard {
  steps: SR19B8Beat[]
  finalIndex: number
}

export function buildSquareRects19B8Steps(lang: Lang): SR19B8Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: SR19B8Beat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      showAreaLabels: true,
      showSideLabels: false,
      highlightRects: false,
      showRectDims: false,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'The figure contains a large square (area 64 cm²), a small square (area 4 cm²), and 4 identical rectangles.',
        'Gambar memuat persegi besar (luas 64 cm²), persegi kecil (luas 4 cm²), dan 4 persegi panjang identik.',
      ),
    },

    // Beat 1 — derive side lengths
    {
      phase: 'sides',
      showAreaLabels: true,
      showSideLabels: true,
      highlightRects: false,
      showRectDims: false,
      equation: '√64 = 8 cm  |  √4 = 2 cm',
      hold: 2200,
      result: false,
      caption: t(
        'Square sides: big = √64 = 8 cm, small = √4 = 2 cm.',
        'Sisi persegi: besar = √64 = 8 cm, kecil = √4 = 2 cm.',
      ),
    },

    // Beat 2 — rectangle dimensions
    {
      phase: 'rect-dim',
      showAreaLabels: false,
      showSideLabels: true,
      highlightRects: true,
      showRectDims: true,
      equation: '8 − 2 = 6 cm',
      hold: 2200,
      result: false,
      caption: t(
        'Each rectangle has length = 8 − 2 = 6 cm and width = 2 cm.',
        'Setiap persegi panjang memiliki panjang = 8 − 2 = 6 cm dan lebar = 2 cm.',
      ),
    },

    // Beat 3 — perimeter
    {
      phase: 'perimeter',
      showAreaLabels: false,
      showSideLabels: false,
      highlightRects: true,
      showRectDims: true,
      equation: '2 × (6 + 2) = 16 cm',
      hold: 2200,
      result: false,
      caption: t(
        'Perimeter = 2 × (length + width) = 2 × (6 + 2) = 16 cm.',
        'Keliling = 2 × (panjang + lebar) = 2 × (6 + 2) = 16 cm.',
      ),
    },

    // Beat 4 — result
    {
      phase: 'result',
      showAreaLabels: false,
      showSideLabels: false,
      highlightRects: true,
      showRectDims: false,
      equation: '16 cm → A',
      hold: 0,
      result: true,
      caption: t(
        'The perimeter of a rectangle is 16 cm — answer A.',
        'Keliling persegi panjang adalah 16 cm — jawaban A.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
