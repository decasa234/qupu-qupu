/**
 * SEAMO-21-A-Q15 — beat steps for the shape-code explainer.
 *
 * Rule: each shape has a hidden digit.
 *   Square=4, Circle=2, Diamond=1, Triangle=3
 * Two-digit answer = (outer_digit × 10) + inner_digit
 *
 * Beats:
 *   0 — intro: show all 4 panels, "?" for the last.
 *   1 — highlight panel 0 (Square+Diamond=41): decode outer=4, inner=1.
 *   2 — highlight panel 1 (Circle+Triangle=23): decode outer=2, inner=3.
 *   3 — highlight panel 2 (Diamond+Triangle=13): decode outer=1, inner=3.
 *   4 — apply rule to panel 3 (Circle+Square): Circle=2, Square=4 → 24.
 *   5 — result: ? = 24, answer D.
 */

export interface ShapeCode21A15Step {
  caption:        string
  equation:       string
  highlightPanel: number | null
  revealAnswer:   boolean
  result:         boolean
  hold:           number
}

export interface ShapeCode21A15Story {
  steps:      ShapeCode21A15Step[]
  finalIndex: number
}

export function buildShapeCode21A15Steps(lang: 'en' | 'id'): ShapeCode21A15Story {
  const t = TRANSLATIONS[lang]

  const steps: ShapeCode21A15Step[] = [
    // Beat 0 — intro
    {
      caption:        t.intro,
      equation:       '',
      highlightPanel: null,
      revealAnswer:   false,
      result:         false,
      hold:           2000,
    },
    // Beat 1 — decode panel 0: Square(4) + Diamond(1) = 41
    {
      caption:        t.panel0,
      equation:       '4 _ 1 = 41',
      highlightPanel: 0,
      revealAnswer:   false,
      result:         false,
      hold:           2200,
    },
    // Beat 2 — decode panel 1: Circle(2) + Triangle(3) = 23
    {
      caption:        t.panel1,
      equation:       '2 _ 3 = 23',
      highlightPanel: 1,
      revealAnswer:   false,
      result:         false,
      hold:           2200,
    },
    // Beat 3 — decode panel 2: Diamond(1) + Triangle(3) = 13
    {
      caption:        t.panel2,
      equation:       '1 _ 3 = 13',
      highlightPanel: 2,
      revealAnswer:   false,
      result:         false,
      hold:           2200,
    },
    // Beat 4 — apply to panel 3: Circle(2) + Square(4) → 24
    {
      caption:        t.panel3,
      equation:       '2 _ 4 = ?',
      highlightPanel: 3,
      revealAnswer:   false,
      result:         false,
      hold:           2400,
    },
    // Beat 5 — reveal answer
    {
      caption:        t.result,
      equation:       '2 _ 4 = 24',
      highlightPanel: 3,
      revealAnswer:   true,
      result:         true,
      hold:           3200,
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}

// ── translations ───────────────────────────────────────────────────────────────

const TRANSLATIONS: Record<'en' | 'id', {
  intro:  string
  panel0: string
  panel1: string
  panel2: string
  panel3: string
  result: string
}> = {
  en: {
    intro:  'Each shape has a secret digit. The two-digit number uses: outer → tens, inner → ones.',
    panel0: 'Square = 4 (tens), Diamond = 1 (ones) → 41 ✓',
    panel1: 'Circle = 2 (tens), Triangle = 3 (ones) → 23 ✓',
    panel2: 'Diamond = 1 (tens), Triangle = 3 (ones) → 13 ✓',
    panel3: 'Now: Circle = 2 (tens), Square = 4 (ones) → 2 _ 4 = ?',
    result: 'Circle (2) outer, Square (4) inner → 24. Answer D!',
  },
  id: {
    intro:  'Setiap bentuk punya digit rahasia. Angka dua digit: luar → puluhan, dalam → satuan.',
    panel0: 'Kotak = 4 (puluhan), Wajik = 1 (satuan) → 41 ✓',
    panel1: 'Lingkaran = 2 (puluhan), Segitiga = 3 (satuan) → 23 ✓',
    panel2: 'Wajik = 1 (puluhan), Segitiga = 3 (satuan) → 13 ✓',
    panel3: 'Sekarang: Lingkaran = 2 (puluhan), Kotak = 4 (satuan) → 2 _ 4 = ?',
    result: 'Lingkaran (2) luar, Kotak (4) dalam → 24. Jawaban D!',
  },
}
