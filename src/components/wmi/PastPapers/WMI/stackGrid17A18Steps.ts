// SEAMO-18-A-Q17 — storyboard for the stack-grid animation.
//
// The question: three 4×4 grids each have two yellow cells.
// "What do we get if all the figures are stacked on top of each other?"
//
// Strategy: union — a cell is yellow in the result if it appears yellow in
// ANY of the three source figures.
//
// Source figures (0-indexed row, col):
//   Fig 1: (1,2) and (3,0)
//   Fig 2: (1,1) and (2,3)
//   Fig 3: (0,1) and (2,2)
// Union: {(0,1),(1,1),(1,2),(2,2),(2,3),(3,0)} — 6 cells → answer B
//
// Teaching walk, one idea per beat:
//   0. stem     — show the three source grids side by side.
//   1. fig1     — highlight Fig 1's cells: (1,2) and (3,0).
//   2. fig2     — add Fig 2's cells: (1,1) and (2,3).
//   3. fig3     — add Fig 3's cells: (0,1) and (2,2).
//   4. union    — show the full 6-cell union.
//   5. result   — confirm union = option B.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export type StackPhaseId = 'stem' | 'fig1' | 'fig2' | 'fig3' | 'union' | 'result'

/** [row, col] 0-indexed */
export type RC = [number, number]

export interface StackGridBeat {
  phase: StackPhaseId
  /** Cells lit so far (cumulative) in the stacking animation. */
  activeCells: RC[]
  /** Which source figure is being highlighted (1-3), or 0 for intro/result. */
  activeFig: 0 | 1 | 2 | 3
  caption: string
  equation: string
  hold: number
  result: boolean
}

export interface StackGridStoryboard {
  steps: StackGridBeat[]
  finalIndex: number
}

const FIG1_CELLS: RC[] = [[1, 2], [3, 0]]
const FIG2_CELLS: RC[] = [[1, 1], [2, 3]]
const FIG3_CELLS: RC[] = [[0, 1], [2, 2]]
const UNION_CELLS: RC[] = [[0, 1], [1, 1], [1, 2], [2, 2], [2, 3], [3, 0]]

export function buildStackGrid17A18Steps(lang: Lang): StackGridStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: StackGridBeat[] = [
    // Beat 0 — stem: introduce the three source figures
    {
      phase: 'stem',
      activeCells: [],
      activeFig: 0,
      equation: '',
      hold: 2000,
      result: false,
      caption: t(
        'Three grids each have 2 yellow cells. Stack them all — a cell is yellow in the result if it is yellow in ANY figure.',
        'Tiga grid masing-masing punya 2 sel kuning. Tumpuk semuanya — sel berwarna kuning di hasil jika ada di SALAH SATU gambar.',
      ),
    },

    // Beat 1 — highlight Fig 1
    {
      phase: 'fig1',
      activeCells: FIG1_CELLS,
      activeFig: 1,
      equation: 'Fig 1 → (r2,c3) (r4,c1)',
      hold: 2200,
      result: false,
      caption: t(
        'Figure 1 contributes 2 yellow cells: row 2 col 3, and row 4 col 1.',
        'Gambar 1 menyumbang 2 sel kuning: baris 2 kolom 3, dan baris 4 kolom 1.',
      ),
    },

    // Beat 2 — add Fig 2
    {
      phase: 'fig2',
      activeCells: [...FIG1_CELLS, ...FIG2_CELLS],
      activeFig: 2,
      equation: '+ Fig 2 → (r2,c2) (r3,c4)',
      hold: 2200,
      result: false,
      caption: t(
        'Figure 2 adds 2 more yellow cells: row 2 col 2, and row 3 col 4.',
        'Gambar 2 menambah 2 sel kuning lagi: baris 2 kolom 2, dan baris 3 kolom 4.',
      ),
    },

    // Beat 3 — add Fig 3
    {
      phase: 'fig3',
      activeCells: [...FIG1_CELLS, ...FIG2_CELLS, ...FIG3_CELLS],
      activeFig: 3,
      equation: '+ Fig 3 → (r1,c2) (r3,c3)',
      hold: 2200,
      result: false,
      caption: t(
        'Figure 3 adds the last 2 yellow cells: row 1 col 2, and row 3 col 3.',
        'Gambar 3 menambah 2 sel kuning terakhir: baris 1 kolom 2, dan baris 3 kolom 3.',
      ),
    },

    // Beat 4 — show full union
    {
      phase: 'union',
      activeCells: UNION_CELLS,
      activeFig: 0,
      equation: 'Union = 6 yellow cells',
      hold: 2200,
      result: false,
      caption: t(
        'Union of all three figures gives 6 yellow cells. Remove duplicates — only unique positions count.',
        'Gabungan ketiga gambar menghasilkan 6 sel kuning. Hapus duplikat — hanya posisi unik yang dihitung.',
      ),
    },

    // Beat 5 — result
    {
      phase: 'result',
      activeCells: UNION_CELLS,
      activeFig: 0,
      equation: 'Answer = B',
      hold: 0,
      result: true,
      caption: t(
        'The 6-cell union matches option B exactly — answer is B.',
        'Gabungan 6 sel sesuai dengan pilihan B persis — jawaban adalah B.',
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
