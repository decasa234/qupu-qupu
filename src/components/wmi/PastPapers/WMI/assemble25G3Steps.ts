// Storyboard for WMI-25F3A-Q11 (2025 Grade-3 Final, answer E).
//
// Method the animation teaches: to pick the trio that tiles the 15-cell target,
//   1. count the target (15 cells),
//   2. add each option-trio's cells — drop any trio that does not total 15,
//   3. for the trios that DO total 15, try to actually tile by rotation —
//      B,D,E can't in any rotation; only A,B,D fits,
//   4. slide A, B, D into the target one board per beat → option E.
//
// Pure builder: (lang) => { steps, finalIndex }. No randomness, no Date.
// Geometry is verified by brute force in Assemble25G3Illustration's notes; the
// winning placement is translation-only (each board keeps its stem orientation):
//   A -> offset (row +0, col +0)
//   B -> offset (row +0, col +2)
//   D -> offset (row +0, col +3)
// which together cover all 15 target cells with no gap or overlap.

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
  { label: 'A', cells: placedCells('A', [0, 0]), offset: [0, 0] },
  { label: 'B', cells: placedCells('B', [0, 2]), offset: [0, 2] },
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

const SIZE: Record<string, number> = { A: 5, B: 5, C: 4, D: 5, E: 5 }
const trioSum = (t: string[]) => t.reduce((s, b) => s + (SIZE[b] ?? 0), 0)

export function buildAssemble25G3Story(lang: 'en' | 'id' = 'en'): AssembleStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const steps: AssembleStep[] = []

  // 1. Goal: the target is 15 cells; we need a trio that totals 15 and tiles it.
  steps.push({
    laid: 0,
    trying: null,
    result: false,
    reject: false,
    hold: 2600,
    caption: t(
      'Goal: pick 3 boards that fill the target. First count it — 15 cells!',
      'Tujuan: pilih 3 papan yang mengisi target. Hitung dulu — 15 sel!',
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
      'Board sizes: A=5, B=5, C=4, D=5, E=5. Three boards must add up to 15.',
      'Ukuran papan: A=5, B=5, C=4, D=5, E=5. Tiga papan harus berjumlah 15.',
    ),
  })

  // 3. Eliminate the under-count trios (sum 14 ≠ 15).
  steps.push({
    laid: 0,
    trying: ['C', 'D', 'E'],
    result: false,
    reject: true,
    hold: 2200,
    caption: t(
      `C+D+E = 4+5+5 = ${trioSum(['C', 'D', 'E'])}. Too few — needs 15. ✗`,
      `C+D+E = 4+5+5 = ${trioSum(['C', 'D', 'E'])}. Kurang — perlu 15. ✗`,
    ),
  })
  steps.push({
    laid: 0,
    trying: ['B', 'C', 'D'],
    result: false,
    reject: true,
    hold: 2200,
    caption: t(
      `B+C+D = 5+4+5 = ${trioSum(['B', 'C', 'D'])}. Too few — needs 15. ✗`,
      `B+C+D = 5+4+5 = ${trioSum(['B', 'C', 'D'])}. Kurang — perlu 15. ✗`,
    ),
  })

  steps.push({
    laid: 0,
    trying: ['A', 'C', 'E'],
    result: false,
    reject: true,
    hold: 2200,
    caption: t(
      `A+C+E = 5+4+5 = ${trioSum(['A', 'C', 'E'])}. Too few — needs 15. ✗`,
      `A+C+E = 5+4+5 = ${trioSum(['A', 'C', 'E'])}. Kurang — perlu 15. ✗`,
    ),
  })

  // 4. The other 15-cell trio still cannot tile (right count, wrong fit).
  steps.push({
    laid: 0,
    trying: ['B', 'D', 'E'],
    result: false,
    reject: true,
    hold: 2200,
    caption: t(
      'B+D+E = 15, but however you rotate them a gap is left — no fit. ✗',
      'B+D+E = 15, tetapi bagaimanapun diputar selalu ada celah — tak pas. ✗',
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
      'Last 15-trio: A, B, D. Slide them in and check the fit.',
      'Trio 15 terakhir: A, B, D. Geser masuk dan periksa kecocokan.',
    ),
  })
  steps.push({
    laid: 1,
    trying: ['A', 'B', 'D'],
    result: false,
    reject: false,
    hold: 1900,
    caption: t('Place A on the left end. ✓', 'Letakkan A di ujung kiri. ✓'),
  })
  steps.push({
    laid: 2,
    trying: ['A', 'B', 'D'],
    result: false,
    reject: false,
    hold: 1900,
    caption: t('Place B in the middle. ✓', 'Letakkan B di bagian tengah. ✓'),
  })
  steps.push({
    laid: 3,
    trying: ['A', 'B', 'D'],
    result: false,
    reject: false,
    hold: 1900,
    caption: t('Place D on the right, over the notch — every cell is covered! ✓', 'Letakkan D di kanan, menutup tonjolan — semua sel tertutup! ✓'),
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
