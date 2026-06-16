import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { COLS, DEPTH, HIDDEN_CUBES, ROWS, TOTAL_CUBES, VISIBLE_CUBES } from './P25G2Q2Illustration'

export type CubePhase = 'show' | 'dims' | 'visible' | 'reveal' | 'result'

export interface CubeStep {
  phase: CubePhase
  revealHidden: boolean
  countLayers: number
  caption: string
  hold: number
  result: boolean
}

export interface CubeStoryboard {
  total: number
  visible: number
  hidden: number
  answer: string
  steps: CubeStep[]
  finalIndex: number
}

export function buildP25G2Q2Steps(lang: Lang): CubeStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CubeStep[] = [
    {
      phase: 'show',
      revealHidden: false,
      countLayers: 0,
      hold: 1700,
      result: false,
      caption: t(
        'Same-size cubes packed into one solid block.',
        'Kubus seukuran disusun menjadi satu balok padat.',
      ),
    },
    {
      phase: 'dims',
      revealHidden: false,
      countLayers: ROWS,
      hold: 2000,
      result: false,
      caption: t(
        `It is a tidy box: ${COLS} across, ${ROWS} high, ${DEPTH} deep.`,
        `Bentuknya balok rapi: ${COLS} ke samping, ${ROWS} tinggi, ${DEPTH} dalam.`,
      ),
    },
    {
      phase: 'visible',
      revealHidden: false,
      countLayers: 0,
      hold: 2100,
      result: false,
      caption: t(
        `Count only the cubes you SEE on the shell: ${VISIBLE_CUBES}. (That is the trap.)`,
        `Hitung hanya kubus yang TERLIHAT di permukaan: ${VISIBLE_CUBES}. (Ini jebakannya.)`,
      ),
    },
    {
      phase: 'reveal',
      revealHidden: true,
      countLayers: 0,
      hold: 2200,
      result: false,
      caption: t(
        `${HIDDEN_CUBES} more cubes hide in the back-bottom row — they hold the block up.`,
        `Ada ${HIDDEN_CUBES} kubus lagi tersembunyi di baris belakang-bawah — penopang balok.`,
      ),
    },
    {
      phase: 'result',
      revealHidden: true,
      countLayers: 0,
      hold: 0,
      result: true,
      caption: t(
        `${VISIBLE_CUBES} + ${HIDDEN_CUBES} = ${TOTAL_CUBES} cubes — answer B.`,
        `${VISIBLE_CUBES} + ${HIDDEN_CUBES} = ${TOTAL_CUBES} kubus — jawaban B.`,
      ),
    },
  ]

  return {
    total: TOTAL_CUBES,
    visible: VISIBLE_CUBES,
    hidden: HIDDEN_CUBES,
    answer: 'B',
    steps,
    finalIndex: steps.length - 1,
  }
}
