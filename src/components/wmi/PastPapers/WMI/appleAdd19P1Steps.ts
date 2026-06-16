import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { COMPLETE_TEN, LEFTOVER, LEFT_COUNT, RIGHT_COUNT, TOTAL } from './AppleAdd19P1Illustration'

export type AppleAddPhase = 'show' | 'bridge' | 'ten' | 'result'

export interface AppleAddStep {
  phase: AppleAddPhase
  leftCount: number
  rightCount: number
  showBridge: boolean
  showAnswer: boolean
  leftLabel: string | null
  rightLabel: string | null
  caption: string
  hold: number
  result: boolean
}

export interface AppleAddStoryboard {
  left: number
  right: number
  answer: number
  steps: AppleAddStep[]
  finalIndex: number
}

export function buildAppleAdd19P1Steps(lang: Lang): AppleAddStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: AppleAddStep[] = [
    {
      phase: 'show',
      leftCount: LEFT_COUNT,
      rightCount: RIGHT_COUNT,
      showBridge: false,
      showAnswer: false,
      leftLabel: null,
      rightLabel: null,
      hold: 1700,
      result: false,
      caption: t(
        `${LEFT_COUNT} apples and ${RIGHT_COUNT} apples. ${LEFT_COUNT} only needs ${COMPLETE_TEN} more to make ten.`,
        `${LEFT_COUNT} apel dan ${RIGHT_COUNT} apel. ${LEFT_COUNT} cuma butuh ${COMPLETE_TEN} lagi untuk jadi sepuluh.`,
      ),
    },
    {
      phase: 'bridge',
      leftCount: LEFT_COUNT,
      rightCount: RIGHT_COUNT,
      showBridge: true,
      showAnswer: false,
      leftLabel: null,
      rightLabel: null,
      hold: 1900,
      result: false,
      caption: t(
        `Move ${COMPLETE_TEN} apple over: split the ${RIGHT_COUNT} into ${COMPLETE_TEN} and ${LEFTOVER}.`,
        `Pindahkan ${COMPLETE_TEN} apel: pecah ${RIGHT_COUNT} jadi ${COMPLETE_TEN} dan ${LEFTOVER}.`,
      ),
    },
    {
      phase: 'ten',
      leftCount: 10,
      rightCount: LEFTOVER,
      showBridge: false,
      showAnswer: false,
      leftLabel: '10',
      rightLabel: String(LEFTOVER),
      hold: 1900,
      result: false,
      caption: t(
        `Now the left box is a full 10, and ${LEFTOVER} apples are left.`,
        `Sekarang kotak kiri penuh jadi 10, dan sisa ${LEFTOVER} apel.`,
      ),
    },
    {
      phase: 'result',
      leftCount: 10,
      rightCount: LEFTOVER,
      showBridge: false,
      showAnswer: true,
      leftLabel: '10',
      rightLabel: String(LEFTOVER),
      hold: 0,
      result: true,
      caption: t(
        `10 + ${LEFTOVER} = ${TOTAL} apples — answer A.`,
        `10 + ${LEFTOVER} = ${TOTAL} apel — jawaban A.`,
      ),
    },
  ]

  return {
    left: LEFT_COUNT,
    right: RIGHT_COUNT,
    answer: TOTAL,
    steps,
    finalIndex: steps.length - 1,
  }
}
