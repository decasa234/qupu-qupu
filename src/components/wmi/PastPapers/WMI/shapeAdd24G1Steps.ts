// Storyboard for WMI-24F1A-Q15 (2024 Grade 1 Final) — "number-bond trees".
//
// The figure is TWO little number-bond trees whose EMPTY boxes feed a shared
// total box of 20 (only each tree's blank has an arrow into 20; 7 and 3 don't):
//
//   Left tree:   13                 Right tree:    ★
//               /  \                             /  \
//          [___]    7                          3    [___]
//             \                                      /
//              +------------>  20  <----------------+
//
// Each top number SPLITS into its two children; the two blanks add to 20:
//   Left :  13 = [box] + 7   →   left box = 13 − 7 = 6
//   Total:  6 + [right box] = 20   →   right box = 20 − 6 = 14
//   Right:  ★ = 3 + 14 = 17
//
// We DEDUCE one idea per beat, never jumping to the answer:
//   Beat 1 — the LEFT tree splits 13 into [box] + 7 → fill the left box with 6.
//   Beat 2 — the two blanks make 20 together → fill the right box with 20 − 6 = 14.
//   Beat 3 (result) — ★ splits into 3 + 14 → ★ = 17, reveal the ★ box.
//
// `revealLeftBox` / `revealRightBox` / `revealStar` are the gates the bound
// primitive (ShapeAdd24G1) reads: it drops 6, then 14, then 17 into the boxes.
//
// Pure builder: (lang) => storyboard. No random / dates / state — SSR-safe.

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export type ShapeAdd24Phase = 'left' | 'total' | 'result'

export interface ShapeAdd24Step {
  phase: ShapeAdd24Phase
  /** Whether the bound ShapeAdd24G1 primitive should fill the left box (6). */
  revealLeftBox: boolean
  /** Whether the bound ShapeAdd24G1 primitive should fill the right box (14). */
  revealRightBox: boolean
  /** Whether the bound ShapeAdd24G1 primitive should fill ★ on this beat. */
  revealStar: boolean
  /** Which tree this beat is working on: 'left' | 'right' | 'both'. */
  side: 'left' | 'right' | 'both'
  caption: string
  /** ms to linger before advancing; winner is the last beat with hold 0. */
  hold: number
  result: boolean
}

export interface ShapeAdd24Storyboard {
  /** The number that ★ stands for — the answer. */
  answer: number
  /** The shared total the two empty boxes add up to. */
  total: number
  /** The right tree's known addend (★ = this + rightBox). */
  given: number
  /** The deduced left blank: 13 − 7. */
  leftBox: number
  /** The deduced right blank: total − leftBox. */
  rightBox: number
  steps: ShapeAdd24Step[]
  finalIndex: number
}

// The fixed givens of this question (mirror the boxes in the illustration).
const TOTAL = 20 //  the two empty boxes add up to this
const GIVEN = 3 //   the right tree's labelled sibling (★ = 3 + right box)
const LEFT_BOX = 13 - 7 // 6 — the left tree's blank
const RIGHT_BOX = TOTAL - LEFT_BOX // 14 — the right tree's blank
const STAR = GIVEN + RIGHT_BOX // 17 = 3 + 14

export function buildShapeAdd24G1Steps(lang: Lang): ShapeAdd24Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: ShapeAdd24Step[] = [
    {
      // Beat 1 — the LEFT tree splits 13 into [box] + 7 → the box is 6.
      phase: 'left',
      revealLeftBox: true,
      revealRightBox: false,
      revealStar: false,
      side: 'left',
      hold: 2100,
      result: false,
      caption: t(
        `13 splits into the empty box and 7. So that box holds 13 − 7 = ${LEFT_BOX}.`,
        `13 terpecah menjadi kotak kosong dan 7. Jadi kotak itu berisi 13 − 7 = ${LEFT_BOX}.`,
      ),
    },
    {
      // Beat 2 — the two blanks add to the shared 20 → the right box is 14.
      phase: 'total',
      revealLeftBox: true,
      revealRightBox: true,
      revealStar: false,
      side: 'both',
      hold: 2100,
      result: false,
      caption: t(
        `The two empty boxes make ${TOTAL} together, so the right box holds ${TOTAL} − ${LEFT_BOX} = ${RIGHT_BOX}.`,
        `Kedua kotak kosong bersama membentuk ${TOTAL}, jadi kotak kanan berisi ${TOTAL} − ${LEFT_BOX} = ${RIGHT_BOX}.`,
      ),
    },
    {
      // Beat 3 (result) — ★ splits into 3 + 14, so ★ = 17 → fill the box.
      phase: 'result',
      revealLeftBox: true,
      revealRightBox: true,
      revealStar: true,
      side: 'right',
      hold: 0,
      result: true,
      caption: t(
        `★ splits into ${GIVEN} and ${RIGHT_BOX}, so ★ = ${GIVEN} + ${RIGHT_BOX} = ${STAR}.`,
        `★ terpecah menjadi ${GIVEN} dan ${RIGHT_BOX}, jadi ★ = ${GIVEN} + ${RIGHT_BOX} = ${STAR}.`,
      ),
    },
  ]

  return {
    answer: STAR,
    total: TOTAL,
    given: GIVEN,
    leftBox: LEFT_BOX,
    rightBox: RIGHT_BOX,
    steps,
    finalIndex: steps.length - 1,
  }
}
