import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { BOTTOM_TOTAL, TOP_TOTAL, TOTAL_CHERRIES } from './CherryCount20Illustration'

export type CherryPhase = 'show' | 'topCount' | 'topTotal' | 'bottomCount' | 'bottomTotal' | 'result'

export interface CherryStep {
  phase: CherryPhase
  /** Bunches counted so far (0..8, top row then bottom row). */
  countedBunches: number
  showTopTotal: boolean
  showBottomTotal: boolean
  caption: string
  hold: number
  result: boolean
}

export interface CherryStoryboard {
  topTotal: number
  bottomTotal: number
  answer: number
  steps: CherryStep[]
  finalIndex: number
}

export function buildCherryCount20Steps(lang: Lang): CherryStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CherryStep[] = [
    {
      phase: 'show',
      countedBunches: 0,
      showTopTotal: false,
      showBottomTotal: false,
      hold: 1700,
      result: false,
      caption: t(
        'Count bunch by bunch, not cherry by cherry.',
        'Hitung per tangkai, bukan per buah satu-satu.',
      ),
    },
    {
      phase: 'topCount',
      countedBunches: 4,
      showTopTotal: false,
      showBottomTotal: false,
      hold: 2000,
      result: false,
      caption: t('Top row: 2 + 3 + 2 + 3.', 'Baris atas: 2 + 3 + 2 + 3.'),
    },
    {
      phase: 'topTotal',
      countedBunches: 4,
      showTopTotal: true,
      showBottomTotal: false,
      hold: 1900,
      result: false,
      caption: t(
        `2 + 3 = 5, then + 2 = 7, then + 3 = ${TOP_TOTAL}. Top row = ${TOP_TOTAL}.`,
        `2 + 3 = 5, lalu + 2 = 7, lalu + 3 = ${TOP_TOTAL}. Baris atas = ${TOP_TOTAL}.`,
      ),
    },
    {
      phase: 'bottomCount',
      countedBunches: 8,
      showTopTotal: true,
      showBottomTotal: false,
      hold: 2000,
      result: false,
      caption: t('Bottom row: 3 + 2 + 2 + 2.', 'Baris bawah: 3 + 2 + 2 + 2.'),
    },
    {
      phase: 'bottomTotal',
      countedBunches: 8,
      showTopTotal: true,
      showBottomTotal: true,
      hold: 1900,
      result: false,
      caption: t(
        `3 + 2 = 5, then + 2 = 7, then + 2 = ${BOTTOM_TOTAL}. Bottom row = ${BOTTOM_TOTAL}.`,
        `3 + 2 = 5, lalu + 2 = 7, lalu + 2 = ${BOTTOM_TOTAL}. Baris bawah = ${BOTTOM_TOTAL}.`,
      ),
    },
    {
      phase: 'result',
      countedBunches: 8,
      showTopTotal: true,
      showBottomTotal: true,
      hold: 0,
      result: true,
      caption: t(
        `${TOP_TOTAL} + ${BOTTOM_TOTAL} = ${TOTAL_CHERRIES} cherries — answer B.`,
        `${TOP_TOTAL} + ${BOTTOM_TOTAL} = ${TOTAL_CHERRIES} ceri — jawaban B.`,
      ),
    },
  ]

  return {
    topTotal: TOP_TOTAL,
    bottomTotal: BOTTOM_TOTAL,
    answer: TOTAL_CHERRIES,
    steps,
    finalIndex: steps.length - 1,
  }
}
