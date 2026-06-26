// OSN-25-SD-PROV-Q6 — symbol-grid sum puzzle storyboard.
//
// Puzzle: 4×4 grid of symbols (heart=5, diamond=7, star=6, ring=8).
// Row sums: 24, 26, 23, 26.  Col sums: ?, 24, 23, 27.
// Find column-1 sum.
//
// Strategy: total rows = 24+26+23+26 = 99 = total cols.
//           col 1 = 99 − (24+23+27) = 99 − 74 = 25.
//
// Beats:
//   0. intro      — show the full grid; state the facts.
//   1. row-total  — highlight all row sums → 24+26+23+26 = 99.
//   2. known-cols — highlight known column sums → 24+23+27 = 74.
//   3. result     — reveal col 1 = 99 − 74 = 25.
//
// Pure data — no hooks, no randomness, SSR-safe.

export type Lang = 'en' | 'id'

export type SymGridPhase = 'intro' | 'row-total' | 'known-cols' | 'result'

export interface SymGridBeat {
  phase: SymGridPhase
  /** Highlight the row-sum labels on the right. */
  highlightRows: boolean
  /** Highlight known col-sum labels (cols 2,3,4). */
  highlightKnownCols: boolean
  /** Flash the revealed col-1 sum. */
  revealCol1: boolean
  /** Equation shown beneath the grid. */
  equation: string
  /** Caption for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final). */
  hold: number
  result: boolean
}

export interface SymGridStoryboard {
  steps: SymGridBeat[]
  finalIndex: number
}

export function buildSymbolGridOSN25PQ6Steps(lang: Lang): SymGridStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: SymGridBeat[] = [
    {
      phase: 'intro',
      highlightRows: false,
      highlightKnownCols: false,
      revealCol1: false,
      equation: '',
      hold: 2200,
      result: false,
      caption: t(
        'Each symbol represents a number. Row sums are shown on the right; column sums below. Find the missing column sum (?).',
        'Setiap simbol mewakili sebuah bilangan. Jumlah baris terlihat di kanan; jumlah kolom di bawah. Cari jumlah kolom pertama (?).',
      ),
    },
    {
      phase: 'row-total',
      highlightRows: true,
      highlightKnownCols: false,
      revealCol1: false,
      equation: '24 + 26 + 23 + 26 = 99',
      hold: 2200,
      result: false,
      caption: t(
        'The total of all row sums = the total of all column sums. Add the row sums: 24 + 26 + 23 + 26 = 99.',
        'Total semua jumlah baris = total semua jumlah kolom. Jumlahkan baris: 24 + 26 + 23 + 26 = 99.',
      ),
    },
    {
      phase: 'known-cols',
      highlightRows: false,
      highlightKnownCols: true,
      revealCol1: false,
      equation: '24 + 23 + 27 = 74',
      hold: 2200,
      result: false,
      caption: t(
        'Three column sums are already known. Add them: 24 + 23 + 27 = 74.',
        'Tiga jumlah kolom sudah diketahui. Jumlahkan: 24 + 23 + 27 = 74.',
      ),
    },
    {
      phase: 'result',
      highlightRows: false,
      highlightKnownCols: false,
      revealCol1: true,
      equation: '99 − 74 = 25',
      hold: 0,
      result: true,
      caption: t(
        'Column 1 sum = 99 − 74 = 25.',
        'Jumlah kolom 1 = 99 − 74 = 25.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
