import type { Lang } from '../concepts/explainers/makeTenSteps'
import { BIG_VALUE, DIFFERENCE, HETER_TOTAL, KUDZU_TOTAL, PLANT_ROWS } from './P24G3Q12Illustration'

export type Q12Phase = 'show' | 'kudzu' | 'heter' | 'subtract' | 'result'

export interface Q12Step {
  phase: Q12Phase
  /** Which plant row to spotlight (key) or null. */
  focus: string | null
  /** Show the decoded numeric value tag for kudzu. */
  showKudzuValue: boolean
  /** Show the decoded numeric value tag for heteromeles. */
  showHeterValue: boolean
  /** Reveal the answer row (DIFFERENCE small stars). */
  showAnswerRow: boolean
  caption: string
  hold: number
  result: boolean
}

export interface Q12Storyboard {
  kudzuTotal: number
  heterTotal: number
  difference: number
  answer: string
  steps: Q12Step[]
  finalIndex: number
}

export function buildP24G3Q12Steps(lang: Lang): Q12Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const kudzu = PLANT_ROWS[0]
  const heter = PLANT_ROWS[2]

  const steps: Q12Step[] = [
    {
      phase: 'show',
      focus: null,
      showKudzuValue: false,
      showHeterValue: false,
      showAnswerRow: false,
      hold: 1700,
      result: false,
      caption: t(
        'Big star = 5, small star = 1. Decode each row into a number.',
        'Bintang besar = 5, kecil = 1. Ubah tiap baris jadi angka.',
      ),
    },
    {
      phase: 'kudzu',
      focus: 'kudzu',
      showKudzuValue: true,
      showHeterValue: false,
      showAnswerRow: false,
      hold: 2100,
      result: false,
      caption: t(
        `Golden kudzu = ${kudzu.big} big + ${kudzu.small} small = ${kudzu.big}x${BIG_VALUE} + ${kudzu.small} = ${KUDZU_TOTAL}.`,
        `Golden kudzu = ${kudzu.big} besar + ${kudzu.small} kecil = ${kudzu.big}x${BIG_VALUE} + ${kudzu.small} = ${KUDZU_TOTAL}.`,
      ),
    },
    {
      phase: 'heter',
      focus: 'heter',
      showKudzuValue: true,
      showHeterValue: true,
      showAnswerRow: false,
      hold: 2000,
      result: false,
      caption: t(
        `Heteromeles = ${heter.small} small = ${HETER_TOTAL}.`,
        `Heteromeles = ${heter.small} kecil = ${HETER_TOTAL}.`,
      ),
    },
    {
      phase: 'subtract',
      focus: null,
      showKudzuValue: true,
      showHeterValue: true,
      showAnswerRow: false,
      hold: 2000,
      result: false,
      caption: t(
        `How many more? ${KUDZU_TOTAL} - ${HETER_TOTAL} = ${DIFFERENCE} plants.`,
        `Berapa lebih banyak? ${KUDZU_TOTAL} - ${HETER_TOTAL} = ${DIFFERENCE} tanaman.`,
      ),
    },
    {
      phase: 'result',
      focus: null,
      showKudzuValue: true,
      showHeterValue: true,
      showAnswerRow: true,
      hold: 0,
      result: true,
      caption: t(
        `${DIFFERENCE} plants = ${DIFFERENCE} small stars - answer B.`,
        `${DIFFERENCE} tanaman = ${DIFFERENCE} bintang kecil - jawaban B.`,
      ),
    },
  ]

  return {
    kudzuTotal: KUDZU_TOTAL,
    heterTotal: HETER_TOTAL,
    difference: DIFFERENCE,
    answer: 'B',
    steps,
    finalIndex: steps.length - 1,
  }
}
