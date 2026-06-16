import type { Lang } from '../concepts/explainers/makeTenSteps'
import type { CellMark } from './P24G1Q6Illustration'
import {
  ANSWER_DIGIT,
  GREEN_APPLE_RC,
  STRAWBERRY_RC,
  TARGET_RC,
} from './P24G1Q6Illustration'

// WMI-24P1A-Q6 (2024 Grade-1 Semifinal). A 3 × 3 grid:
//   pineapple 6 2 / 0 greenApple 5 / 4 7 strawberry
// "Which digit is to the LEFT of the strawberry AND BELOW the green apple?"
// Answer: B (7).
//
// The storyboard walks the method one idea per beat: state the goal, follow the
// "left of the strawberry" clue to the bottom-middle cell, follow the "below the
// green apple" clue to the SAME bottom-middle cell, see that both clues meet
// there, then read the digit (7) → option B. The target cell stays lit through
// the meet and the result.

export const ANSWER_LETTER = 'B'

export type GridPhase = 'goal' | 'strawberryClue' | 'appleClue' | 'meet' | 'result'

export interface GridStep {
  phase: GridPhase
  /** 3 × 3 marks passed straight to the Grid3x3 primitive. */
  marks: CellMark[][]
  caption: string
  hold: number
  result: boolean
}

export interface GridStoryboard {
  answerDigit: string
  answerLetter: string
  steps: GridStep[]
  finalIndex: number
}

/** Build a blank 3 × 3 mark grid. */
function blank(): CellMark[][] {
  return [
    ['none', 'none', 'none'],
    ['none', 'none', 'none'],
    ['none', 'none', 'none'],
  ]
}

export function buildP24G1Q6Steps(lang: Lang): GridStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const [sr, sc] = STRAWBERRY_RC // [2, 2]
  const [ar, ac] = GREEN_APPLE_RC // [1, 1]
  const [tr, tc] = TARGET_RC // [2, 1]

  const steps: GridStep[] = []

  // --- Beat 0: goal. Nothing marked. ---
  steps.push({
    phase: 'goal',
    marks: blank(),
    hold: 2100,
    result: false,
    caption: t(
      'Find the digit that is LEFT of the strawberry AND BELOW the green apple.',
      'Cari angka yang di KIRI stroberi DAN di BAWAH apel hijau.',
    ),
  })

  // --- Beat 1: strawberry clue. Mark the strawberry + the cell to its left. ---
  const m1 = blank()
  m1[sr][sc] = 'strawberryClue'
  m1[tr][tc] = 'strawberryClue'
  steps.push({
    phase: 'strawberryClue',
    marks: m1,
    hold: 2100,
    result: false,
    caption: t(
      'Left of the strawberry → the bottom-middle cell.',
      'Di kiri stroberi → kotak tengah-bawah.',
    ),
  })

  // --- Beat 2: green-apple clue. Mark the green apple + the cell below it. ---
  const m2 = blank()
  m2[ar][ac] = 'appleClue'
  m2[tr][tc] = 'appleClue'
  steps.push({
    phase: 'appleClue',
    marks: m2,
    hold: 2100,
    result: false,
    caption: t(
      'Below the green apple → the same bottom-middle cell.',
      'Di bawah apel hijau → kotak tengah-bawah yang sama.',
    ),
  })

  // --- Beat 3: the two clues meet on one cell. ---
  const m3 = blank()
  m3[sr][sc] = 'strawberryClue'
  m3[ar][ac] = 'appleClue'
  m3[tr][tc] = 'target'
  steps.push({
    phase: 'meet',
    marks: m3,
    hold: 2200,
    result: false,
    caption: t(
      'Both clues point to the same cell — the bottom middle.',
      'Kedua petunjuk menunjuk kotak yang sama — tengah-bawah.',
    ),
  })

  // --- Beat 4: result. Read the digit there. ---
  const m4 = blank()
  m4[tr][tc] = 'target'
  steps.push({
    phase: 'result',
    marks: m4,
    hold: 0,
    result: true,
    caption: t(
      `The digit there is ${ANSWER_DIGIT} — answer ${ANSWER_LETTER}.`,
      `Angka di sana adalah ${ANSWER_DIGIT} — jawaban ${ANSWER_LETTER}.`,
    ),
  })

  return {
    answerDigit: ANSWER_DIGIT,
    answerLetter: ANSWER_LETTER,
    steps,
    finalIndex: steps.length - 1,
  }
}
