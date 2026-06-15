import type { Lang } from '../concepts/explainers/makeTenSteps'
import { CUBE_TOTAL, REGION_COUNTS } from './P21G2Q10Illustration'

const [BASE, LEFT, RIGHT] = REGION_COUNTS // [24, 2, 3]

export type BlockPhase = 'show' | 'base' | 'left' | 'right' | 'result'

export interface BlockStep {
  phase: BlockPhase
  /** How many counting regions are lit (0..3): base → left tower → right tower. */
  litRegions: number
  caption: string
  hold: number
  result: boolean
}

export interface BlockStoryboard {
  base: number
  left: number
  right: number
  answer: number
  steps: BlockStep[]
  finalIndex: number
}

export function buildP21G2Q10Steps(lang: Lang): BlockStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: BlockStep[] = [
    {
      phase: 'show',
      litRegions: 0,
      hold: 1700,
      result: false,
      caption: t(
        'Count whole columns, not single cubes — split it into a block plus two towers.',
        'Hitung per kolom, bukan per kubus — bagi jadi satu balok besar dan dua menara.',
      ),
    },
    {
      phase: 'base',
      litRegions: 1,
      hold: 2100,
      result: false,
      caption: t(
        `The solid block: 4 wide × 2 deep × 3 tall = ${BASE} cubes.`,
        `Balok padat: 4 lebar × 2 dalam × 3 tinggi = ${BASE} kubus.`,
      ),
    },
    {
      phase: 'left',
      litRegions: 2,
      hold: 1900,
      result: false,
      caption: t(
        `Left tower: ${LEFT} more cubes on top. ${BASE} + ${LEFT} = ${BASE + LEFT}.`,
        `Menara kiri: ${LEFT} kubus lagi di atas. ${BASE} + ${LEFT} = ${BASE + LEFT}.`,
      ),
    },
    {
      phase: 'right',
      litRegions: 3,
      hold: 1900,
      result: false,
      caption: t(
        `Right tower: ${RIGHT} more cubes. ${BASE + LEFT} + ${RIGHT} = ${CUBE_TOTAL}.`,
        `Menara kanan: ${RIGHT} kubus lagi. ${BASE + LEFT} + ${RIGHT} = ${CUBE_TOTAL}.`,
      ),
    },
    {
      phase: 'result',
      litRegions: 3,
      hold: 0,
      result: true,
      caption: t(
        `${BASE} + ${LEFT} + ${RIGHT} = ${CUBE_TOTAL} blocks — answer C.`,
        `${BASE} + ${LEFT} + ${RIGHT} = ${CUBE_TOTAL} balok — jawaban C.`,
      ),
    },
  ]

  return {
    base: BASE,
    left: LEFT,
    right: RIGHT,
    answer: CUBE_TOTAL,
    steps,
    finalIndex: steps.length - 1,
  }
}
