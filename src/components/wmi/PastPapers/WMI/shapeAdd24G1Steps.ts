// Storyboard for WMI-24F1A-Q15 (2024 Grade 1 Final) — "shape-addition trees".
//
// The figure is TWO little flow trees that both feed a shared total box of 20:
//
//   Left tree:   13                 Right tree:    ★
//               /  \                             /  \
//          [___]    7                          3    [___]
//               \  /                             \  /
//                20  <----- shared total ----->   20
//
// Each tree's TOP number plus its labelled bottom sibling makes the total 20.
//   Left :  13 + 7 = 20   (the worked example that fixes the total at 20)
//   Right:  ★  + 3 = 20   →   ★ = 20 − 3 = 17
//
// We DEDUCE one idea per beat, never jumping to the answer:
//   Beat 1 — read the LEFT branch 13 + 7 = 20: every branch totals 20.
//   Beat 2 — the RIGHT branch is ★ + 3, which must ALSO total 20.
//   Beat 3 (result) — so ★ = 20 − 3 = 17  →  reveal the ★ box.
//
// `revealStar` is the gate the bound primitive (ShapeAdd24G1) reads: false until
// the final beat, where it fills ★ = 17.
//
// Pure builder: (lang) => storyboard. No random / dates / state — SSR-safe.

import type { Lang } from '../concepts/explainers/makeTenSteps'

export type ShapeAdd24Phase = 'left' | 'right' | 'result'

export interface ShapeAdd24Step {
  phase: ShapeAdd24Phase
  /** Whether the bound ShapeAdd24G1 primitive should fill ★ on this beat. */
  revealStar: boolean
  /** Which tree this beat is working on: 'left' | 'right' | 'both' (result). */
  side: 'left' | 'right' | 'both'
  caption: string
  /** ms to linger before advancing; winner is the last beat with hold 0. */
  hold: number
  result: boolean
}

export interface ShapeAdd24Storyboard {
  /** The number that ★ stands for — the answer. */
  answer: number
  /** The shared total both branches add up to. */
  total: number
  /** The right branch's known addend (★ + this = total). */
  given: number
  steps: ShapeAdd24Step[]
  finalIndex: number
}

// The fixed givens of this question (mirror the boxes in the illustration).
const TOTAL = 20 //  every branch adds up to this
const GIVEN = 3 //   the right branch's labelled sibling (★ + 3 = 20)
const STAR = TOTAL - GIVEN // 17 = 20 − 3

export function buildShapeAdd24G1Steps(lang: Lang): ShapeAdd24Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: ShapeAdd24Step[] = [
    {
      // Beat 1 — the LEFT branch shows the rule: each branch totals 20.
      phase: 'left',
      revealStar: false,
      side: 'left',
      hold: 2100,
      result: false,
      caption: t(
        'Left branch: 13 + 7 = 20. So each branch adds up to 20.',
        'Cabang kiri: 13 + 7 = 20. Jadi tiap cabang berjumlah 20.',
      ),
    },
    {
      // Beat 2 — the RIGHT branch is ★ + 3 and must ALSO make 20.
      phase: 'right',
      revealStar: false,
      side: 'right',
      hold: 2100,
      result: false,
      caption: t(
        `Right branch: ★ + ${GIVEN} must also equal ${TOTAL}.`,
        `Cabang kanan: ★ + ${GIVEN} juga harus sama dengan ${TOTAL}.`,
      ),
    },
    {
      // Beat 3 (result) — subtract to land on ★, then fill the box.
      phase: 'result',
      revealStar: true,
      side: 'both',
      hold: 0,
      result: true,
      caption: t(
        `So ★ = ${TOTAL} − ${GIVEN} = ${STAR}.`,
        `Jadi ★ = ${TOTAL} − ${GIVEN} = ${STAR}.`,
      ),
    },
  ]

  return {
    answer: STAR,
    total: TOTAL,
    given: GIVEN,
    steps,
    finalIndex: steps.length - 1,
  }
}
