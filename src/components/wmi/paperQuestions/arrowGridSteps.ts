import type { Lang } from '../concepts/explainers/makeTenSteps'
import { ANSWER_ARROWS, AG_ANSWER } from './ArrowGridIllustration'

export type ArrowGridPhase = 'show' | 'rule' | 'fill' | 'result'

export interface ArrowGridStep {
  phase: ArrowGridPhase
  /** Number of ABCD answer arrows filled so far (0..4). */
  filled: number
  /** Index (0..3) of the arrow being lit on this beat, or null. */
  active: number | null
  caption: string
  hold: number
  result: boolean
}

export interface ArrowGridStoryboard {
  answer: string
  steps: ArrowGridStep[]
  finalIndex: number
}

export function buildArrowGridSteps(lang: Lang): ArrowGridStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: ArrowGridStep[] = [
    {
      phase: 'show',
      filled: 0,
      active: null,
      caption: t('Each arrow holds a count. Find ABCD.', 'Tiap panah memuat sebuah hitungan. Cari ABCD.'),
      hold: 1700,
      result: false,
    },
    {
      phase: 'rule',
      filled: 0,
      active: null,
      caption: t(
        'An arrow’s number = how many DIFFERENT numbers are in the cells it points at.',
        'Angka pada panah = berapa banyak angka BERBEDA pada kotak yang ditunjuknya.',
      ),
      hold: 2500,
      result: false,
    },
    {
      phase: 'rule',
      filled: 0,
      active: null,
      caption: t(
        'A two-way arrow counts the different numbers seen in both of its directions together.',
        'Panah dua arah menghitung angka berbeda dari kedua arahnya sekaligus.',
      ),
      hold: 2300,
      result: false,
    },
  ]

  ANSWER_ARROWS.forEach((arrow, i) => {
    steps.push({
      phase: 'fill',
      filled: i + 1,
      active: i,
      caption: t(
        `Counting the different numbers along it, ${arrow.label} = ${arrow.value}.`,
        `Dengan menghitung angka berbeda di sepanjangnya, ${arrow.label} = ${arrow.value}.`,
      ),
      hold: 1700,
      result: false,
    })
  })

  steps.push({
    phase: 'result',
    filled: ANSWER_ARROWS.length,
    active: null,
    caption: t(`ABCD = ${AG_ANSWER}.`, `ABCD = ${AG_ANSWER}.`),
    hold: 0,
    result: true,
  })

  return { answer: AG_ANSWER, steps, finalIndex: steps.length - 1 }
}
