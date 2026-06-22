// IKMC-22-EC-Q23 — storyboard for the multiplication-table animation.
//
// The question: find the number hidden behind the heart (♥) in a 2×2
// multiplication table.
//
// Table:
//   ×  |  3  |  ?
//   5  | 15  | 35
//   4  | 12  |  ♥
//
// Solution (matches breakdown.quantities):
//   Step 1: Use row 5 → 5 × ? = 35  →  ? = 35 ÷ 5 = 7
//   Step 2: ♥ = 4 × 7 = 28  →  answer C
//
// Teaching walk, one idea per beat:
//   0. intro      — static table; state the task.
//   1. anchor     — highlight 35, confirm 5 × ? = 35 leads to ? = 7.
//   2. col-found  — reveal the column header ? = 7 (blue highlight).
//   3. result     — reveal ♥ = 28 (green highlight).
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type OpTable23ECPhaseId = 'intro' | 'anchor' | 'col-found' | 'result'

export interface OpTable23ECBeat {
  /** Teaching phase. */
  phase: OpTable23ECPhaseId
  /** Show the solved column header (7). */
  showColHeader: boolean
  /** Show the heart answer (28). */
  showHeart: boolean
  /** Highlight which element. */
  highlight: 'col' | 'heart' | null
  /** Highlight the 35 cell to anchor the column search. */
  highlightCell35: boolean
  /** Equation pill text ('' to hide). */
  equation: string
  /** Caption for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final beat / manual). */
  hold: number
  /** True only on the answer beat. */
  result: boolean
}

export interface OpTable23ECStoryboard {
  steps: OpTable23ECBeat[]
  finalIndex: number
}

export function buildOpTable23ECSteps(lang: Lang): OpTable23ECStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: OpTable23ECBeat[] = [
    // Beat 0 — intro: show static table, state the task
    {
      phase: 'intro',
      showColHeader: false,
      showHeart: false,
      highlight: null,
      highlightCell35: false,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'Each cell = (row header) × (column header). Find the number hidden behind the heart.',
        'Setiap sel = (header baris) × (header kolom). Temukan angka di balik hati.',
      ),
    },

    // Beat 1 — anchor: row 5 gives us the missing column header
    {
      phase: 'anchor',
      showColHeader: false,
      showHeart: false,
      highlight: 'col',
      highlightCell35: true,
      equation: '5 × ? = 35',
      hold: 2400,
      result: false,
      caption: t(
        'Row 5: 5 × ? = 35. Divide: ? = 35 ÷ 5 = 7.',
        'Baris 5: 5 × ? = 35. Bagi: ? = 35 ÷ 5 = 7.',
      ),
    },

    // Beat 2 — col-found: reveal the column header as 7
    {
      phase: 'col-found',
      showColHeader: true,
      showHeart: false,
      highlight: 'col',
      highlightCell35: false,
      equation: '? = 7',
      hold: 2200,
      result: false,
      caption: t(
        'The missing column header is 7.',
        'Header kolom yang hilang adalah 7.',
      ),
    },

    // Beat 3 — result: reveal ♥ = 4 × 7 = 28
    {
      phase: 'result',
      showColHeader: true,
      showHeart: true,
      highlight: 'heart',
      highlightCell35: false,
      equation: '4 × 7 = 28',
      hold: 0,
      result: true,
      caption: t(
        '♥ = 4 × 7 = 28. Answer: C.',
        '♥ = 4 × 7 = 28. Jawaban: C.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
