// WMI-23F1A-Q10 (2023 Grade 1 Final) — "Which figure completes the jigsaw?"
//
// The board has a hole of 9 cells. Five candidate pieces are offered (A–E); the
// learner picks the one that exactly tiles the hole.  Answer: B.
//
// METHOD (deduce, one idea per beat):
//   1. Look at the empty hole and COUNT its cells → 9. The winning piece must
//      have exactly 9 cells, and its shape must match.
//   2. Pieces A, C, E each have only 8 cells — one short. 8 < 9, so none of them
//      can ever fill the hole, no matter how you turn them ✗.
//   3. Piece D has 9 cells (right count!) but the wrong shape — no turn lines it
//      up with the hole ✗.
//   4. Piece B has 9 cells AND, turned a quarter, its shape matches the hole
//      exactly → drop it in.  Answer = B.
//
// Pure builder: (lang) => storyboard. No Math.random / no Date — deterministic
// and SSR-safe. The hole-cell count and every piece's cell count come from the
// illustration's exports (HOLE_GRID_CELLS / PIECE_CELLS), never re-asserted here.

import type { Lang } from '../concepts/explainers/makeTenSteps'
import { HOLE_GRID_CELLS, PIECE_CELLS } from './Jigsaw23G1Illustration'

export const ANSWER = 'B'

/** Cells the hole needs to be filled — its own count drives every check. */
export const HOLE_SIZE = HOLE_GRID_CELLS.length // 9

/** Cell count for each candidate piece, read straight off the figure. */
export const PIECE_SIZE: Record<string, number> = Object.fromEntries(
  Object.entries(PIECE_CELLS).map(([k, cells]) => [k, cells.length]),
)

/** A candidate as shown on a beat: its letter, cell count, and verdict tag. */
export interface PieceView {
  /** Letter A–E. */
  id: string
  /** How many cells this piece has. */
  size: number
  /** 'too-few' (8 < 9) · 'wrong-shape' (9 cells, no fit) · 'fits' (the answer). */
  verdict: 'too-few' | 'wrong-shape' | 'fits'
}

export interface JigsawStep {
  /** Show the hole figure with this piece dropped in ('B' on the win beat). */
  showPiece: string | null
  /** Glow the empty hole + show its cell count (beat 1). */
  countHole: boolean
  /** Candidate pieces to lay out on this beat (with their verdicts). */
  pieces: PieceView[]
  /** True only on the final winning beat. */
  result: boolean
  /** True on a beat that rejects candidates (linger a touch longer). */
  reject: boolean
  caption: string
  hold: number
}

export interface JigsawStoryboard {
  answer: string
  holeSize: number
  steps: JigsawStep[]
  finalIndex: number
}

function view(id: string, verdict: PieceView['verdict']): PieceView {
  return { id, size: PIECE_SIZE[id], verdict }
}

export function buildJigsaw23G1Steps(lang: Lang): JigsawStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const tooFew = ['A', 'C', 'E'] // 8 cells each — one short
  const wrongShape = ['D'] // 9 cells but no turn fits

  const steps: JigsawStep[] = [
    // Beat 1 — look at the hole and count its cells.
    {
      showPiece: null,
      countHole: true,
      pieces: [],
      result: false,
      reject: false,
      hold: 2600,
      caption: t(
        `Count the empty hole: it is ${HOLE_SIZE} cells. The right piece must have exactly ${HOLE_SIZE} cells AND the same shape.`,
        `Hitung lubang kosongnya: ada ${HOLE_SIZE} kotak. Potongan yang tepat harus punya tepat ${HOLE_SIZE} kotak DAN bentuk yang sama.`,
      ),
    },
    // Beat 2 — A, C, E have only 8 cells. Too few.
    {
      showPiece: null,
      countHole: false,
      pieces: tooFew.map((id) => view(id, 'too-few')),
      result: false,
      reject: true,
      hold: 2200,
      caption: t(
        `A, C and E have only ${PIECE_SIZE.A} cells. ${PIECE_SIZE.A} < ${HOLE_SIZE}, so they can't fill the hole however you turn them ✗.`,
        `A, C, dan E hanya punya ${PIECE_SIZE.A} kotak. ${PIECE_SIZE.A} < ${HOLE_SIZE}, jadi tak bisa menutup lubang walau diputar ✗.`,
      ),
    },
    // Beat 3 — D has 9 cells but the wrong shape.
    {
      showPiece: null,
      countHole: false,
      pieces: wrongShape.map((id) => view(id, 'wrong-shape')),
      result: false,
      reject: true,
      hold: 2200,
      caption: t(
        `D has ${PIECE_SIZE.D} cells — the right number! But its shape is wrong: no turn lines it up with the hole ✗.`,
        `D punya ${PIECE_SIZE.D} kotak — jumlahnya pas! Tapi bentuknya salah: tak ada putaran yang cocok dengan lubang ✗.`,
      ),
    },
    // Beat 4 (result) — B has 9 cells and fits when turned. Drop it in.
    {
      showPiece: 'B',
      countHole: false,
      pieces: [view('B', 'fits')],
      result: true,
      reject: false,
      hold: 0,
      caption: t(
        `B has ${PIECE_SIZE.B} cells, and turned a quarter its shape matches the hole exactly. It fits → the answer is B.`,
        `B punya ${PIECE_SIZE.B} kotak, dan setelah diputar seperempat bentuknya pas dengan lubang. Cocok → jawabannya B.`,
      ),
    },
  ]

  return { answer: ANSWER, holeSize: HOLE_SIZE, steps, finalIndex: steps.length - 1 }
}
