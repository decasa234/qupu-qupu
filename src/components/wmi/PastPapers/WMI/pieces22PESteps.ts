// IKMC-23-PE-Q22 — step storyboard (anti-drift constants from seed)
// Question: Malik places one of five pieces on a 3×3 grid (no rotate/flip).
// Which piece covers the largest sum?
// Grid:
//   row 0: 1, 6, 7
//   row 1: 9, 5, 4
//   row 2: 2, 8, 3
// Answer: E  (official IKMC 2023 answer key, Q22 Pre-Ecolier)
//
// Piece E placed at anchor (0,0) covers (0,1)=6, (0,2)=7, (1,0)=9, (1,1)=5 → sum 27.
// (Piece shapes are rendered as-is from source images; no rotation/flip.)

export type Lang = 'en' | 'id'

// ── Grid constants ────────────────────────────────────────────────────────────

/** 3×3 grid values, indexed [row][col]. */
export const GRID: number[][] = [
  [1, 6, 7],
  [9, 5, 4],
  [2, 8, 3],
]

// ── Piece cell definitions ────────────────────────────────────────────────────
// Each piece is an array of [row, col] offsets from a (0,0) anchor.
// Pieces A–E match the source images exactly; no rotation or flip is allowed.

/** [row, col] offsets */
export type Cell = [number, number]

/**
 * Piece A — Γ-pentomino (5 cells):
 *   . . X
 *   . . X
 *   X X X
 */
export const PIECE_A: Cell[] = [[0, 2], [1, 2], [2, 0], [2, 1], [2, 2]]

/**
 * Piece B — staircase pentomino (5 cells):
 *   . . X
 *   . X X
 *   X X .
 */
export const PIECE_B: Cell[] = [[0, 2], [1, 1], [1, 2], [2, 0], [2, 1]]

/**
 * Piece C — Plus-pentomino (5 cells):
 *   . X .
 *   X X X
 *   . X .
 */
export const PIECE_C: Cell[] = [[0, 1], [1, 0], [1, 1], [1, 2], [2, 1]]

/**
 * Piece D — Z-tetromino (4 cells):
 *   X X .
 *   . X X
 */
export const PIECE_D: Cell[] = [[0, 0], [0, 1], [1, 1], [1, 2]]

/**
 * Piece E — S-pentomino / irregular 5-cell piece (from source image):
 *   . X X
 *   X X .
 *   X . .
 * Best placement anchor (0,0) on the 3×3 grid covers:
 *   (0,1)=6, (0,2)=7, (1,0)=9, (1,1)=5, (2,0)=2  → sum = 29
 *
 * Official answer: E  (IKMC 2023 answer key)
 */
export const PIECE_E: Cell[] = [[0, 1], [0, 2], [1, 0], [1, 1], [2, 0]]

export const ALL_PIECES: Record<string, Cell[]> = {
  A: PIECE_A,
  B: PIECE_B,
  C: PIECE_C,
  D: PIECE_D,
  E: PIECE_E,
}

// ── Answer constants (from seed + official answer key) ────────────────────────

export const ANSWER_LABEL  = 'E'
/** Cells covered by piece E at its optimal anchor (0,0). */
export const ANSWER_CELLS: Cell[] = [[0, 1], [0, 2], [1, 0], [1, 1], [2, 0]]
/** Sum covered by piece E at optimal placement. */
export const ANSWER_SUM    = ANSWER_CELLS.reduce((s, [r, c]) => s + GRID[r][c], 0)
// ANSWER_SUM = 6+7+9+5+2 = 29

// ── Beat types ────────────────────────────────────────────────────────────────

export type Pieces22PEPhase =
  | 'intro'     // show the grid
  | 'identify'  // identify high-value cells
  | 'place-e'   // overlay piece E on grid
  | 'sum'       // show the arithmetic
  | 'result'    // announce answer E

export interface Pieces22PEStep {
  phase: Pieces22PEPhase
  /** Show piece E overlaid on the grid? */
  showPlacement: boolean
  /** Show the sum arithmetic badge? */
  showSum: boolean
  caption: string
  hold: number
  result: boolean
}

export interface Pieces22PEStoryboard {
  steps: Pieces22PEStep[]
  finalIndex: number
}

// ── Builder ───────────────────────────────────────────────────────────────────

export function buildPieces22PESteps(lang: Lang): Pieces22PEStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // Cell labels for the covered numbers
  const cellNums = ANSWER_CELLS.map(([r, c]) => GRID[r][c])
  const arithmetic = cellNums.join(' + ') + ' = ' + ANSWER_SUM

  const steps: Pieces22PEStep[] = [
    // Beat 1 — intro: show the numbered grid
    {
      phase: 'intro',
      showPlacement: false,
      showSum: false,
      hold: 2000,
      result: false,
      caption: t(
        `The 3×3 grid holds numbers 1–9. Slide piece E (no rotation, no flip) to cover the largest possible sum.`,
        `Kotak 3×3 berisi angka 1–9. Geser potongan E (tanpa putaran, tanpa balik) untuk menutupi jumlah terbesar.`,
      ),
    },
    // Beat 2 — identify high-value region
    {
      phase: 'identify',
      showPlacement: false,
      showSum: false,
      hold: 1800,
      result: false,
      caption: t(
        `Look for the cluster of large numbers. The top-right area has 6, 7 and the left has 9 — placing piece E there will cover four of the five biggest numbers.`,
        `Cari kumpulan angka besar. Sudut kanan-atas ada 6, 7 dan kiri ada 9 — meletakkan potongan E di sana menutupi empat dari lima angka terbesar.`,
      ),
    },
    // Beat 3 — place piece E
    {
      phase: 'place-e',
      showPlacement: true,
      showSum: false,
      hold: 2000,
      result: false,
      caption: t(
        `Piece E placed here covers the cells highlighted in amber.`,
        `Potongan E ditempatkan di sini menutupi kotak-kotak yang disorot kuning.`,
      ),
    },
    // Beat 4 — show the sum arithmetic
    {
      phase: 'sum',
      showPlacement: true,
      showSum: true,
      hold: 2400,
      result: false,
      caption: t(
        `Sum = ${arithmetic}. This is the largest possible sum for any piece placement — answer E.`,
        `Jumlah = ${arithmetic}. Ini adalah jumlah terbesar yang mungkin untuk setiap penempatan potongan — jawaban E.`,
      ),
    },
    // Beat 5 — result
    {
      phase: 'result',
      showPlacement: true,
      showSum: true,
      hold: 0,
      result: true,
      caption: t(
        `Piece E covers ${arithmetic}. Answer: E.`,
        `Potongan E menutupi ${arithmetic}. Jawaban: E.`,
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
