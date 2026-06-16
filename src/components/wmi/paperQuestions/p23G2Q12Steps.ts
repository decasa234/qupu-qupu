import type { Lang } from '../concepts/explainers/makeTenSteps'
import { MIN_DOMINOES, SHADED_COUNT, TILING } from './P23G2Q12Illustration'

export type DominoPhase = 'show' | 'count' | 'pair' | 'fill' | 'result'

export interface DominoStep {
  phase: DominoPhase
  /** How many dominoes of the verified tiling to overlay. */
  placed: number
  caption: string
  hold: number
  result: boolean
}

export interface DominoStoryboard {
  shadedCount: number
  minDominoes: number
  answer: string
  steps: DominoStep[]
  finalIndex: number
}

export function buildP23G2Q12Steps(lang: Lang): DominoStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: DominoStep[] = [
    {
      phase: 'show',
      placed: 0,
      hold: 1700,
      result: false,
      caption: t(
        'Every 1×2 domino covers exactly 2 squares.',
        'Setiap domino 1×2 menutupi tepat 2 kotak.',
      ),
    },
    {
      phase: 'count',
      placed: 0,
      hold: 2000,
      result: false,
      caption: t(
        `Count the shaded squares: 4 + 5 + 5 + 4 = ${SHADED_COUNT}.`,
        `Hitung kotak berwarna: 4 + 5 + 5 + 4 = ${SHADED_COUNT}.`,
      ),
    },
    {
      phase: 'pair',
      placed: 3,
      hold: 2000,
      result: false,
      caption: t(
        'Lay dominoes two squares at a time — no gaps, no overlaps.',
        'Pasang domino dua kotak sekaligus — tanpa celah, tanpa tumpang tindih.',
      ),
    },
    {
      phase: 'fill',
      placed: TILING.length,
      hold: 2100,
      result: false,
      caption: t(
        `The whole region fills with ${TILING.length} dominoes.`,
        `Seluruh daerah terisi dengan ${TILING.length} domino.`,
      ),
    },
    {
      phase: 'result',
      placed: TILING.length,
      hold: 0,
      result: true,
      caption: t(
        `${SHADED_COUNT} ÷ 2 = ${MIN_DOMINOES} dominoes — answer D.`,
        `${SHADED_COUNT} ÷ 2 = ${MIN_DOMINOES} domino — jawaban D.`,
      ),
    },
  ]

  return {
    shadedCount: SHADED_COUNT,
    minDominoes: MIN_DOMINOES,
    answer: 'D',
    steps,
    finalIndex: steps.length - 1,
  }
}
