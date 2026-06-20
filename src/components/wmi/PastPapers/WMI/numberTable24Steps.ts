// IKMC-19-PE-Q24 — storyboard for the number-table / sliding-window animation.
//
// Question: Peter chose a 2×2 square of cells whose four numbers sum to > 63.
// Which of 14, 15, 17, 18, 20 MUST be in the chosen square?  Answer: A (14).
//
// Grid (4 rows × 5 cols, numbers 1–20 left-to-right, top-to-bottom):
//   row 0:  1  2  3  4  5
//   row 1:  6  7  8  9 10
//   row 2: 11 12 13 14 15
//   row 3: 16 17 18 19 20
//
// Teaching walk — slide the 2×2 window over every possible position (12 total),
// show the sum, briefly flag the ones that exceed 63, then converge on the
// observation that 14 is the only answer-number present in EVERY valid block.
//
// Beats:
//   0. intro      — show the full table; explain the task.
//   1–4.  row 0   — blocks (0,0) (0,1) (0,2) (0,3); all sums ≤ 63.
//   5–8.  row 1   — blocks (1,0) (1,1) (1,2) (1,3); all sums ≤ 63.
//   9–10. row 2   — blocks (2,0) (2,1); sums 56 and 60, both ≤ 63.
//  11.    row 2   — block (2,2) = {13,14,18,19}, sum 64 → VALID ✓
//  12.    row 2   — block (2,3) = {14,15,19,20}, sum 68 → VALID ✓
//  13.    conclusion — both valid blocks contain 14 → answer A.
//
// Pure builder: (lang) → storyboard. No random, no Date, SSR-safe.

export type Lang = 'en' | 'id'

export interface TableBeat {
  /** 2×2 block top-left [row, col] to highlight in the grid, or null = no highlight. */
  highlight: [number, number] | null
  /** Sum of the highlighted block (displayed in the pill), or null to hide it. */
  sum: number | null
  /** True when this block's sum > 63 (the "valid" condition). */
  valid: boolean
  /** True only on the final result beat. */
  result: boolean
  /** Highlight the answer cell (14 = row 2, col 3) in green. */
  highlightAnswer: boolean
  /** Caption for the explanation box. */
  caption: string
  /** Auto-hold in ms (0 = final / manual-advance-only). */
  hold: number
}

export interface TableStoryboard {
  steps: TableBeat[]
  finalIndex: number
}

// All 2×2 top-left positions in reading order, with pre-computed sums.
// Derived from GRID data: sum of (r,c),(r,c+1),(r+1,c),(r+1,c+1).
const BLOCKS: ReadonlyArray<{ r: number; c: number; sum: number }> = [
  { r: 0, c: 0, sum: 16 },
  { r: 0, c: 1, sum: 20 },
  { r: 0, c: 2, sum: 24 },
  { r: 0, c: 3, sum: 28 },
  { r: 1, c: 0, sum: 36 },
  { r: 1, c: 1, sum: 40 },
  { r: 1, c: 2, sum: 44 },
  { r: 1, c: 3, sum: 48 },
  { r: 2, c: 0, sum: 56 },
  { r: 2, c: 1, sum: 60 },
  { r: 2, c: 2, sum: 64 }, // VALID
  { r: 2, c: 3, sum: 68 }, // VALID
]

export function buildNumberTable24Steps(lang: Lang): TableStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: TableBeat[] = []

  // Beat 0 — intro
  steps.push({
    highlight: null,
    sum: null,
    valid: false,
    result: false,
    highlightAnswer: false,
    hold: 2400,
    caption: t(
      "Peter picked a 2×2 square of four cells whose numbers add up to more than 63. Let's slide a 2×2 window over the table to find all valid squares!",
      'Peter memilih kotak 2×2 empat sel yang jumlah angkanya lebih dari 63. Ayo geser jendela 2×2 ke seluruh tabel untuk menemukan semua kotak yang valid!',
    ),
  })

  // Beats 1–12 — slide the window over all 12 positions
  for (const { r, c, sum } of BLOCKS) {
    const isValid = sum > 63
    // brief hold for non-valid blocks, slightly longer for valid ones
    const hold = isValid ? 2800 : 1400

    // Build a short block description  e.g. "top-left (2,3): 14+15+19+20 = 68"
    // (cells are 0-indexed; values = r*5+c+1, etc.)
    const v = (dr: number, dc: number) => (r + dr) * 5 + (c + dc) + 1

    const blockNums = `${v(0,0)}+${v(0,1)}+${v(1,0)}+${v(1,1)}`

    steps.push({
      highlight: [r, c],
      sum,
      valid: isValid,
      result: false,
      highlightAnswer: false,
      hold,
      caption: isValid
        ? t(
            `${blockNums} = ${sum} > 63 ✓  This square works!`,
            `${blockNums} = ${sum} > 63 ✓  Kotak ini valid!`,
          )
        : t(
            `${blockNums} = ${sum} ≤ 63  — not enough.`,
            `${blockNums} = ${sum} ≤ 63  — belum cukup.`,
          ),
    })
  }

  // Beat 13 — conclusion / answer
  steps.push({
    highlight: null,
    sum: null,
    valid: false,
    result: true,
    highlightAnswer: true,
    hold: 0,
    caption: t(
      'Only two squares qualify (sums 64 and 68). Both contain 14 — and 14 alone appears in every valid square. Answer: A (14).',
      'Hanya dua kotak yang memenuhi syarat (jumlah 64 dan 68). Keduanya mengandung 14 — dan hanya 14 yang ada di setiap kotak valid. Jawaban: A (14).',
    ),
  })

  return { steps, finalIndex: steps.length - 1 }
}
