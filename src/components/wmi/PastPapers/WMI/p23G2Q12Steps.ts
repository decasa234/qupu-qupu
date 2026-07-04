import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { MIN_PIECES, SHADED_COUNT, TILING } from './P23G2Q12Illustration'

export type DominoPhase = 'show' | 'count' | 'pair' | 'fill' | 'result'

export interface DominoStep {
  phase: DominoPhase
  /** How many L-pieces of the verified tiling to overlay. */
  placed: number
  caption: string
  hold: number
  result: boolean
}

export interface DominoStoryboard {
  shadedCount: number
  minPieces: number
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
        'Every L-shaped piece covers exactly 3 squares.',
        'Setiap kepingan berbentuk L menutupi tepat 3 kotak.',
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
      placed: 2,
      hold: 2000,
      result: false,
      caption: t(
        'Lay L-pieces three squares at a time — no gaps, no overlaps.',
        'Pasang kepingan L tiga kotak sekaligus — tanpa celah, tanpa tumpang tindih.',
      ),
    },
    {
      phase: 'fill',
      placed: TILING.length,
      hold: 2100,
      result: false,
      caption: t(
        `The whole region fills with ${TILING.length} L-pieces.`,
        `Seluruh daerah terisi dengan ${TILING.length} kepingan L.`,
      ),
    },
    {
      phase: 'result',
      placed: TILING.length,
      hold: 0,
      result: true,
      caption: t(
        `${SHADED_COUNT} ÷ 3 = ${MIN_PIECES} pieces — answer B.`,
        `${SHADED_COUNT} ÷ 3 = ${MIN_PIECES} kepingan — jawaban B.`,
      ),
    },
  ]

  return {
    shadedCount: SHADED_COUNT,
    minPieces: MIN_PIECES,
    answer: 'B',
    steps,
    finalIndex: steps.length - 1,
  }
}
