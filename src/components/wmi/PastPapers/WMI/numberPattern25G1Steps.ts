// WMI-25F1A-Q12 (2025 Grade 1 Final) — post-answer storyboard.
//
// Question: "What number replaces the '?' in 19, 3, 16, 4, 12, 6, ?"  Answer: 6.
// The numbers live in four diamonds, each holding a pair. The rule: the FIRST
// number of each pair minus the SECOND equals the FIRST number of the next pair:
//   19 − 3 = 16,   16 − 4 = 12,   12 − 6 = 6.   So ? = 6.
//
// One subtraction step per beat. We open by stating the goal, walk each
// subtraction (lighting that step on the figure), then land on the answer when
// the last result fills the "?".
//
// Pure builder — deterministic, SSR-safe: no random, no dates, no effects.

import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { CHAIN_STEPS, ANSWER } from './NumberPattern25G1Illustration'

export type NumberPattern25G1Phase = 'goal' | 'step' | 'result'

export interface NumberPattern25G1Step {
  phase: NumberPattern25G1Phase
  /** Subtraction step (0-based index into CHAIN_STEPS) lit on this beat, or null. */
  litStep: number | null
  /** Fill the "?" cell with the answer (only on the winning beat). */
  revealAnswer: boolean
  /** The running expression shown above the caption (e.g. "12 − 6 = 6"), or null. */
  expr: string | null
  caption: string
  hold: number
  result: boolean
}

export interface NumberPattern25G1Storyboard {
  answer: number
  steps: NumberPattern25G1Step[]
  finalIndex: number
}

export function buildNumberPattern25G1Steps(lang: Lang): NumberPattern25G1Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: NumberPattern25G1Step[] = [
    {
      phase: 'goal',
      litStep: null,
      revealAnswer: false,
      expr: null,
      hold: 1700,
      result: false,
      caption: t(
        'Look at each pair. The first number minus the second gives the next first number.',
        'Lihat tiap pasangan. Angka pertama dikurangi kedua menghasilkan angka pertama berikutnya.',
      ),
    },
  ]

  const lastIdx = CHAIN_STEPS.length - 1
  CHAIN_STEPS.forEach((s, i) => {
    const wins = i === lastIdx
    steps.push({
      phase: 'step',
      litStep: i,
      // The final step's result lands in the "?" cell — fill it in.
      revealAnswer: wins,
      expr: `${s.a} − ${s.b} = ${s.result}`,
      // The winning step lingers a touch so the "?" → answer reveal reads.
      hold: wins ? 2100 : 1800,
      result: false,
      caption: wins
        ? t(
            `${s.a} − ${s.b} = ${s.result}. That last answer fills the "?".`,
            `${s.a} − ${s.b} = ${s.result}. Hasil terakhir mengisi "?".`,
          )
        : t(
            `${s.a} − ${s.b} = ${s.result}, the next first number.`,
            `${s.a} − ${s.b} = ${s.result}, angka pertama berikutnya.`,
          ),
    })
  })

  steps.push({
    phase: 'result',
    litStep: lastIdx,
    revealAnswer: true,
    expr: `${CHAIN_STEPS[lastIdx].a} − ${CHAIN_STEPS[lastIdx].b} = ${ANSWER}`,
    hold: 0,
    result: true,
    caption: t(`So the "?" is ${ANSWER}.`, `Jadi "?" adalah ${ANSWER}.`),
  })

  return { answer: ANSWER, steps, finalIndex: steps.length - 1 }
}
