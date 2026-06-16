// WMI-23F3A-Q11 (2023 Grade 3 Final) — clock face cut into four sector pieces.
//
// "A clock face (1–12) is broken into 4 sector pieces. Two of the pieces each
// have numbers that sum to 26. Find the difference between the sums of the
// OTHER two pieces."  Answer: D = 12.
//
// THE FOUR PIECES (cuts at 2|3, 4|5, 8|9, 10|11):
//   top    {11,12,1,2} = 26   (given)
//   bottom {5,6,7,8}   = 26   (given)
//   right  {3,4}       = 7
//   left   {9,10}      = 19
//
// METHOD (deduce, concrete arithmetic per beat — never jump to the answer):
//   1. All twelve numbers add to 1+2+…+12 = 78.
//   2. Confirm the top given piece: 11+12+1+2 = 26.
//   3. Confirm the bottom given piece: 5+6+7+8 = 26. Together 26+26 = 52.
//   4. So the OTHER two pieces together = 78 − 52 = 26. They are {3,4}=7 and
//      {9,10}=19.
//   5. Difference = 19 − 7 = 12 → choice D.
//
// Pure builder: (lang) => storyboard. No Math.random, no Date — SSR-safe and
// deterministic. The four piece sums and total are fixed by the figure.

import type { Lang } from '../concepts/explainers/makeTenSteps'

export type PieceId = 'top' | 'right' | 'bottom' | 'left'

/** The numbers carried by each sector piece, in clockwise reading order. */
export const PIECE_NUMBERS: Record<PieceId, number[]> = {
  top: [11, 12, 1, 2],
  right: [3, 4],
  bottom: [5, 6, 7, 8],
  left: [9, 10],
}

/** Sum of each piece (derived, not asserted). */
export const PIECE_SUM: Record<PieceId, number> = {
  top: 26,
  right: 7,
  bottom: 26,
  left: 19,
}

/** 1 + 2 + … + 12. */
export const TOTAL = 78
/** The final answer: |19 − 7|. */
export const ANSWER = 12

function sum(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0)
}

export interface ClockStep {
  /** Pieces to highlight (light up) on this beat. */
  highlight: PieceId[] | null
  /** Reveal the per-piece sums on the figure (final-stage beats). */
  showSums: boolean
  /**
   * Running-arithmetic line shown above the figure, e.g. "11 + 12 + 1 + 2 = 26".
   * null on beats with no arithmetic chip.
   */
  math: string | null
  /** Highlight tone: 'given' (blue) for the 26-pieces, 'leftover' (orange) for
   *  the unknown pair, 'win' (green) for the final difference. */
  tone: 'goal' | 'given' | 'leftover' | 'win'
  /** True only on the final winning beat (holds, hold 0). */
  result: boolean
  caption: string
  hold: number
}

export interface ClockStoryboard {
  answer: number
  total: number
  steps: ClockStep[]
  finalIndex: number
}

export function buildClockPiecesSteps(lang: Lang): ClockStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  // Pretty-print a piece's addition, e.g. "11 + 12 + 1 + 2 = 26".
  const adds = (id: PieceId) => `${PIECE_NUMBERS[id].join(' + ')} = ${PIECE_SUM[id]}`

  const steps: ClockStep[] = [
    // Beat 1 — goal + the whole-clock total 78.
    {
      highlight: null,
      showSums: false,
      math: `1 + 2 + … + 12 = ${TOTAL}`,
      tone: 'goal',
      result: false,
      hold: 2600,
      caption: t(
        `The whole clock 1–12 adds up to ${TOTAL}. Two pieces each make 26 — let's find the other two.`,
        `Seluruh jam 1–12 berjumlah ${TOTAL}. Dua potong masing-masing jadi 26 — cari dua potong lainnya.`,
      ),
    },
    // Beat 2 — confirm the TOP given piece sums to 26.
    {
      highlight: ['top'],
      showSums: false,
      math: adds('top'),
      tone: 'given',
      result: false,
      hold: 2300,
      caption: t(
        `Top piece {11, 12, 1, 2}: ${adds('top')}. That's one of the 26 pieces.`,
        `Potong atas {11, 12, 1, 2}: ${adds('top')}. Itu salah satu potong 26.`,
      ),
    },
    // Beat 3 — confirm the BOTTOM given piece sums to 26; the two givens make 52.
    {
      highlight: ['bottom'],
      showSums: false,
      math: adds('bottom'),
      tone: 'given',
      result: false,
      hold: 2300,
      caption: t(
        `Bottom piece {5, 6, 7, 8}: ${adds('bottom')}. The two 26-pieces together = 26 + 26 = 52.`,
        `Potong bawah {5, 6, 7, 8}: ${adds('bottom')}. Dua potong 26 bersama = 26 + 26 = 52.`,
      ),
    },
    // Beat 4 — the leftover two pieces together = 78 − 52 = 26, namely 7 and 19.
    {
      highlight: ['right', 'left'],
      showSums: true,
      math: `${TOTAL} − 52 = ${PIECE_SUM.right + PIECE_SUM.left}`,
      tone: 'leftover',
      result: false,
      hold: 2400,
      caption: t(
        `Other two pieces together = ${TOTAL} − 52 = 26. They are {3, 4} = ${PIECE_SUM.right} and {9, 10} = ${PIECE_SUM.left}.`,
        `Dua potong lainnya = ${TOTAL} − 52 = 26. Yaitu {3, 4} = ${PIECE_SUM.right} dan {9, 10} = ${PIECE_SUM.left}.`,
      ),
    },
    // Beat 5 — the difference 19 − 7 = 12 → D. Winner, holds.
    {
      highlight: ['right', 'left'],
      showSums: true,
      math: `${PIECE_SUM.left} − ${PIECE_SUM.right} = ${ANSWER}`,
      tone: 'win',
      result: true,
      hold: 0,
      caption: t(
        `Difference = ${PIECE_SUM.left} − ${PIECE_SUM.right} = ${ANSWER}. The answer is D = ${ANSWER}.`,
        `Selisih = ${PIECE_SUM.left} − ${PIECE_SUM.right} = ${ANSWER}. Jawabannya D = ${ANSWER}.`,
      ),
    },
  ]

  // Sanity (dev-time, harmless): piece sums and total agree with the figure.
  // (Not asserted at runtime to keep the builder pure & cheap.)
  void sum

  return { answer: ANSWER, total: TOTAL, steps, finalIndex: steps.length - 1 }
}
