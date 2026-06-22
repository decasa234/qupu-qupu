// IKMC-20-PE-Q3 (2020 Pre-Ecolier) — "How are the pieces arranged?"
//
// Nelly assembled 4 puzzle pieces into a kangaroo picture.  Each piece is
// numbered 1–4. The student must identify which 2×2 arrangement of the four
// numbers correctly places piece 4 top-left, piece 3 top-right, piece 2
// bottom-left, and piece 1 bottom-right.  Answer = A.
//
// STRATEGY (one idea per beat):
//   1. Look at each piece and note which part of the kangaroo it shows.
//      Piece 4 = upper body/pouch → top of kangaroo.
//      Piece 3 = upper back/side  → also top, on the right.
//      Piece 2 = head/large eye   → lower left (head hangs low on a kangaroo).
//      Piece 1 = legs/clawed feet → bottom right.
//   2. Map positions: top-left = 4, top-right = 3, bottom-left = 2, bottom-right = 1.
//   3. Scan the five options — only option A matches this arrangement.
//   4. Answer = A.
//
// Pure builder: (lang) => storyboard. No Math.random / no Date. SSR-safe.

import type { GridArrangement } from './Puzzle3PEIllustration'
import { ARRANGEMENTS } from './Puzzle3PEIllustration'

export type Lang = 'en' | 'id'

export interface PuzzleStep {
  /** Which arrangement grid to highlight in the explainer, null = source layout */
  highlightOption: 'A' | 'B' | 'C' | 'D' | 'E' | null
  /** Which cells to highlight [TL, TR, BL, BR] — true = highlighted */
  highlightCells: [boolean, boolean, boolean, boolean]
  /** Show the final winning option (answer A) */
  showAnswer: boolean
  /** True on the winning beat */
  result: boolean
  caption: string
  hold: number
}

export interface PuzzleStoryboard {
  answer: 'A'
  correctArrangement: GridArrangement
  steps: PuzzleStep[]
  finalIndex: number
}

export function buildPuzzle3PESteps(lang: Lang): PuzzleStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: PuzzleStep[] = [
    // Beat 1 — look at the top of the kangaroo: pieces 4 (upper body/pouch) and 3 (upper back)
    {
      highlightOption: null,
      highlightCells: [true, true, false, false],
      showAnswer: false,
      result: false,
      hold: 2400,
      caption: t(
        'Look at the top half of the kangaroo: piece 4 (upper body / pouch) is at the top-left, and piece 3 (upper back) is at the top-right.',
        'Lihat bagian atas kanguru: potongan 4 (badan atas / kantong) ada di kiri atas, dan potongan 3 (punggung atas) ada di kanan atas.',
      ),
    },
    // Beat 2 — look at the bottom: pieces 2 (head) and 1 (legs/feet)
    {
      highlightOption: null,
      highlightCells: [false, false, true, true],
      showAnswer: false,
      result: false,
      hold: 2400,
      caption: t(
        'Now the bottom half: piece 2 (head with the big eye) is at the bottom-left, and piece 1 (legs and claws) is at the bottom-right.',
        'Sekarang bagian bawah: potongan 2 (kepala dengan mata besar) ada di kiri bawah, dan potongan 1 (kaki dan cakar) ada di kanan bawah.',
      ),
    },
    // Beat 3 — compare to option A
    {
      highlightOption: 'A',
      highlightCells: [false, false, false, false],
      showAnswer: false,
      result: false,
      hold: 2200,
      caption: t(
        'Option A shows: top-left = 4, top-right = 3, bottom-left = 2, bottom-right = 1. That matches exactly!',
        'Pilihan A menunjukkan: kiri atas = 4, kanan atas = 3, kiri bawah = 2, kanan bawah = 1. Itu cocok persis!',
      ),
    },
    // Beat 4 (result) — confirm answer A
    {
      highlightOption: 'A',
      highlightCells: [true, true, true, true],
      showAnswer: true,
      result: true,
      hold: 0,
      caption: t(
        'The arrangement is: 4 (top-left), 3 (top-right), 2 (bottom-left), 1 (bottom-right). The answer is A.',
        'Susunannya: 4 (kiri atas), 3 (kanan atas), 2 (kiri bawah), 1 (kanan bawah). Jawabannya A.',
      ),
    },
  ]

  return {
    answer: 'A',
    correctArrangement: ARRANGEMENTS.A,
    steps,
    finalIndex: steps.length - 1,
  }
}
