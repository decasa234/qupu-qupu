// WMI-22F3A Q8 — Half-painted grid storyboard builder.
//
// The puzzle: a 3×3 grid where 8 cells are fixed; the mystery cell (2,1) must
// be found so that painted area = white area.
//
// Fixed-cell painted areas (row, col):
//   (0,0) top    = 0.5
//   (0,1) empty  = 0
//   (0,2) bottom = 0.5
//   (1,0) empty  = 0
//   (1,1) full   = 1
//   (1,2) full   = 1
//   (2,0) diag   = 0.5
//   (2,2) empty  = 0
//                ─────
//   Sum          = 3.5
//
// 9 cells total → painted = white means painted = 9 ÷ 2 = 4.5.
// Mystery must supply 4.5 − 3.5 = 1.0 → a full square → answer A.

import type { CellFill } from './HalfShadeGrid22G3Illustration'

export type Lang = 'en' | 'id'

// ---------------------------------------------------------------------------
// Region descriptors — each beat highlights one painted region
// ---------------------------------------------------------------------------

export type RegionKey =
  | 'intro'
  | 'top'
  | 'bottom'
  | 'fullMid'
  | 'fullRight'
  | 'diag'
  | 'goal'
  | 'missing'
  | 'checkB'
  | 'checkC'
  | 'checkD'
  | 'answer'

export interface HalfShadeStep {
  key: RegionKey
  /** The grid state to render at this beat. */
  grid: CellFill[][]
  /** Cells to visually highlight (row, col) pairs. */
  highlight: [number, number][]
  /** Running painted total shown so far (–1 = not shown). */
  runningTotal: number
  /** Whether this is the final result beat. */
  result: boolean
  /** Caption text for this beat. */
  caption: string
  /** How many ms to hold before auto-advancing (0 = last beat, stays). */
  hold: number
}

export interface HalfShadeStoryboard {
  steps: HalfShadeStep[]
  finalIndex: number
}

// ---------------------------------------------------------------------------
// Grid helpers
// ---------------------------------------------------------------------------

/** Stem grid with '?' at (2,1). */
const STEM: CellFill[][] = [
  ['top', 'empty', 'bottom'],
  ['empty', 'full', 'full'],
  ['diag', 'question', 'empty'],
]

/** Stem grid with a given candidate fill at (2,1). */
function withCandidate(fill: CellFill): CellFill[][] {
  return [
    ['top', 'empty', 'bottom'],
    ['empty', 'full', 'full'],
    ['diag', fill, 'empty'],
  ]
}

// ---------------------------------------------------------------------------
// Storyboard builder
// ---------------------------------------------------------------------------

