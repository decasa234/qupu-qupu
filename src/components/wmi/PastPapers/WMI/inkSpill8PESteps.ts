// IKMC-22-PE-Q8 — storyboard for the ink-spill / squared-paper animation.
//
// Question: "Some ink spilled on a piece of squared paper.
//            How many of the squares have ink on them?"
// Grid: 5 columns × 4 rows = 20 cells total.
// Answer: E (20) — the blob touches every single cell.
// Trap:   D (19) — easy to miss one cell near the blob edge when scanning.
//
// Teaching walk (one idea per beat):
//   0. intro   — show the static figure; state the strategy (count row by row).
//   1. row 0   — highlight row 1: 5 squares with ink. Running = 5.
//   2. row 1   — highlight row 2: 5 squares. Running = 10.
//   3. row 2   — highlight row 3: 5 squares. Running = 15.
//   4. row 3   — highlight row 4: 5 squares. Running = 20.
//   5. result  — 5+5+5+5 = 20 → answer E.
//
// Pure builder: (lang) → storyboard. No Math.random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type InkPhase = 'intro' | 'row' | 'result'

export interface InkBeat {
  /** Which animation phase. */
  phase: InkPhase
  /** Row index (0-based) highlighted on this beat; null on intro/result. */
  row: number | null
  /** Running count of inked squares so far. */
  running: number
  /** Equation / maths line to display below the figure; '' to hide. */
  equation: string
  /** Caption for the explanation box. */
  caption: string
  /** Auto-hold duration in ms (0 = final beat, stay until user advances). */
  hold: number
  /** True only on the result beat. */
  result: boolean
}

export interface InkStoryboard {
  /** Rows counted per row (all equal: 5). */
  perRow: number
  /** Total squares. */
  total: number
  steps: InkBeat[]
  finalIndex: number
}

export const COLS = 5
export const ROWS = 4

export function buildInkSpill8PESteps(lang: Lang): InkStoryboard {
  const t = (en: string, id: string): string => (lang === 'id' ? id : en)

  const perRow = COLS // 5 squares per row

  const steps: InkBeat[] = [
    // Beat 0 — intro: show static figure, announce strategy
    {
      phase: 'intro',
      row: null,
      running: 0,
      equation: '',
      hold: 2000,
      result: false,
      caption: t(
        'The ink blob covers many squares. Count row by row — top to bottom.',
        'Tumpahan tinta menutupi banyak kotak. Hitung baris per baris — dari atas ke bawah.',
      ),
    },
  ]

  // Beats 1-4 — one per row
  let running = 0
  for (let r = 0; r < ROWS; r++) {
    running += perRow
    steps.push({
      phase: 'row',
      row: r,
      running,
      equation: `${Array.from({ length: r + 1 }, () => perRow).join(' + ')} = ${running}`,
      hold: 1800,
      result: false,
      caption: t(
        `Row ${r + 1}: all ${perRow} squares have ink. Total so far: ${running}.`,
        `Baris ${r + 1}: semua ${perRow} kotak terkena tinta. Total sejauh ini: ${running}.`,
      ),
    })
  }

  // Beat 5 — result
  const parts = Array.from({ length: ROWS }, () => perRow).join(' + ')
  steps.push({
    phase: 'result',
    row: null,
    running: ROWS * perRow,
    equation: `${parts} = ${ROWS * perRow}`,
    hold: 0,
    result: true,
    caption: t(
      `Every square has ink on it — ${parts} = 20 squares → answer E.`,
      `Setiap kotak terkena tinta — ${parts} = 20 kotak → jawaban E.`,
    ),
  })

  return {
    perRow,
    total: ROWS * perRow,
    steps,
    finalIndex: steps.length - 1,
  }
}
