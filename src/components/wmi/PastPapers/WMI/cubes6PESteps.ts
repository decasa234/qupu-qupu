import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { TOTAL_GREY, VISIBLE_GREY, HIDDEN_GREY } from './Cubes6PEIllustration'

export type Cubes6PEPhase = 'show' | 'reveal' | 'subtract' | 'result'

export interface Cubes6PEStep {
  phase: Cubes6PEPhase
  /** Highlight the 8 visible grey cubes (warm gold). */
  highlightVisible: boolean
  /** Dim the non-highlighted cubes so the highlighted set pops. */
  dimOthers: boolean
  caption: string
  hold: number
  result: boolean
}

export interface Cubes6PEStoryboard {
  steps: Cubes6PEStep[]
  finalIndex: number
}

/**
 * Beat storyboard for IKMC-20-PE-Q6.
 *
 * Strategy: Count visible − subtract from total.
 *   Beat 1 (show)     — plain figure, explain "14 grey cubes total".
 *   Beat 2 (reveal)   — highlight 8 visible grey cubes; dim the rest.
 *   Beat 3 (subtract) — show the maths: 14 − 8 = 6.
 *   Beat 4 (result)   — confirm answer D = 6.
 *
 * All numbers come from the illustration's exported constants so there is no drift.
 */
export function buildCubes6PESteps(lang: Lang): Cubes6PEStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Cubes6PEStep[] = [
    {
      phase: 'show',
      highlightVisible: false,
      dimOthers: false,
      hold: 1800,
      result: false,
      caption: t(
        `There are ${TOTAL_GREY} grey cubes in total — but some are hidden behind other cubes.`,
        `Ada ${TOTAL_GREY} kubus abu-abu seluruhnya — tapi beberapa tersembunyi di balik kubus lain.`,
      ),
    },
    {
      phase: 'reveal',
      highlightVisible: true,
      dimOthers: true,
      hold: 2200,
      result: false,
      caption: t(
        `Count the grey cubes you CAN see: ${VISIBLE_GREY} are visible from this view.`,
        `Hitung kubus abu-abu yang BISA kamu lihat: ${VISIBLE_GREY} terlihat dari sudut pandang ini.`,
      ),
    },
    {
      phase: 'subtract',
      highlightVisible: false,
      dimOthers: false,
      hold: 2000,
      result: false,
      caption: t(
        `Hidden grey cubes = total − visible = ${TOTAL_GREY} − ${VISIBLE_GREY} = ${HIDDEN_GREY}.`,
        `Kubus abu-abu tersembunyi = total − terlihat = ${TOTAL_GREY} − ${VISIBLE_GREY} = ${HIDDEN_GREY}.`,
      ),
    },
    {
      phase: 'result',
      highlightVisible: false,
      dimOthers: false,
      hold: 0,
      result: true,
      caption: t(
        `${HIDDEN_GREY} grey cubes cannot be seen — answer D.`,
        `${HIDDEN_GREY} kubus abu-abu tidak terlihat — jawaban D.`,
      ),
    },
  ]

  return { steps, finalIndex: steps.length - 1 }
}
