import type { Lang } from '../concepts/explainers/makeTenSteps'
import { P20G3Q6_ANSWER, P20G3Q6_PERIMETER } from './P20G3Q6Illustration'
import type { Q6Highlight } from './P20G3Q6Illustration'

export type Q6Phase = 'show' | 'square' | 'tab' | 'sum' | 'result'

export interface Q6Step {
  phase: Q6Phase
  highlight: Q6Highlight
  showAllLengths: boolean
  caption: string
  hold: number
  result: boolean
}

export interface Q6Storyboard {
  answer: string
  perimeter: number
  steps: Q6Step[]
  finalIndex: number
}

export function buildP20G3Q6Steps(lang: Lang): Q6Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q6Step[] = [
    {
      phase: 'show',
      highlight: 'none',
      showAllLengths: false,
      hold: 1700,
      result: false,
      caption: t(
        'Right angles only — slide edges so the dents line up.',
        'Hanya sudut siku-siku — geser sisi agar lekukannya sejajar.',
      ),
    },
    {
      phase: 'square',
      highlight: 'square',
      showAllLengths: false,
      hold: 2200,
      result: false,
      caption: t(
        'The right verticals 6 + 2 + 7 = 15, so it is really a 15 × 15 square: 4 × 15 = 60.',
        'Sisi tegak kanan 6 + 2 + 7 = 15, jadi ini persegi 15 × 15: 4 × 15 = 60.',
      ),
    },
    {
      phase: 'tab',
      highlight: 'tab',
      showAllLengths: false,
      hold: 2100,
      result: false,
      caption: t(
        'The tab adds only its two side edges: 5 + 5 = 10.',
        'Tonjolannya hanya menambah dua sisi: 5 + 5 = 10.',
      ),
    },
    {
      phase: 'sum',
      highlight: 'none',
      showAllLengths: true,
      hold: 2000,
      result: false,
      caption: t(`60 + 10 = ${P20G3Q6_PERIMETER} cm.`, `60 + 10 = ${P20G3Q6_PERIMETER} cm.`),
    },
    {
      phase: 'result',
      highlight: 'none',
      showAllLengths: true,
      hold: 0,
      result: true,
      caption: t(
        `Perimeter = ${P20G3Q6_PERIMETER} cm — option ${P20G3Q6_ANSWER}.`,
        `Keliling = ${P20G3Q6_PERIMETER} cm — pilihan ${P20G3Q6_ANSWER}.`,
      ),
    },
  ]

  return { answer: P20G3Q6_ANSWER, perimeter: P20G3Q6_PERIMETER, steps, finalIndex: steps.length - 1 }
}
