// WMI-23F3A-Q23 (2023 Grade 3 Final) — storyboard builder for the transversal
// divisible-by-4 explainer.
//
// THE PROBLEM
// In the 3×3 grid
//     Row1: 1 2 3
//     Row2: 8 9 4
//     Row3: 7 6 5
// pick three numbers, no two in the same row OR the same column, then form a
// 3-digit number from them. How many of those 3-digit numbers are divisible by 4?
// Answer: 8.
//
// METHOD (deduce, one transversal per beat with a running total)
//   1. Goal beat: state the goal + the divisibility-by-4 rule — a number is a
//      multiple of 4 exactly when its LAST TWO digits form a multiple of 4 (the
//      hundreds digit never matters), so we only check the back two places.
//   2. Picking one cell per row with three distinct columns gives exactly six
//      "transversals" (digit sets). Walk them one per beat:
//        {1,9,5} → all odd → no even last digit → 0 arrangements.
//        {1,4,6} → 164, 416 → 2.
//        {2,8,5} → 528, 852 → 2.
//        {2,4,7} → 472, 724 → 2.
//        {3,8,6} → 368, 836 → 2.
//        {3,9,7} → all odd → 0.
//      Each beat bumps a running counter 0 → 0 → 2 → 4 → 6 → 8 → 8.
//   3. Final beat: total = 8.
//
// Pure builder: (lang) => storyboard. No Math.random, no Date — SSR-safe and
// deterministic. The grid digits and (row,col) cells are echoed from the figure;
// nothing is re-asserted here.

export type Lang = 'en' | 'id'

/** Grid digits, indexed [row][col] (0-based), top→bottom, left→right. */
export const GRID: number[][] = [
  [1, 2, 3],
  [8, 9, 4],
  [7, 6, 5],
]

export const ANSWER = 8

type Cell = [number, number]

/** The six transversals as their (row,col) cells, in walking order. */
const TRANSVERSAL_CELLS: Cell[][] = [
  [
    [0, 0],
    [1, 1],
    [2, 2],
  ], // {1,9,5}
  [
    [0, 0],
    [1, 2],
    [2, 1],
  ], // {1,4,6}
  [
    [0, 1],
    [1, 0],
    [2, 2],
  ], // {2,8,5}
  [
    [0, 1],
    [1, 2],
    [2, 0],
  ], // {2,4,7}
  [
    [0, 2],
    [1, 0],
    [2, 1],
  ], // {3,8,6}
  [
    [0, 2],
    [1, 1],
    [2, 0],
  ], // {3,9,7}
]

/** Digit value at a cell. */
function digit([r, c]: Cell): number {
  return GRID[r][c]
}

/** All 6 orderings of a 3-element list (distinct values, so all distinct). */
function permute3(xs: number[]): number[][] {
  const [a, b, c] = xs
  return [
    [a, b, c],
    [a, c, b],
    [b, a, c],
    [b, c, a],
    [c, a, b],
    [c, b, a],
  ]
}

/** The 3-digit value of an ordered digit triple (hundreds, tens, units). */
function toNumber([h, t, u]: number[]): number {
  return 100 * h + 10 * t + u
}

/** Divisible by 4 ⟺ the last two digits form a multiple of 4. */
function divisibleBy4(perm: number[]): boolean {
  const lastTwo = 10 * perm[1] + perm[2]
  return lastTwo % 4 === 0
}

export interface TransversalStep {
  /** Cells to highlight on the grid this beat (null on the goal/final beat). */
  pick: Cell[] | null
  /** The transversal's three digits, sorted ascending (for the caption). */
  digits: number[]
  /** Every divisible-by-4 arrangement of this transversal. */
  hits: number[]
  /** Running count of divisible-by-4 numbers found so far (including this beat). */
  runningTotal: number
  /** True only on the final summary beat. */
  result: boolean
  caption: string
  hold: number
}

export interface TransversalStoryboard {
  answer: number
  steps: TransversalStep[]
  finalIndex: number
}

export function buildNumberGrid23G3Steps(lang: Lang): TransversalStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: TransversalStep[] = []

  // Beat 1 — goal + the divisible-by-4 rule.
  steps.push({
    pick: null,
    digits: [],
    hits: [],
    runningTotal: 0,
    result: false,
    hold: 2700,
    caption: t(
      'Pick one number per row, all in different columns, and make a 3-digit number. A number is a multiple of 4 when its LAST TWO digits make a multiple of 4 — so we only check the back two.',
      'Pilih satu angka tiap baris, semuanya beda kolom, lalu buat bilangan 3 digit. Sebuah bilangan kelipatan 4 jika DUA DIGIT TERAKHIR-nya kelipatan 4 — jadi cukup cek dua digit belakang.',
    ),
  })

  // One beat per transversal, bumping the running total.
  let runningTotal = 0
  for (const cells of TRANSVERSAL_CELLS) {
    const digits = cells.map(digit)
    const sorted = [...digits].sort((a, b) => a - b)
    const hits = permute3(digits).filter(divisibleBy4).map(toNumber).sort((a, b) => a - b)
    runningTotal += hits.length

    const setLabel = `{${sorted.join(', ')}}`
    const allOdd = digits.every((d) => d % 2 === 1)

    let caption: string
    if (allOdd) {
      // No even digit → no even last digit → never divisible by 4.
      caption = t(
        `${setLabel}: all three digits are odd, so the number can't even be even — 0 are multiples of 4. Total still ${runningTotal}.`,
        `${setLabel}: ketiga digit ganjil, jadi bilangannya tak bisa genap — 0 kelipatan 4. Total tetap ${runningTotal}.`,
      )
    } else {
      const hitList = hits.join(', ')
      caption = t(
        `${setLabel}: ${hitList} have last two digits that are multiples of 4 ✓ — that's ${hits.length} more. Total ${runningTotal}.`,
        `${setLabel}: ${hitList} punya dua digit terakhir kelipatan 4 ✓ — tambah ${hits.length}. Total ${runningTotal}.`,
      )
    }

    steps.push({
      pick: cells,
      digits: sorted,
      hits,
      runningTotal,
      result: false,
      // Zero-hit transversals linger a touch longer so the rejection reads.
      hold: hits.length === 0 ? 2300 : 2000,
      caption,
    })
  }

  // Final beat — the running total is the answer.
  steps.push({
    pick: null,
    digits: [],
    hits: [],
    runningTotal: ANSWER,
    result: true,
    hold: 0,
    caption: t(
      `Add them up: 0 + 2 + 2 + 2 + 2 + 0 = ${ANSWER}. So ${ANSWER} of the numbers are divisible by 4.`,
      `Jumlahkan: 0 + 2 + 2 + 2 + 2 + 0 = ${ANSWER}. Jadi ${ANSWER} bilangan habis dibagi 4.`,
    ),
  })

  return { answer: ANSWER, steps, finalIndex: steps.length - 1 }
}
