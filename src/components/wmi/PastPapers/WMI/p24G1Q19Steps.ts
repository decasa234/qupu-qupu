import type { Lang } from '../../concepts/explainers/makeTenSteps'
import {
  BOTTOM_SOLUTION,
  LARGEST_NUMBER,
  TOP_LEFT_SUM,
  TOP_RIGHT_SUM,
  UNITS_DIGIT,
} from './P24G1Q19Illustration'

export type PyramidQ19Phase =
  | 'show'
  | 'rules'
  | 'tryNine'
  | 'tryEight'
  | 'result'

export interface PyramidQ19Step {
  phase: PyramidQ19Phase
  /** Bottom values left→middle→right (null = blank). */
  values: Array<number | null>
  activeBoxes: number[]
  activeSums: number[]
  showNumber: boolean
  caption: string
  hold: number
  result: boolean
}

export interface PyramidQ19Storyboard {
  answer: number
  steps: PyramidQ19Step[]
  finalIndex: number
}

const [L, M, R] = BOTTOM_SOLUTION // 8, 7, 5

export function buildP24G1Q19Steps(lang: Lang): PyramidQ19Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: PyramidQ19Step[] = [
    {
      phase: 'show',
      values: [null, null, null],
      activeBoxes: [],
      activeSums: [],
      showNumber: false,
      hold: 1700,
      result: false,
      caption: t(
        'Each top number is the sum of the two squares below it.',
        'Tiap bilangan atas adalah jumlah dua persegi di bawahnya.',
      ),
    },
    {
      phase: 'rules',
      values: [null, null, null],
      activeBoxes: [0, 1, 2],
      activeSums: [0, 1],
      showNumber: false,
      hold: 2100,
      result: false,
      caption: t(
        `So left + middle = ${TOP_LEFT_SUM} and middle + right = ${TOP_RIGHT_SUM}.`,
        `Jadi kiri + tengah = ${TOP_LEFT_SUM} dan tengah + kanan = ${TOP_RIGHT_SUM}.`,
      ),
    },
    {
      phase: 'tryNine',
      values: [9, 6, 6],
      activeBoxes: [0, 1, 2],
      activeSums: [],
      showNumber: false,
      hold: 2300,
      result: false,
      caption: t(
        'Try left = 9: then middle = 15 − 9 = 6, so right = 12 − 6 = 6. But 6 repeats — not allowed.',
        'Coba kiri = 9: maka tengah = 15 − 9 = 6, jadi kanan = 12 − 6 = 6. Tapi 6 berulang — tidak boleh.',
      ),
    },
    {
      phase: 'tryEight',
      values: [L, M, R],
      activeBoxes: [0, 1, 2],
      activeSums: [],
      showNumber: false,
      hold: 2200,
      result: false,
      caption: t(
        `Try left = ${L}: middle = ${TOP_LEFT_SUM} − ${L} = ${M}, right = ${TOP_RIGHT_SUM} − ${M} = ${R}. All different!`,
        `Coba kiri = ${L}: tengah = ${TOP_LEFT_SUM} − ${L} = ${M}, kanan = ${TOP_RIGHT_SUM} − ${M} = ${R}. Semua berbeda!`,
      ),
    },
    {
      phase: 'result',
      values: [L, M, R],
      activeBoxes: [2],
      activeSums: [],
      showNumber: true,
      hold: 0,
      result: true,
      caption: t(
        `Largest number = ${LARGEST_NUMBER}, so the units digit is ${UNITS_DIGIT} — answer B.`,
        `Bilangan terbesar = ${LARGEST_NUMBER}, jadi angka satuannya ${UNITS_DIGIT} — jawaban B.`,
      ),
    },
  ]

  return { answer: UNITS_DIGIT, steps, finalIndex: steps.length - 1 }
}
