/**
 * Storyboard builder for IKMC-22-EC-Q6 — Anna's number jigsaw puzzle.
 *
 * Rule: two squares that share an edge must NOT have the same number.
 * The L-shaped hole is at (row 2, col 2) for the top cell and
 * (row 3, cols 2–4) for the three bottom cells.
 *
 * Strategy: for each hole cell read the fixed neighbours, then check each option.
 * D (top=2, L=3, M=1, R=4) is the unique piece with no conflicts.
 *
 * Animation beats:
 *   0. Show the board — state the rule.
 *   1. Highlight the top hole cell; list its neighbours (5, 5, 3).
 *   2. Highlight the bottom-left hole cell (r3,c2); neighbours (1, 2-from-above, 4-below).
 *   3. Highlight the bottom-middle hole cell (r3,c3); neighbours (5-above, 2-below).
 *   4. Highlight the bottom-right hole cell (r3,c4); neighbours (2-above, 5-below, 3-right).
 *   5. Drop piece D in; show it fits.
 *   6. Result — answer D.
 *
 * Pure function — no Math.random, no Date. SSR-safe.
 */

import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { JIGSAW_PIECES, JIGSAW_ANSWER, type JigsawPiece } from './Jigsaw6ECIllustration'

export const JIGSAW_6EC_ANSWER = JIGSAW_ANSWER   // 'D'

export type Jigsaw6ECPhase =
  | 'start'
  | 'top-cell'
  | 'bottom-left'
  | 'bottom-mid'
  | 'bottom-right'
  | 'check'
  | 'result'

export interface Jigsaw6ECStep {
  phase: Jigsaw6ECPhase
  /** When set, fill the hole with this piece (cumulative — once filled, stays). */
  filled?: JigsawPiece | null
  /**
   * Hole cell to visually focus on this beat.
   * 'top' = (r2,c2), 'bl' = (r3,c2), 'bm' = (r3,c3), 'br' = (r3,c4).
   */
  focus?: 'top' | 'bl' | 'bm' | 'br' | null
  caption: string
  hold: number
  result: boolean
}

export interface Jigsaw6ECStoryboard {
  answer: string
  steps: Jigsaw6ECStep[]
  finalIndex: number
}

// Fixed neighbours for each hole cell (read from the source grid in the illustration).
// Used to generate accurate captions without duplication.
const NEIGHBOURS = {
  top: { left: 5, right: 5, above: 3 },           // (r2,c2) — no below (bottom cells share edge)
  bl:  { left: 1, below: 4 },                      // (r3,c2) — above shared with top piece
  bm:  { above: 5, below: 2 },                     // (r3,c3) — left/right shared with bl/br
  br:  { above: 2, below: 5, right: 3 },           // (r3,c4)
}

const D = JIGSAW_PIECES['D']   // { top:2, L:3, M:1, R:4 }

export function buildJigsaw6ECSteps(lang: Lang): Jigsaw6ECStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const n = NEIGHBOURS

  const steps: Jigsaw6ECStep[] = [
    {
      phase: 'start',
      filled: null,
      focus: null,
      hold: 2600,
      result: false,
      caption: t(
        'Rule: squares that share an edge must NOT have the same number. ' +
        'Find the piece (A–E) that fills the L-shaped hole without breaking the rule.',
        'Aturan: kotak yang berbagi sisi tidak boleh memiliki angka yang sama. ' +
        'Temukan potongan (A–E) yang mengisi lubang berbentuk L tanpa melanggar aturan.',
      ),
    },
    {
      phase: 'top-cell',
      filled: null,
      focus: 'top',
      hold: 2400,
      result: false,
      caption: t(
        `Top hole cell (row 3, col 3): its fixed neighbours are ${n.top.above} above, ${n.top.left} left, ${n.top.right} right. ` +
        `The piece's top number must differ from all three — so not 3, 5, or 5. ` +
        `Options C and D both have top = 2. ✓`,
        `Kotak lubang atas (baris 3, kolom 3): tetangganya adalah ${n.top.above} di atas, ${n.top.left} di kiri, ${n.top.right} di kanan. ` +
        `Angka atas potongan harus berbeda dari ketiganya — bukan 3, 5, atau 5. ` +
        `Pilihan C dan D keduanya punya atas = 2. ✓`,
      ),
    },
    {
      phase: 'bottom-left',
      filled: null,
      focus: 'bl',
      hold: 2400,
      result: false,
      caption: t(
        `Bottom-left hole cell (row 4, col 3): fixed neighbours are ${n.bl.left} (left) and ${n.bl.below} (below); ` +
        `its top will be shared with the piece's top cell (2). Must not be 1, 4, or 2. ` +
        `C has L = 4 — conflict with below (4)! D has L = 3 — no conflict. ✓ C is eliminated.`,
        `Kotak lubang bawah-kiri (baris 4, kolom 3): tetangga tetap: ${n.bl.left} (kiri) dan ${n.bl.below} (bawah); ` +
        `atasnya berbagi dengan kotak atas potongan (2). Tidak boleh 1, 4, atau 2. ` +
        `C punya L = 4 — bentrok dengan bawah (4)! D punya L = 3 — tidak bentrok. ✓ C tersingkir.`,
      ),
    },
    {
      phase: 'bottom-mid',
      filled: null,
      focus: 'bm',
      hold: 2200,
      result: false,
      caption: t(
        `Bottom-middle hole cell (row 4, col 4): fixed neighbours are ${n.bm.above} (above) and ${n.bm.below} (below). ` +
        `D has M = 1 — not 5 ✓, not 2 ✓. Also left = L = 3 ≠ 1 ✓, right = R = 4 ≠ 1 ✓.`,
        `Kotak lubang bawah-tengah (baris 4, kolom 4): tetangga tetap: ${n.bm.above} (atas) dan ${n.bm.below} (bawah). ` +
        `D punya M = 1 — bukan 5 ✓, bukan 2 ✓. Juga kiri = L = 3 ≠ 1 ✓, kanan = R = 4 ≠ 1 ✓.`,
      ),
    },
    {
      phase: 'bottom-right',
      filled: null,
      focus: 'br',
      hold: 2200,
      result: false,
      caption: t(
        `Bottom-right hole cell (row 4, col 5): fixed neighbours are ${n.br.above} (above), ${n.br.below} (below), ${n.br.right} (right). ` +
        `D has R = 4 — not 2 ✓, not 5 ✓, not 3 ✓. All edges clear!`,
        `Kotak lubang bawah-kanan (baris 4, kolom 5): tetangga tetap: ${n.br.above} (atas), ${n.br.below} (bawah), ${n.br.right} (kanan). ` +
        `D punya R = 4 — bukan 2 ✓, bukan 5 ✓, bukan 3 ✓. Semua sisi aman!`,
      ),
    },
    {
      phase: 'check',
      filled: D,
      focus: null,
      hold: 2400,
      result: false,
      caption: t(
        `Piece D (top = 2, row = 3 1 4) fits perfectly: every shared edge has DIFFERENT numbers. This is the answer.`,
        `Potongan D (atas = 2, baris = 3 1 4) cocok sempurna: setiap sisi yang berdekatan memiliki angka BERBEDA. Inilah jawabannya.`,
      ),
    },
    {
      phase: 'result',
      filled: D,
      focus: null,
      hold: 0,
      result: true,
      caption: t(
        `Answer: D`,
        `Jawaban: D`,
      ),
    },
  ]

  return {
    answer: JIGSAW_6EC_ANSWER,
    steps,
    finalIndex: steps.length - 1,
  }
}
