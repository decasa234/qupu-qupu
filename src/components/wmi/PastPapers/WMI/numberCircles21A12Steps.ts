// Storyboard for SEAMO-21-A-Q12
// "Susan adds up 8 of the following numbers. Result is 400. Which did she leave out?"
//
// Numbers: 37, 29, 64, 75, 51, 78, 49, 16, 30  → total = 429
// Left out = 429 − 400 = 29  → Answer E
//
// Beat sequence:
//   1. Show all 9 circles (no highlight)
//   2. Sum all 9: 37+29+64+75+51+78+49+16+30 = 429
//   3. Susan got 400 with 8 numbers → gap = 429 − 400 = 29
//   4. Highlight 29 as the left-out number, reveal Answer E

import type { Lang } from '../../concepts/explainers/makeTenSteps'

export const TOTAL_ALL   = 429
export const SUSAN_SUM   = 400
export const LEFT_OUT    = 29
export const ANSWER_CODE = 'SEAMO-21-A-Q12'
export const ANSWER_CHOICE = 'E'

export type NodeHighlight = 'default' | 'amber' | 'green' | 'crossed'

export interface NumberCirclesStep {
  /** Per-node-id highlight override. Omit → 'default'. */
  nodeStates: Partial<Record<string, NodeHighlight>>
  /** Running sum label to show (empty string to hide). */
  runningSum: string
  caption: string
  hold: number
  result: boolean
}

export interface NumberCirclesStoryboard {
  steps: NumberCirclesStep[]
  finalIndex: number
}

export function buildNumberCircles21A12Steps(lang: Lang): NumberCirclesStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: NumberCirclesStep[] = [
    // Beat 0 — show all 9 circles
    {
      nodeStates: {},
      runningSum: '',
      hold: 1600,
      result: false,
      caption: t(
        '9 numbers are given. Susan adds only 8 of them.',
        'Ada 9 bilangan. Susan hanya menjumlahkan 8 di antaranya.',
      ),
    },
    // Beat 1 — sum all 9
    {
      nodeStates: {
        n37: 'amber', n29: 'amber', n64: 'amber',
        n75: 'amber', n51: 'amber', n78: 'amber',
        n49: 'amber', n16: 'amber', n30: 'amber',
      },
      runningSum: `37+29+64+75+51+78+49+16+30 = ${TOTAL_ALL}`,
      hold: 2200,
      result: false,
      caption: t(
        `Sum of ALL 9 numbers = ${TOTAL_ALL}.`,
        `Jumlah SEMUA 9 bilangan = ${TOTAL_ALL}.`,
      ),
    },
    // Beat 2 — show the gap
    {
      nodeStates: {
        n37: 'amber', n29: 'amber', n64: 'amber',
        n75: 'amber', n51: 'amber', n78: 'amber',
        n49: 'amber', n16: 'amber', n30: 'amber',
      },
      runningSum: `${TOTAL_ALL} − ${SUSAN_SUM} = ${LEFT_OUT}`,
      hold: 2200,
      result: false,
      caption: t(
        `Susan's sum is 400. Left out = ${TOTAL_ALL} − 400 = ${LEFT_OUT}.`,
        `Jumlah Susan adalah 400. Yang dihilangkan = ${TOTAL_ALL} − 400 = ${LEFT_OUT}.`,
      ),
    },
    // Beat 3 — highlight 29 as the answer
    {
      nodeStates: {
        n37: 'green', n29: 'crossed', n64: 'green',
        n75: 'green', n51: 'green',  n78: 'green',
        n49: 'green', n16: 'green',  n30: 'green',
      },
      runningSum: `${TOTAL_ALL} − ${SUSAN_SUM} = ${LEFT_OUT}`,
      hold: 0,
      result: true,
      caption: t(
        `Susan left out 29 — Answer E.`,
        `Susan menghilangkan 29 — Jawaban E.`,
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