export function buildHalfShade22G3Steps(lang: Lang): HalfShadeStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: HalfShadeStep[] = [
    // Beat 0 — introduce the puzzle
    {
      key: 'intro',
      grid: STEM,
      highlight: [],
      runningTotal: -1,
      result: false,
      caption: t(
        'This grid has 9 equal cells. Some are shaded purple. We need painted area = white area. Let\'s add up the shaded parts!',
        'Kisi ini punya 9 petak yang sama. Sebagian diarsir ungu. Kita ingin area warna = area putih. Yuk hitung bagian yang diarsir!',
      ),
      hold: 2600,
    },

    // Beat 1 — top-left cell: top half = 0.5
    {
      key: 'top',
      grid: STEM,
      highlight: [[0, 0]],
      runningTotal: 0.5,
      result: false,
      caption: t(
        'Top-left: the top half is shaded. That\'s ½ of a cell. Running total: 0.5.',
        'Kiri atas: setengah atas diarsir. Itu ½ petak. Total sementara: 0,5.',
      ),
      hold: 2200,
    },

    // Beat 2 — top-right cell: bottom half = 0.5
    {
      key: 'bottom',
      grid: STEM,
      highlight: [[0, 2]],
      runningTotal: 1.0,
      result: false,
      caption: t(
        'Top-right: the bottom half is shaded. Another ½. Running total: 0.5 + 0.5 = 1.0.',
        'Kanan atas: setengah bawah diarsir. Tambah ½ lagi. Total: 0,5 + 0,5 = 1,0.',
      ),
      hold: 2200,
    },

    // Beat 3 — centre cell: full = 1
    {
      key: 'fullMid',
      grid: STEM,
      highlight: [[1, 1]],
      runningTotal: 2.0,
      result: false,
      caption: t(
        'Middle centre: the whole cell is shaded — that\'s 1 full cell. Running total: 1.0 + 1.0 = 2.0.',
        'Tengah: seluruh petak diarsir — itu 1 petak penuh. Total: 1,0 + 1,0 = 2,0.',
      ),
      hold: 2200,
    },

    // Beat 4 — middle-right cell: full = 1
    {
      key: 'fullRight',
      grid: STEM,
      highlight: [[1, 2]],
      runningTotal: 3.0,
      result: false,
      caption: t(
        'Middle right: another full cell. Running total: 2.0 + 1.0 = 3.0.',
        'Kanan tengah: satu petak penuh lagi. Total: 2,0 + 1,0 = 3,0.',
      ),
      hold: 2200,
    },

    // Beat 5 — bottom-left cell: diagonal = 0.5
    {
      key: 'diag',
      grid: STEM,
      highlight: [[2, 0]],
      runningTotal: 3.5,
      result: false,
      caption: t(
        'Bottom-left: a diagonal triangle — exactly half the cell. Running total: 3.0 + 0.5 = 3.5.',
        'Kiri bawah: segitiga diagonal — tepat setengah petak. Total: 3,0 + 0,5 = 3,5.',
      ),
      hold: 2200,
    },

    // Beat 6 — compute the target
    {
      key: 'goal',
      grid: STEM,
      highlight: [],
      runningTotal: 3.5,
      result: false,
      caption: t(
        '9 cells total. Painted = white means each side = 9 ÷ 2 = 4.5 cells. We have 3.5 so far.',
        '9 petak total. Warna = putih artinya masing-masing = 9 ÷ 2 = 4,5 petak. Kita sudah punya 3,5.',
      ),
      hold: 2600,
    },

    // Beat 7 — compute what the "?" must be
    {
      key: 'missing',
      grid: STEM,
      highlight: [[2, 1]],
      runningTotal: 3.5,
      result: false,
      caption: t(
        'The "?" must make up 4.5 − 3.5 = 1.0 — a whole cell shaded! Which option is exactly 1 whole cell?',
        '"?" harus menambahkan 4,5 − 3,5 = 1,0 — satu petak penuh! Pilihan mana yang tepat 1 petak penuh?',
      ),
      hold: 2600,
    },

    // Beat 8 — check option B (diagonal = 0.5) — WRONG, lingers
    {
      key: 'checkB',
      grid: withCandidate('diag'),
      highlight: [[2, 1]],
      runningTotal: 4.0,
      result: false,
      caption: t(
        'Option B (diagonal): adds only 0.5 → total 4.0, not 4.5. Too small — cross it out!',
        'Pilihan B (diagonal): hanya tambah 0,5 → total 4,0, bukan 4,5. Terlalu kecil — coret!',
      ),
      hold: 2100,
    },

    // Beat 9 — check option C (empty = 0) — WRONG, lingers
    {
      key: 'checkC',
      grid: withCandidate('empty'),
      highlight: [[2, 1]],
      runningTotal: 3.5,
      result: false,
      caption: t(
        'Option C (empty): adds 0 → total stays 3.5, not 4.5. No colour at all — cross it out!',
        'Pilihan C (kosong): tambah 0 → total tetap 3,5, bukan 4,5. Tidak ada warna sama sekali — coret!',
      ),
      hold: 2100,
    },

    // Beat 10 — check option D (small square ≈ 0.25) — WRONG, lingers
    {
      key: 'checkD',
      grid: withCandidate('small'),
      highlight: [[2, 1]],
      runningTotal: 3.75,
      result: false,
      caption: t(
        'Option D (small square): adds about 0.25 → total ≈ 3.75, not 4.5. Still too small — cross it out!',
        'Pilihan D (kotak kecil): tambah sekitar 0,25 → total ≈ 3,75, bukan 4,5. Masih kurang — coret!',
      ),
      hold: 2100,
    },

    // Beat 11 — answer: option A (full = 1) — result, hold 0
    {
      key: 'answer',
      grid: withCandidate('full'),
      highlight: [[2, 1]],
      runningTotal: 4.5,
      result: true,
      caption: t(
        'Option A (full square): adds 1.0 → total = 3.5 + 1.0 = 4.5. Painted = white! Answer: A.',
        'Pilihan A (kotak penuh): tambah 1,0 → total = 3,5 + 1,0 = 4,5. Warna = putih! Jawaban: A.',
      ),
      hold: 0,
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
