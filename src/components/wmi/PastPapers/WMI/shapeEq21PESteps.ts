// IKMC-2022-PreEcolier-Q21 — storyboard for the shape-algebra animation.
//
// The question: 3×3 grid, row sums on the right, column sums on the bottom.
//   Row 0: square, square, square    = 18
//   Row 1: triangle, square, square  (no row sum)
//   Row 2: triangle, circle, triangle = 10
//   Col 0 sum = 14   Col 1 sum = ?
//
// Teaching walk, one idea per beat:
//   0. intro      — static grid; arrows, sums visible; three unknowns.
//   1. square     — row 0 has three squares: 18 ÷ 3 = 6  → square = 6.
//   2. triangle   — col 0: 6 + 2×triangle = 14 → triangle = 4.
//   3. circle     — row 2: 4 + circle + 4 = 10 → circle = 2.
//   4. col1 solve — col 1: 6 + 6 + 2 = 14 → reveal answer.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

import { SOL_CIRCLE, SOL_COL1, SOL_SQUARE, SOL_TRIANGLE } from './ShapeEq21PEIllustration'

export type Lang = 'en' | 'id'

export type ShapeEq21PEPhase = 'intro' | 'square' | 'triangle' | 'circle' | 'col1'

export interface ShapeEq21PEBeat {
  phase: ShapeEq21PEPhase
  /** Row index to wash (0-based), or null. */
  highlightRow: number | null
  /** Column index to wash (0-based), or null. */
  highlightCol: number | null
  /** Shapes with their solved values to overlay. */
  revealed: Partial<Record<'square' | 'triangle' | 'circle', number>>
  /** Which row totals to highlight green (length-3). */
  highlightRowTotals: boolean[]
  /** Whether to highlight col 0 total green. */
  highlightCol0: boolean
  /** Whether to reveal col 1 answer. */
  revealCol1: boolean
  /** Equation pill text ('' to hide). */
  equation: string
  /** Caption text. */
  caption: string
  /** Auto-hold in ms (0 = final / manual-advance). */
  hold: number
  /** True only on the last beat. */
  result: boolean
}

export interface ShapeEq21PEStoryboard {
  steps: ShapeEq21PEBeat[]
  finalIndex: number
}

export function buildShapeEq21PESteps(lang: Lang): ShapeEq21PEStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: ShapeEq21PEBeat[] = [
    // Beat 0 — intro
    {
      phase: 'intro',
      highlightRow: null,
      highlightCol: null,
      revealed: {},
      highlightRowTotals: [false, false, false],
      highlightCol0: false,
      revealCol1: false,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'Each shape is a different number. Rows sum right (→), columns sum down (↓). Find column 2 sum.',
        'Setiap bentuk mewakili angka berbeda. Baris dijumlahkan ke kanan (→), kolom dijumlahkan ke bawah (↓). Temukan jumlah kolom 2.',
      ),
    },

    // Beat 1 — square = 6
    {
      phase: 'square',
      highlightRow: 0,
      highlightCol: null,
      revealed: { square: SOL_SQUARE },
      highlightRowTotals: [true, false, false],
      highlightCol0: false,
      revealCol1: false,
      equation: t('18 ÷ 3 = 6', '18 ÷ 3 = 6'),
      hold: 2400,
      result: false,
      caption: t(
        `Row 1 has three squares adding to 18.  18 ÷ 3 = ${SOL_SQUARE}, so square = ${SOL_SQUARE}.`,
        `Baris 1 memiliki tiga kotak yang berjumlah 18.  18 ÷ 3 = ${SOL_SQUARE}, jadi kotak = ${SOL_SQUARE}.`,
      ),
    },

    // Beat 2 — triangle = 4
    {
      phase: 'triangle',
      highlightRow: null,
      highlightCol: 0,
      revealed: { square: SOL_SQUARE, triangle: SOL_TRIANGLE },
      highlightRowTotals: [false, false, false],
      highlightCol0: true,
      revealCol1: false,
      equation: t('(14 − 6) ÷ 2 = 4', '(14 − 6) ÷ 2 = 4'),
      hold: 2600,
      result: false,
      caption: t(
        `Column 1 = square + triangle + triangle = 14.  Square = ${SOL_SQUARE}, so 2 × triangle = 14 − ${SOL_SQUARE} = 8, triangle = ${SOL_TRIANGLE}.`,
        `Kolom 1 = kotak + segitiga + segitiga = 14.  Kotak = ${SOL_SQUARE}, jadi 2 × segitiga = 14 − ${SOL_SQUARE} = 8, segitiga = ${SOL_TRIANGLE}.`,
      ),
    },

    // Beat 3 — circle = 2
    {
      phase: 'circle',
      highlightRow: 2,
      highlightCol: null,
      revealed: { square: SOL_SQUARE, triangle: SOL_TRIANGLE, circle: SOL_CIRCLE },
      highlightRowTotals: [false, false, true],
      highlightCol0: false,
      revealCol1: false,
      equation: t('10 − 4 − 4 = 2', '10 − 4 − 4 = 2'),
      hold: 2400,
      result: false,
      caption: t(
        `Row 3: triangle + circle + triangle = 10.  ${SOL_TRIANGLE} + circle + ${SOL_TRIANGLE} = 10, so circle = 10 − ${SOL_TRIANGLE} − ${SOL_TRIANGLE} = ${SOL_CIRCLE}.`,
        `Baris 3: segitiga + lingkaran + segitiga = 10.  ${SOL_TRIANGLE} + lingkaran + ${SOL_TRIANGLE} = 10, jadi lingkaran = 10 − ${SOL_TRIANGLE} − ${SOL_TRIANGLE} = ${SOL_CIRCLE}.`,
      ),
    },

    // Beat 4 — col 1 = 14 (result)
    {
      phase: 'col1',
      highlightRow: null,
      highlightCol: 1,
      revealed: { square: SOL_SQUARE, triangle: SOL_TRIANGLE, circle: SOL_CIRCLE },
      highlightRowTotals: [false, false, false],
      highlightCol0: false,
      revealCol1: true,
      equation: t(
        `${SOL_SQUARE} + ${SOL_SQUARE} + ${SOL_CIRCLE} = ${SOL_COL1}`,
        `${SOL_SQUARE} + ${SOL_SQUARE} + ${SOL_CIRCLE} = ${SOL_COL1}`,
      ),
      hold: 0,
      result: true,
      caption: t(
        `Column 2 = square + square + circle = ${SOL_SQUARE} + ${SOL_SQUARE} + ${SOL_CIRCLE} = ${SOL_COL1}.  Answer C.`,
        `Kolom 2 = kotak + kotak + lingkaran = ${SOL_SQUARE} + ${SOL_SQUARE} + ${SOL_CIRCLE} = ${SOL_COL1}.  Jawaban C.`,
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
