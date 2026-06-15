import type { Lang } from '../concepts/explainers/makeTenSteps'
import { ANSWER, LEG_LEN, type Leg } from './P21G1Q12Illustration'

export type RoutePhase = 'show' | 'order' | 'judyHellen' | 'hellenAmy' | 'result'

export interface RouteStep {
  phase: RoutePhase
  litLegs: Leg[]
  runningTotal: number
  caption: string
  hold: number
  result: boolean
}

export interface RouteStoryboard {
  answer: number
  answerLetter: string
  steps: RouteStep[]
  finalIndex: number
}

export function buildP21G1Q12Steps(lang: Lang): RouteStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const jh = LEG_LEN.judyHellen // 5
  const ha = LEG_LEN.hellenAmy // 11

  const steps: RouteStep[] = [
    {
      phase: 'show',
      litLegs: [],
      runningTotal: 0,
      hold: 1700,
      result: false,
      caption: t(
        'The order is fixed: Judy → Hellen, then Hellen → Amy.',
        'Urutannya sudah pasti: Judy → Hellen, lalu Hellen → Amy.',
      ),
    },
    {
      phase: 'judyHellen',
      litLegs: ['judyHellen'],
      runningTotal: jh,
      hold: 1900,
      result: false,
      caption: t(`First leg, Judy → Hellen = ${jh} m.`, `Bagian pertama, Judy → Hellen = ${jh} m.`),
    },
    {
      phase: 'hellenAmy',
      litLegs: ['judyHellen', 'hellenAmy'],
      runningTotal: jh + ha,
      hold: 2000,
      result: false,
      caption: t(`Then Hellen → Amy = ${ha} m.`, `Lalu Hellen → Amy = ${ha} m.`),
    },
    {
      phase: 'order',
      litLegs: ['judyHellen', 'hellenAmy'],
      runningTotal: jh + ha,
      hold: 2000,
      result: false,
      caption: t(
        'The 9 m edge is never used — she does not walk Judy → Amy directly.',
        'Sisi 9 m tak terpakai — ia tidak berjalan Judy → Amy langsung.',
      ),
    },
    {
      phase: 'result',
      litLegs: ['judyHellen', 'hellenAmy'],
      runningTotal: ANSWER,
      hold: 0,
      result: true,
      caption: t(
        `${jh} + ${ha} = ${ANSWER} m in total — answer B.`,
        `${jh} + ${ha} = ${ANSWER} m seluruhnya — jawaban B.`,
      ),
    },
  ]

  return {
    answer: ANSWER,
    answerLetter: 'B',
    steps,
    finalIndex: steps.length - 1,
  }
}
