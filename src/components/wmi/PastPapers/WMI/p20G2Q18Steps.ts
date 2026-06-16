import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { Q18_FIRST, Q18_SECOND, Q18_STEP, Q18_THIRD } from './P20G2Q18Illustration'

export type Q18Phase = 'show' | 'first' | 'second' | 'gap' | 'result'

export interface Q18Step {
  phase: Q18Phase
  showFirst: boolean
  showSecond: boolean
  /** false = hide, true = "?", number = revealed score */
  third: number | boolean
  caption: string
  hold: number
  result: boolean
}

export interface Q18Storyboard {
  first: number
  second: number
  step: number
  answer: number
  steps: Q18Step[]
  finalIndex: number
}

export function buildP20G2Q18Steps(lang: Lang): Q18Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q18Step[] = [
    {
      phase: 'show',
      showFirst: false,
      showSecond: false,
      third: false,
      hold: 1600,
      result: false,
      caption: t(
        'The three throws make a number pattern. Read the scores in order.',
        'Ketiga lemparan membentuk pola bilangan. Baca skornya berurutan.',
      ),
    },
    {
      phase: 'first',
      showFirst: true,
      showSecond: false,
      third: false,
      hold: 1700,
      result: false,
      caption: t(`First throw = ${Q18_FIRST} points.`, `Lemparan pertama = ${Q18_FIRST} poin.`),
    },
    {
      phase: 'second',
      showFirst: true,
      showSecond: true,
      third: false,
      hold: 1900,
      result: false,
      caption: t(
        `Second throw = ${Q18_SECOND}. From ${Q18_FIRST} to ${Q18_SECOND} is +${Q18_STEP}.`,
        `Lemparan kedua = ${Q18_SECOND}. Dari ${Q18_FIRST} ke ${Q18_SECOND} naik +${Q18_STEP}.`,
      ),
    },
    {
      phase: 'gap',
      showFirst: true,
      showSecond: true,
      third: true,
      hold: 2000,
      result: false,
      caption: t(
        `Each throw grows by +${Q18_STEP}, so the third throw = ${Q18_SECOND} + ${Q18_STEP}.`,
        `Tiap lemparan naik +${Q18_STEP}, jadi lemparan ketiga = ${Q18_SECOND} + ${Q18_STEP}.`,
      ),
    },
    {
      phase: 'result',
      showFirst: true,
      showSecond: true,
      third: Q18_THIRD,
      hold: 0,
      result: true,
      caption: t(
        `${Q18_SECOND} + ${Q18_STEP} = ${Q18_THIRD} points — answer B.`,
        `${Q18_SECOND} + ${Q18_STEP} = ${Q18_THIRD} poin — jawaban B.`,
      ),
    },
  ]

  return {
    first: Q18_FIRST,
    second: Q18_SECOND,
    step: Q18_STEP,
    answer: Q18_THIRD,
    steps,
    finalIndex: steps.length - 1,
  }
}
