// Storyboard for WMI-25F3A-Q11 (2025 Grade-3 Final, answer E).
//
// Method the animation teaches: to pick the trio that tiles the 14-cell target,
//   1. count the target (14 cells),
//   2. add each option-trio's cells — drop any trio that does not total 14,
//   3. for the trios that DO total 14, try to actually tile by rotation —
//      two of them (B,D,E and A,C,E) can't, only A,B,D fits,
//   4. slide A, B, D into the target one board per beat → option E.
//
// Pure builder: (lang) => { steps, finalIndex }. No randomness, no Date.
// Geometry is verified by brute force in Assemble25G3Illustration's notes; the
// winning placement is translation-only (each board keeps its stem orientation):
//   A -> offset (row +1, col +0)
//   B -> offset (row +0, col +1)
//   D -> offset (row +0, col +3)
// which together cover all 14 target cells with no gap or overlap.

import { BOARDS, type Cell } from './Assemble25G3Illustration'

export type Placement = { label: string; cells: Cell[]; offset: [number, number] }

const cellsOf = (label: string): Cell[] =>
  BOARDS.find((b) => b.label === label)?.cells ?? []

/** Board cells shifted into target-grid coordinates by the winning offset. */
export function placedCells(label: string, offset: [number, number]): Cell[] {
  return cellsOf(label).map(([r, c]) => [r + offset[0], c + offset[1]] as Cell)
}

/** The three winning placements (translation only), in laying order. */
export const PLACEMENTS: Placement[] = [
  { label: 'A', cells: placedCells('A', [1, 0]), offset: [1, 0] },
  { label: 'B', cells: placedCells('B', [0, 1]), offset: [0, 1] },
  { label: 'D', cells: placedCells('D', [0, 3]), offset: [0, 3] },
]

export interface AssembleStep {
  /** How many of A,B,D are laid into the target so far (0..3). */
  laid: number
  /** Trio currently being weighed (for the eliminate beats), or null. */
  trying: string[] | null
  /** Whether this beat is the winning reveal. */
  result: boolean
  /** Whether this beat is a rejection (lingers a touch longer). */
  reject: boolean
  hold: number
  caption: string
}

export interface AssembleStoryboard {
  steps: AssembleStep[]
  finalIndex: number
  answer: string
}

const SIZE: Record<string, number> = { A: 5, B: 5, C: 4, D: 4, E: 5 }
const trioSum = (t: string[]) => t.reduce((s, b) => s + (SIZE[b] ?? 0), 0)

export function buildAssemble25G3Story(lang: 'en' | 'id' = 'en'): AssembleStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps: AssembleStep[] = []

  // 1. Goal: the target is 14 cells; we need a trio that totals 14 and tiles it.
  steps.push({
    laid: 0,
    trying: null,
    result: false,
    reject: false,
    hold: 2600,
    caption: t(
      'Goal: pick 3 boards that fill the target. First count it — 14 cells!',
      'Tujuan: pilih 3 papan yang mengisi target. Hitung dulu — 14 sel!',
    ),
  })

  // 2. Cell counts of each board, so we can add trios.
  steps.push({
    laid: 0,
    trying: null,
    result: false,
    reject: false,
    hold: 2600,
    caption: t(
      'Board sizes: A=5, B=5, C=4, D=4, E=5. Three boards must add up to 14.',
      'Ukuran papan: A=5, B=5, C=4, D=4, E=5. Tiga papan harus berjumlah 14.',
    ),
  })

  // 3. Eliminate the under-count trios (sum 13 ≠ 14).
  steps.push({
    laid: 0,
    trying: ['C', 'D', 'E'],
    result: false,
    reject: true,
    hold: 2200,
    caption: t(
      `C+D+E = 4+4+5 = ${trioSum(['C', 'D', 'E'])}. Too few — needs 14. ✗`,
      `C+D+E = 4+4+5 = ${trioSum(['C', 'D', 'E'])}. Kurang — perlu 14. ✗`,
    ),
  })
  steps.push({
    laid: 0,
    trying: ['B', 'C', 'D'],
    result: false,
    reject: true,
    hold: 2200,
    caption: t(
      `B+C+D = 5+4+4 = ${trioSum(['B', 'C', 'D'])}. Too few — needs 14. ✗`,
      `B+C+D = 5+4+4 = ${trioSum(['B', 'C', 'D'])}. Kurang — perlu 14. ✗`,
    ),
  })

  // 4. The 14-cell trios that still cannot tile (right count, wrong fit).
  steps.push({
    laid: 0,
    trying: ['B', 'D', 'E'],
    result: false,
    reject: true,
    hold: 2200,
    caption: t(
      'B+D+E = 14, but E and B leave a gap — they will not fit. ✗',
      'B+D+E = 14, tetapi E dan B menyisakan celah — tak bisa pas. ✗',
    ),
  })
  steps.push({
    laid: 0,
    trying: ['A', 'C', 'E'],
    result: false,
    reject: true,
    hold: 2200,
    caption: t(
      'A+C+E = 14, but they overlap or leave a hole — no fit. ✗',
      'A+C+E = 14, tetapi tumpang tindih atau berlubang — tak pas. ✗',
    ),
  })

  // 5. Try A, B, D — lay them in one per beat.
  steps.push({
    laid: 0,
    trying: ['A', 'B', 'D'],
    result: false,
    reject: false,
    hold: 2200,
    caption: t(
      'Last 14-trio: A, B, D. Slide them in and check the fit.',
      'Trio 14 terakhir: A, B, D. Geser masuk dan periksa kecocokan.',
    ),
  })
  steps.push({
    laid: 1,
    trying: ['A', 'B', 'D'],
    result: false,
    reject: false,
    hold: 1900,
    caption: t('Place A in the bottom-left corner. ✓', 'Letakkan A di pojok kiri bawah. ✓'),
  })
  steps.push({
    laid: 2,
    trying: ['A', 'B', 'D'],
    result: false,
    reject: false,
    hold: 1900,
    caption: t('Place B across the top middle. ✓', 'Letakkan B di tengah atas. ✓'),
  })
  steps.push({
    laid: 3,
    trying: ['A', 'B', 'D'],
    result: false,
    reject: false,
    hold: 1900,
    caption: t('Place D down the right edge — every cell is covered! ✓', 'Letakkan D di tepi kanan — semua sel tertutup! ✓'),
  })

  // 6. Winning reveal — option E is the trio A, B, D.
  steps.push({
    laid: 3,
    trying: ['A', 'B', 'D'],
    result: true,
    reject: false,
    hold: 0,
    caption: t('A, B, D tile it with no gaps → answer E.', 'A, B, D mengisi tanpa celah → jawaban E.'),
  })

  return { steps, finalIndex: steps.length - 1, answer: 'E' }
}
