import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { ANSWER_LABEL, PILE_COUNT } from './P20G1Q6Illustration'

export type PilePhase = 'show' | 'count' | 'result'

export interface PileStep {
  phase: PilePhase
  /** Which option to ring (A–D) or null. */
  highlight: 'A' | 'B' | 'C' | 'D' | null
  showCount: boolean
  caption: string
  hold: number
  result: boolean
}

export interface PileStoryboard {
  answerLabel: 'A' | 'B' | 'C' | 'D'
  answerCount: number
  steps: PileStep[]
  finalIndex: number
}

const ORDER: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D']

export function buildP20G1Q6Steps(lang: Lang): PileStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: PileStep[] = []

  steps.push({
    phase: 'show',
    highlight: null,
    showCount: false,
    hold: 1700,
    result: false,
    caption: t(
      'Count each pile layer by layer — top cubes hide some below them.',
      'Hitung tiap tumpukan lapis demi lapis — kubus atas menutupi sebagian di bawahnya.',
    ),
  })

  for (const label of ORDER) {
    const n = PILE_COUNT[label]
    const isAns = label === ANSWER_LABEL
    steps.push({
      phase: 'count',
      highlight: label,
      showCount: true,
      hold: isAns ? 1900 : 1500,
      result: false,
      caption: isAns
        ? t(`Pile ${label} has ${n} cubes — that is 13!`, `Tumpukan ${label} ada ${n} kubus — itu 13!`)
        : t(`Pile ${label} has ${n} cubes — not 13.`, `Tumpukan ${label} ada ${n} kubus — bukan 13.`),
    })
  }

  steps.push({
    phase: 'result',
    highlight: ANSWER_LABEL,
    showCount: true,
    hold: 0,
    result: true,
    caption: t(
      `Only pile ${ANSWER_LABEL} has ${PILE_COUNT[ANSWER_LABEL]} cubes — answer ${ANSWER_LABEL}.`,
      `Hanya tumpukan ${ANSWER_LABEL} yang punya ${PILE_COUNT[ANSWER_LABEL]} kubus — jawaban ${ANSWER_LABEL}.`,
    ),
  })

  return {
    answerLabel: ANSWER_LABEL,
    answerCount: PILE_COUNT[ANSWER_LABEL],
    steps,
    finalIndex: steps.length - 1,
  }
}
