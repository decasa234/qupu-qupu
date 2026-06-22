// IKMC-22-EC-Q14 — "Joanna folds the number square twice as shown. Then she
// punches a hole through the black spot. Which numbers does she also punch?"
// Answer B: 14, 17, 20, 23.
//
// Storyboard for the post-answer animation (4 beats, one action per beat):
//   beat 0 — flat 6×6 grid with fold guide lines (stage 0). State the plan.
//   beat 1 — fold 1: top 3 rows fold DOWN over bottom 3 rows (stage 1).
//            A 3×6 half-sheet; vertical fold guide visible.
//   beat 2 — fold 2: left 3 cols fold RIGHT over right 3 cols (stage 2).
//            A 3×3 quarter-sheet; punch hole dot shown at position (row 0, col 1).
//   beat 3 — RESULT (stage 3): flat grid returns with all 4 hit cells highlighted
//            in amber — 14, 17, 20, 23 — and the answer stated.
//
// Pure builder: (lang) => storyboard. No Math.random, no Date — SSR-safe and
// deterministic. All numbers read from the illustration's exports; never asserted.

import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { PUNCHED_NUMBERS, type FoldSquareStage } from './FoldSquare14ECIllustration'

export type FoldPhase = 'plan' | 'fold' | 'result'

export interface FoldSquareStep {
  /** Which stage the FoldSquare14EC primitive should render. */
  stage: FoldSquareStage
  phase: FoldPhase
  caption: string
  /** Auto-advance hold time in ms. */
  hold: number
  /** True only on the final answer-reveal beat. */
  result: boolean
}

export interface FoldSquareStoryboard {
  /** The four punched numbers as strings, in order. */
  punched: readonly string[]
  /** The answer string for the caption, e.g. "14, 17, 20, 23". */
  answerStr: string
  steps: FoldSquareStep[]
  finalIndex: number
}

export function buildFoldSquare14ECSteps(lang: Lang): FoldSquareStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const punched = PUNCHED_NUMBERS.map(String)
  const answerStr = punched.join(', ')

  const steps: FoldSquareStep[] = [
    {
      stage: 0,
      phase: 'plan',
      hold: 2400,
      result: false,
      caption: t(
        'The 6×6 grid has two fold lines: red (top down) and green (left right). ' +
          'Folding twice makes a 3×3 quarter, then punch a hole — find where it lands on the full grid.',
        'Kotak 6×6 punya dua garis lipatan: merah (atas ke bawah) dan hijau (kiri ke kanan). ' +
          'Melipat dua kali menghasilkan seperempat kotak 3×3, lalu lubangi — temukan posisinya di kotak penuh.',
      ),
    },
    {
      stage: 1,
      phase: 'fold',
      hold: 2600,
      result: false,
      caption: t(
        'Fold 1: top half folds DOWN over the bottom half along the red line. ' +
          'Rows 1–3 now lie on top of rows 4–6. A 3-row strip remains.',
        'Lipatan 1: separuh atas dilipat KE BAWAH menutupi separuh bawah mengikuti garis merah. ' +
          'Baris 1–3 sekarang di atas baris 4–6. Tersisa selembar dengan 3 baris.',
      ),
    },
    {
      stage: 2,
      phase: 'fold',
      hold: 2600,
      result: false,
      caption: t(
        'Fold 2: left half folds to the RIGHT along the green line. ' +
          'A 3×3 quarter remains. The hole (black dot) is at row 1, column 2 of this quarter.',
        'Lipatan 2: separuh kiri dilipat ke KANAN mengikuti garis hijau. ' +
          'Tersisa seperempat kotak 3×3. Lubang (titik hitam) ada di baris 1, kolom 2 dari kuarter ini.',
      ),
    },
    {
      stage: 3,
      phase: 'result',
      hold: 0,
      result: true,
      caption: t(
        `Unfolding reveals 4 holes: ${answerStr}. Answer B.`,
        `Membuka lipatan mengungkap 4 lubang: ${answerStr}. Jawaban B.`,
      ),
    },
  ]

  return { punched, answerStr, steps, finalIndex: steps.length - 1 }
}
