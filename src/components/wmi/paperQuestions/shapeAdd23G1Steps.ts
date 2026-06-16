// Storyboard for WMI-23F1A-Q16 (2023 Grade 1 Final) — "shape-addition chain".
//
// The figure shows four addition rows; the same shape stands for the same number:
//   1)  2 + 3 = 5            (just confirms the rule is "add")
//   2)  7 + 4 = ●            → ● = 11
//   3)  ● + 6 = ■            → 11 + 6 = ■ = 17
//   4)  ■ + ★ = 25           → 17 + ★ = 25 → ★ = 25 − 17 = 8
//
// We DEDUCE one shape per beat, top to bottom, each beat carrying the concrete
// arithmetic. `revealUpTo` is the gate the bound primitive (ShapeAdd23G1) reads:
//   0 → nothing solved · 2 → ● known · 3 → ●,■ known · 4 → all three known.
// (There is no revealUpTo = 1: row 1 has no unknown, so it never fills a shape.)
//
// Pure builder: (lang) => storyboard. No random / dates / state — SSR-safe.

import type { Lang } from '../concepts/explainers/makeTenSteps'

export type ShapeAdd23Phase = 'setup' | 'circle' | 'square' | 'star' | 'result'

export interface ShapeAdd23Step {
  phase: ShapeAdd23Phase
  /** What the bound ShapeAdd23G1 primitive should reveal on this beat. */
  revealUpTo: 0 | 2 | 3 | 4
  /** Which row (0-based) this beat is working on, or null on setup. */
  activeRow: number | null
  caption: string
  /** ms to linger before advancing; winner is the last beat with hold 0. */
  hold: number
  result: boolean
}

export interface ShapeAdd23Storyboard {
  /** The number that ★ stands for — the answer. */
  answer: number
  circle: number
  square: number
  steps: ShapeAdd23Step[]
  finalIndex: number
}

// The fixed givens of this question (mirrors ROWS in the illustration).
const CIRCLE = 11 // 7 + 4
const SQUARE = 17 // ● + 6 = 11 + 6
const STAR = 8 //   ■ + ★ = 25  →  25 − 17

export function buildShapeAdd23G1Steps(lang: Lang): ShapeAdd23Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: ShapeAdd23Step[] = [
    {
      // Beat 1 — state the goal and read row 1 as proof the rule is "add".
      phase: 'setup',
      revealUpTo: 0,
      activeRow: 0,
      hold: 2000,
      result: false,
      caption: t(
        'Same shape = same number. Row 1 checks the rule: 2 + 3 = 5. Now find ★.',
        'Bentuk sama = angka sama. Baris 1 menguji aturannya: 2 + 3 = 5. Sekarang cari ★.',
      ),
    },
    {
      // Beat 2 — row 2 gives ● directly.
      phase: 'circle',
      revealUpTo: 2,
      activeRow: 1,
      hold: 2100,
      result: false,
      caption: t(
        `Row 2: 7 + 4 = ●, so ● = ${CIRCLE}.`,
        `Baris 2: 7 + 4 = ●, jadi ● = ${CIRCLE}.`,
      ),
    },
    {
      // Beat 3 — plug ● into row 3 to get ■.
      phase: 'square',
      revealUpTo: 3,
      activeRow: 2,
      hold: 2100,
      result: false,
      caption: t(
        `Row 3: ● + 6 = ■, so ${CIRCLE} + 6 = ■ = ${SQUARE}.`,
        `Baris 3: ● + 6 = ■, jadi ${CIRCLE} + 6 = ■ = ${SQUARE}.`,
      ),
    },
    {
      // Beat 4 — plug ■ into row 4 and subtract to land on ★.
      phase: 'star',
      revealUpTo: 4,
      activeRow: 3,
      hold: 0,
      result: true,
      caption: t(
        `Row 4: ■ + ★ = 25, so ${SQUARE} + ★ = 25 → ★ = 25 − ${SQUARE} = ${STAR}.`,
        `Baris 4: ■ + ★ = 25, jadi ${SQUARE} + ★ = 25 → ★ = 25 − ${SQUARE} = ${STAR}.`,
      ),
    },
  ]

  return {
    answer: STAR,
    circle: CIRCLE,
    square: SQUARE,
    steps,
    finalIndex: steps.length - 1,
  }
}
