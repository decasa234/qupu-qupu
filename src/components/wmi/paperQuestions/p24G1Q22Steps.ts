import type { Lang } from '../concepts/explainers/makeTenSteps'
import {
  ANSWER_LETTER,
  BOTTOM_PIECE,
  CENTRE,
  CORNER_BL,
  CORNER_BR,
  CORNER_TL,
  CORNER_TR,
  HALF,
  TOP_PIECE,
  TOTAL,
} from './P24G1Q22Illustration'

export type CakeQ22Phase = 'show' | 'total' | 'half' | 'cut' | 'result'

export interface CakeQ22Step {
  phase: CakeQ22Phase
  shade: 'top' | 'bottom' | 'both' | null
  showCut: boolean
  showSums: 'top' | 'bottom' | 'both' | null
  caption: string
  hold: number
  result: boolean
}

export interface CakeQ22Storyboard {
  answer: string
  steps: CakeQ22Step[]
  finalIndex: number
}

export function buildP24G1Q22Steps(lang: Lang): CakeQ22Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: CakeQ22Step[] = [
    {
      phase: 'show',
      shade: null,
      showCut: false,
      showSums: null,
      hold: 1700,
      result: false,
      caption: t('Cut along the dotted lines into two equal-sum pieces.', 'Potong sepanjang garis putus-putus jadi dua bagian berjumlah sama.'),
    },
    {
      phase: 'total',
      shade: null,
      showCut: false,
      showSums: null,
      hold: 2200,
      result: false,
      caption: t(
        `Add every number: ${CORNER_TL} + ${CORNER_TR} + ${CENTRE} + ${CORNER_BL} + ${CORNER_BR} = ${TOTAL}.`,
        `Jumlahkan semua: ${CORNER_TL} + ${CORNER_TR} + ${CENTRE} + ${CORNER_BL} + ${CORNER_BR} = ${TOTAL}.`,
      ),
    },
    {
      phase: 'half',
      shade: null,
      showCut: false,
      showSums: null,
      hold: 2000,
      result: false,
      caption: t(`Two equal pieces means each must total ${TOTAL} ÷ 2 = ${HALF}.`, `Dua bagian sama berarti tiap bagian = ${TOTAL} ÷ 2 = ${HALF}.`),
    },
    {
      phase: 'cut',
      shade: 'both',
      showCut: true,
      showSums: null,
      hold: 2400,
      result: false,
      caption: t(
        `Cut off the two top corners: ${CORNER_TL} + ${CORNER_TR} = ${TOP_PIECE}. The rest is ${CENTRE} + ${CORNER_BL} + ${CORNER_BR} = ${BOTTOM_PIECE}.`,
        `Potong dua sudut atas: ${CORNER_TL} + ${CORNER_TR} = ${TOP_PIECE}. Sisanya ${CENTRE} + ${CORNER_BL} + ${CORNER_BR} = ${BOTTOM_PIECE}.`,
      ),
    },
    {
      phase: 'result',
      shade: 'both',
      showCut: true,
      showSums: 'both',
      hold: 0,
      result: true,
      caption: t(
        `Both pieces equal ${HALF} — that cut is option (${ANSWER_LETTER}).`,
        `Kedua bagian sama-sama ${HALF} — potongan itu opsi (${ANSWER_LETTER}).`,
      ),
    },
  ]

  return { answer: ANSWER_LETTER, steps, finalIndex: steps.length - 1 }
}
