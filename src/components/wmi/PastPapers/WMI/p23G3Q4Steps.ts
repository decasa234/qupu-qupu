import type { Lang } from '../concepts/explainers/makeTenSteps'
import { SHADED_COUNT, STRIP_COUNT } from './P23G3Q4Illustration'

export type FractionPhase = 'show' | 'denominator' | 'count' | 'result'

export interface FractionStep {
  phase: FractionPhase
  /** How many shaded strips have been ticked so far (0..SHADED_COUNT). */
  countedShaded: number
  ringWhole: boolean
  caption: string
  hold: number
  result: boolean
}

export interface FractionStoryboard {
  total: number
  shaded: number
  answerLetter: string
  steps: FractionStep[]
  finalIndex: number
}

export function buildP23G3Q4Steps(lang: Lang, answerLetter: string): FractionStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: FractionStep[] = [
    {
      phase: 'show',
      countedShaded: 0,
      ringWhole: false,
      hold: 1700,
      result: false,
      caption: t(
        'A fraction is shaded parts over total equal parts.',
        'Pecahan adalah bagian diarsir dibagi total bagian sama besar.',
      ),
    },
    {
      phase: 'denominator',
      countedShaded: 0,
      ringWhole: true,
      hold: 2000,
      result: false,
      caption: t(
        `The whole shape is split into ${STRIP_COUNT} equal strips, so the bottom number is ${STRIP_COUNT}.`,
        `Bangunnya dibagi ${STRIP_COUNT} bagian sama besar, jadi angka bawah adalah ${STRIP_COUNT}.`,
      ),
    },
    {
      phase: 'count',
      countedShaded: SHADED_COUNT,
      ringWhole: false,
      hold: 2100,
      result: false,
      caption: t(
        `Now count the blue strips: 1, 2, 3, 4, 5 — that's ${SHADED_COUNT} shaded.`,
        `Sekarang hitung strip biru: 1, 2, 3, 4, 5 — ada ${SHADED_COUNT} yang diarsir.`,
      ),
    },
    {
      phase: 'result',
      countedShaded: SHADED_COUNT,
      ringWhole: false,
      hold: 0,
      result: true,
      caption: t(
        `${SHADED_COUNT} shaded out of ${STRIP_COUNT} = ${SHADED_COUNT}/${STRIP_COUNT} — answer ${answerLetter}. (4/9 would count the white strips by mistake.)`,
        `${SHADED_COUNT} diarsir dari ${STRIP_COUNT} = ${SHADED_COUNT}/${STRIP_COUNT} — jawaban ${answerLetter}. (4/9 keliru menghitung strip putih.)`,
      ),
    },
  ]

  return {
    total: STRIP_COUNT,
    shaded: SHADED_COUNT,
    answerLetter,
    steps,
    finalIndex: steps.length - 1,
  }
}
