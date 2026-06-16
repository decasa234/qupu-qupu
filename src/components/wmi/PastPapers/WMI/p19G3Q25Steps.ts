// Storyboard for the WMI-19P3A-Q25 explainer (4x4 equal-sum pieces, find A+B+C+D).
// Deterministic + language-parametric. The grid geometry / solution live in the
// illustration; these beats carry which cells to reveal, which piece to spotlight,
// captions and timing.

import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { Q25_PIECES, Q25_SOLUTION } from './P19G3Q25Illustration'

export type Q25Phase = 'rule' | 'pieceSum' | 'fill' | 'corners' | 'result'

export interface Q25Step {
  phase: Q25Phase
  /** Solved cells visible this beat: "row-col" -> digit. */
  solved: Record<string, number>
  /** Piece index to spotlight (or -1). */
  litPiece: number
  /** Tint + tag the four corner cells. */
  markCorners: boolean
  caption: string
  hold: number
  result: boolean
}

export interface Q25Storyboard {
  pieceSum: number
  cornerSum: number
  answer: string
  steps: Q25Step[]
  finalIndex: number
}

function solvedAfter(piecesShown: number): Record<string, number> {
  const out: Record<string, number> = {}
  for (let p = 0; p < piecesShown; p++) {
    for (const [r, c] of Q25_PIECES[p]) out[`${r}-${c}`] = Q25_SOLUTION[r][c]
  }
  return out
}

export function buildP19G3Q25Steps(lang: Lang): Q25Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const full = solvedAfter(Q25_PIECES.length)
  const A = Q25_SOLUTION[0][0]
  const B = Q25_SOLUTION[0][3]
  const C = Q25_SOLUTION[3][3]
  const D = Q25_SOLUTION[3][0]
  const cornerSum = A + B + C + D // 10
  const PIECE_SUM = 8

  const steps: Q25Step[] = [
    {
      phase: 'rule',
      solved: {},
      litPiece: -1,
      markCorners: false,
      hold: 1900,
      result: false,
      caption: t(
        'Every row and column must use 1, 2, 3, 4 once — like a mini-Sudoku.',
        'Tiap baris dan kolom pakai 1, 2, 3, 4 sekali — seperti Sudoku mini.',
      ),
    },
    {
      phase: 'pieceSum',
      solved: {},
      litPiece: -1,
      markCorners: false,
      hold: 2200,
      result: false,
      caption: t(
        `Whole grid = 4 × (1+2+3+4) = 40. Five equal pieces ⇒ each piece = 40 ÷ 5 = ${PIECE_SUM}.`,
        `Seluruh kotak = 4 × (1+2+3+4) = 40. Lima keping sama ⇒ tiap keping = 40 ÷ 5 = ${PIECE_SUM}.`,
      ),
    },
    {
      phase: 'fill',
      solved: solvedAfter(2),
      litPiece: 1,
      markCorners: false,
      hold: 2100,
      result: false,
      caption: t(
        `Use "each piece = ${PIECE_SUM}" plus no-repeats to fill, piece by piece.`,
        `Pakai "tiap keping = ${PIECE_SUM}" dan tanpa kembar untuk mengisi, keping demi keping.`,
      ),
    },
    {
      phase: 'fill',
      solved: full,
      litPiece: -1,
      markCorners: false,
      hold: 2100,
      result: false,
      caption: t(
        'The rules force the whole grid — every piece adds to 8.',
        'Aturannya memaksa seluruh kotak — tiap keping berjumlah 8.',
      ),
    },
    {
      phase: 'corners',
      solved: full,
      litPiece: -1,
      markCorners: true,
      hold: 2200,
      result: false,
      caption: t(
        `Read the corners: A = ${A}, B = ${B}, C = ${C}, D = ${D}.`,
        `Baca pojoknya: A = ${A}, B = ${B}, C = ${C}, D = ${D}.`,
      ),
    },
    {
      phase: 'result',
      solved: full,
      litPiece: -1,
      markCorners: true,
      hold: 0,
      result: true,
      caption: t(
        `A + B + C + D = ${A} + ${B} + ${C} + ${D} = ${cornerSum} — answer D.`,
        `A + B + C + D = ${A} + ${B} + ${C} + ${D} = ${cornerSum} — jawaban D.`,
      ),
    },
  ]

  return { pieceSum: PIECE_SUM, cornerSum, answer: 'D', steps, finalIndex: steps.length - 1 }
}
