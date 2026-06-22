// IKMC-23-PE-Q16 — "Max wants to complete the puzzle shown."
//
// The 4×4 board has a 9-cell gap. Five candidate pieces are available;
// the learner picks the three that together tile the gap exactly. Answer: A.
//
// METHOD (deduce, one idea per beat):
//   1. Look at the gap and count its cells → 9.
//      The right combination must total exactly 9 cells.
//   2. Count each option:
//        A: P1(4) + P2(4) + P3(1) = 9 ✓
//        B: P1(4) + P2(4) + P4(2) = 10 ✗  (one cell too many)
//        C: P1(4) + P2(4) + P5(3) = 11 ✗  (two cells too many)
//        D: P3(1) + P4(2) + P5(3) = 6  ✗  (three cells short)
//        E: P1(4) + P4(2) + P5(3) = 9  ✓  (right count—but wrong shape)
//   3. Both A and E sum to 9. Check shape: only option A's pieces, when
//      placed and rotated, fill the gap without overlap or leftover space.
//   4. Answer = A.
//
// Pure builder: (lang) => storyboard. No Math.random / no Date — deterministic
// and SSR-safe. Counts come from PIECE_CELLS so they can never drift.

import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { GAP_CELL_LIST, PIECE_CELLS, OPTION_PIECES } from './PuzzleComplete16PEIllustration'

export const ANSWER = 'A'
export const GAP_SIZE = GAP_CELL_LIST.length // 9

/** Cell count for each piece, read off PIECE_CELLS so it never drifts. */
export const PIECE_SIZE: Record<string, number> = Object.fromEntries(
  Object.entries(PIECE_CELLS).map(([k, cells]) => [k, cells.length]),
)

/** Total cells for an option's piece set. */
export function optionTotal(label: string): number {
  return OPTION_PIECES[label].reduce((s, id) => s + PIECE_SIZE[id], 0)
}

export type OptionVerdict = 'count-wrong' | 'shape-wrong' | 'correct'

export interface OptionView {
  label: string
  total: number
  verdict: OptionVerdict
}

export interface PuzzleStep {
  /** Show the filled-in board on the winning beat. */
  showPiece: string | null
  /** Highlight the gap cell count (beat 1). */
  countGap: boolean
  /** Which options to display on this beat. */
  options: OptionView[]
  /** True only on the final winning beat. */
  result: boolean
  /** True on a beat that rejects one or more options. */
  reject: boolean
  caption: string
  hold: number
}

export interface PuzzleStoryboard {
  answer: string
  gapSize: number
  steps: PuzzleStep[]
  finalIndex: number
}

function view(label: string, verdict: OptionVerdict): OptionView {
  return { label, total: optionTotal(label), verdict }
}

export function buildPuzzleComplete16PESteps(lang: Lang): PuzzleStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: PuzzleStep[] = [
    // Beat 1 — count the gap cells
    {
      showPiece: null,
      countGap: true,
      options: [],
      result: false,
      reject: false,
      hold: 2600,
      caption: t(
        `Count the empty gap: it has ${GAP_SIZE} cells. The right option must total exactly ${GAP_SIZE} cells AND fit the shape.`,
        `Hitung ruang kosong: ada ${GAP_SIZE} kotak. Pilihan yang benar harus berjumlah tepat ${GAP_SIZE} kotak DAN pas bentuknya.`,
      ),
    },
    // Beat 2 — options with wrong totals: B (10), C (11), D (6) are rejected
    {
      showPiece: null,
      countGap: false,
      options: ['B', 'C', 'D'].map((l) => view(l, 'count-wrong')),
      result: false,
      reject: true,
      hold: 2400,
      caption: t(
        `B has ${optionTotal('B')}, C has ${optionTotal('C')}, D has ${optionTotal('D')} — none equal ${GAP_SIZE}. They can't fill the gap ✗.`,
        `B punya ${optionTotal('B')}, C punya ${optionTotal('C')}, D punya ${optionTotal('D')} — tak ada yang sama dengan ${GAP_SIZE}. Tak bisa mengisi celah ✗.`,
      ),
    },
    // Beat 3 — A and E both sum to 9; check shape — E doesn't fit
    {
      showPiece: null,
      countGap: false,
      options: [view('A', 'correct'), view('E', 'shape-wrong')],
      result: false,
      reject: true,
      hold: 2400,
      caption: t(
        `A (${optionTotal('A')}) and E (${optionTotal('E')}) both total ${GAP_SIZE}. But E's pieces leave a gap uncovered when you try to fit them — wrong shape ✗.`,
        `A (${optionTotal('A')}) dan E (${optionTotal('E')}) sama-sama berjumlah ${GAP_SIZE}. Tapi potongan E meninggalkan celah saat dicoba — bentuknya salah ✗.`,
      ),
    },
    // Beat 4 (result) — A fills the gap perfectly
    {
      showPiece: ANSWER,
      countGap: false,
      options: [view('A', 'correct')],
      result: true,
      reject: false,
      hold: 0,
      caption: t(
        `Option A: ${OPTION_PIECES.A.join(', ')} → ${optionTotal('A')} cells, and they fit the gap exactly. The answer is A ✓.`,
        `Pilihan A: ${OPTION_PIECES.A.join(', ')} → ${optionTotal('A')} kotak, dan pas mengisi celah. Jawabannya A ✓.`,
      ),
    },
  ]

  return { answer: ANSWER, gapSize: GAP_SIZE, steps, finalIndex: steps.length - 1 }
}
