import type { Lang } from '../../concepts/explainers/makeTenSteps'
import {
  ASK_UNKNOWN,
  DIA2,
  HEX2,
  HEX4,
  SQ3,
  ANSWER_SQUARES,
  SQUARES_PER_DIAMOND,
  type ShapeKind,
} from './BalanceSub19P1Illustration'

export type SubPhase = 'show' | 'given1' | 'given2' | 'oneDia' | 'oneDiaSquares' | 'scale' | 'result'

export interface SubStep {
  phase: SubPhase
  /** Glyphs to draw on the left pan of the working beam. */
  left: ShapeKind[]
  /** Glyphs to draw on the right pan of the working beam. */
  right: ShapeKind[]
  highlight: 'left' | 'right' | null
  solvedRight: boolean
  caption: string
  hold: number
  result: boolean
}

export interface SubStoryboard {
  squaresPerDiamond: number
  answer: number
  steps: SubStep[]
  finalIndex: number
}

// 1 diamond worth (drawn as a single diamond) and its square equivalent.
const DIA1: ShapeKind[] = ['diamond']
const HEX2_FROM_DIA: ShapeKind[] = ['hexagon', 'hexagon'] // 1 dia = 2 hex
const SQ3_FROM_DIA: ShapeKind[] = ['square', 'square', 'square'] // 1 dia = 3 sq
const SQ6: ShapeKind[] = Array.from({ length: ANSWER_SQUARES }, () => 'square') // 2 dia = 6 sq

export function buildBalanceSub19P1Steps(lang: Lang): SubStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: SubStep[] = [
    {
      phase: 'show',
      left: DIA2,
      right: ASK_UNKNOWN,
      highlight: null,
      solvedRight: false,
      hold: 1700,
      result: false,
      caption: t(
        'How many squares balance these 2 diamonds? Swap shapes step by step.',
        'Berapa persegi yang seimbang dengan 2 belah ketupat ini? Tukar bentuk langkah demi langkah.',
      ),
    },
    {
      phase: 'given2',
      left: DIA2,
      right: HEX4,
      highlight: 'right',
      solvedRight: false,
      hold: 1900,
      result: false,
      caption: t(
        'Given: 2 diamonds = 4 hexagons.',
        'Diketahui: 2 belah ketupat = 4 segi enam.',
      ),
    },
    {
      phase: 'oneDia',
      left: DIA1,
      right: HEX2_FROM_DIA,
      highlight: 'right',
      solvedRight: false,
      hold: 1900,
      result: false,
      caption: t(
        'Halve both sides: 1 diamond = 2 hexagons.',
        'Bagi dua kedua sisi: 1 belah ketupat = 2 segi enam.',
      ),
    },
    {
      phase: 'given1',
      left: HEX2,
      right: SQ3,
      highlight: 'left',
      solvedRight: false,
      hold: 1900,
      result: false,
      caption: t(
        'Given: 2 hexagons = 3 squares. So those 2 hexagons turn into 3 squares.',
        'Diketahui: 2 segi enam = 3 persegi. Jadi 2 segi enam itu menjadi 3 persegi.',
      ),
    },
    {
      phase: 'oneDiaSquares',
      left: DIA1,
      right: SQ3_FROM_DIA,
      highlight: 'right',
      solvedRight: false,
      hold: 2000,
      result: false,
      caption: t(
        `1 diamond = 2 hexagons = 3 squares. So 1 diamond = ${SQUARES_PER_DIAMOND} squares.`,
        `1 belah ketupat = 2 segi enam = 3 persegi. Jadi 1 belah ketupat = ${SQUARES_PER_DIAMOND} persegi.`,
      ),
    },
    {
      phase: 'scale',
      left: DIA2,
      right: SQ6,
      highlight: 'right',
      solvedRight: false,
      hold: 2000,
      result: false,
      caption: t(
        `2 diamonds = 2 × ${SQUARES_PER_DIAMOND} = ${ANSWER_SQUARES} squares.`,
        `2 belah ketupat = 2 × ${SQUARES_PER_DIAMOND} = ${ANSWER_SQUARES} persegi.`,
      ),
    },
    {
      phase: 'result',
      left: DIA2,
      right: SQ6,
      highlight: null,
      solvedRight: true,
      hold: 0,
      result: true,
      caption: t(
        `2 diamonds balance ${ANSWER_SQUARES} squares — a fixed number, so NOT indeterminate. Answer B.`,
        `2 belah ketupat seimbang dengan ${ANSWER_SQUARES} persegi — angka pasti, jadi BUKAN tidak dapat ditentukan. Jawaban B.`,
      ),
    },
  ]

  return {
    squaresPerDiamond: SQUARES_PER_DIAMOND,
    answer: ANSWER_SQUARES,
    steps,
    finalIndex: steps.length - 1,
  }
}
