import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { LEFT_WEIGHTS, RIGHT_KNOWN, LEFT_TOTAL, RIGHT_KNOWN_TOTAL, UNKNOWN } from './BalanceScaleIllustration'

export type BalancePhase = 'show' | 'left' | 'right' | 'solve' | 'result'

export interface BalanceStep {
  phase: BalancePhase
  /** Which side to highlight (or 'solved' once ? is revealed). */
  highlight: 'left' | 'right' | 'solved' | null
  revealValue: boolean
  caption: string
  hold: number
  result: boolean
}

export interface BalanceStoryboard {
  leftTotal: number
  rightKnownTotal: number
  answer: number
  steps: BalanceStep[]
  finalIndex: number
}

export function buildBalanceScaleSteps(lang: Lang): BalanceStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const leftSum = LEFT_WEIGHTS.join(' + ') // "7 + 2 + 5"
  const rightKnownSum = RIGHT_KNOWN.join(' + ') // "3 + 8"

  const steps: BalanceStep[] = [
    {
      phase: 'show',
      highlight: null,
      revealValue: false,
      hold: 1600,
      result: false,
      caption: t(
        'A balanced scale: both sides must weigh the same.',
        'Timbangan seimbang: kedua sisi harus sama beratnya.',
      ),
    },
    {
      phase: 'left',
      highlight: 'left',
      revealValue: false,
      hold: 1800,
      result: false,
      caption: t(
        `Left side: ${leftSum} = ${LEFT_TOTAL}.`,
        `Sisi kiri: ${leftSum} = ${LEFT_TOTAL}.`,
      ),
    },
    {
      phase: 'right',
      highlight: 'right',
      revealValue: false,
      hold: 1800,
      result: false,
      caption: t(
        `Right side so far: ${rightKnownSum} = ${RIGHT_KNOWN_TOTAL}, plus the ? block.`,
        `Sisi kanan sejauh ini: ${rightKnownSum} = ${RIGHT_KNOWN_TOTAL}, ditambah blok ?.`,
      ),
    },
    {
      phase: 'solve',
      highlight: 'right',
      revealValue: false,
      hold: 1900,
      result: false,
      caption: t(
        `To balance, the right side must also be ${LEFT_TOTAL}. So ? = ${LEFT_TOTAL} − ${RIGHT_KNOWN_TOTAL}.`,
        `Agar seimbang, sisi kanan juga harus ${LEFT_TOTAL}. Jadi ? = ${LEFT_TOTAL} − ${RIGHT_KNOWN_TOTAL}.`,
      ),
    },
    {
      phase: 'result',
      highlight: 'solved',
      revealValue: true,
      hold: 0,
      result: true,
      caption: t(`So ? = ${UNKNOWN}.`, `Jadi ? = ${UNKNOWN}.`),
    },
  ]

  return {
    leftTotal: LEFT_TOTAL,
    rightKnownTotal: RIGHT_KNOWN_TOTAL,
    answer: UNKNOWN,
    steps,
    finalIndex: steps.length - 1,
  }
}
