import type { Lang } from '../../concepts/explainers/makeTenSteps'
import {
  BIG_PERIM_CM,
  BIG_SIDE_CM,
  SMALL_SIDE_CM,
  SQUARES_ALONG_DIAGONAL,
} from './P21G2Q14Illustration'

export type Q14Phase = 'show' | 'span' | 'side' | 'perimeter' | 'result'

export interface Q14Step {
  phase: Q14Phase
  traceSide: boolean
  highlightDiagonal: boolean
  showBigSide: boolean
  caption: string
  hold: number
  result: boolean
}

export interface Q14Storyboard {
  smallSide: number
  count: number
  bigSide: number
  bigPerim: number
  steps: Q14Step[]
  finalIndex: number
}

export function buildP21G2Q14Steps(lang: Lang): Q14Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q14Step[] = [
    {
      phase: 'show',
      traceSide: false,
      highlightDiagonal: false,
      showBigSide: false,
      hold: 1700,
      result: false,
      caption: t(
        'The four small squares step corner-to-corner across the big square.',
        'Empat persegi kecil melangkah dari sudut ke sudut menyilang persegi besar.',
      ),
    },
    {
      phase: 'span',
      traceSide: false,
      highlightDiagonal: true,
      showBigSide: false,
      hold: 2000,
      result: false,
      caption: t(
        `So one side of the big square is exactly ${SQUARES_ALONG_DIAGONAL} small-square widths.`,
        `Jadi satu sisi persegi besar tepat selebar ${SQUARES_ALONG_DIAGONAL} persegi kecil.`,
      ),
    },
    {
      phase: 'side',
      traceSide: true,
      highlightDiagonal: true,
      showBigSide: true,
      hold: 2100,
      result: false,
      caption: t(
        `Big side = ${SQUARES_ALONG_DIAGONAL} × ${SMALL_SIDE_CM} cm = ${BIG_SIDE_CM} cm.`,
        `Sisi besar = ${SQUARES_ALONG_DIAGONAL} × ${SMALL_SIDE_CM} cm = ${BIG_SIDE_CM} cm.`,
      ),
    },
    {
      phase: 'perimeter',
      traceSide: false,
      highlightDiagonal: false,
      showBigSide: true,
      hold: 1900,
      result: false,
      caption: t(
        `A square has 4 equal sides: 4 × ${BIG_SIDE_CM} cm.`,
        `Persegi punya 4 sisi sama: 4 × ${BIG_SIDE_CM} cm.`,
      ),
    },
    {
      phase: 'result',
      traceSide: false,
      highlightDiagonal: false,
      showBigSide: true,
      hold: 0,
      result: true,
      caption: t(
        `4 × ${BIG_SIDE_CM} = ${BIG_PERIM_CM} cm — answer D.`,
        `4 × ${BIG_SIDE_CM} = ${BIG_PERIM_CM} cm — jawaban D.`,
      ),
    },
  ]

  return {
    smallSide: SMALL_SIDE_CM,
    count: SQUARES_ALONG_DIAGONAL,
    bigSide: BIG_SIDE_CM,
    bigPerim: BIG_PERIM_CM,
    steps,
    finalIndex: steps.length - 1,
  }
}
