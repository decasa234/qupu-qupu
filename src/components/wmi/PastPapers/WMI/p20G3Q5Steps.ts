import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { P20G3Q5_ANSWER, P20G3Q5_FRACTION, TREE_COUNT } from './P20G3Q5Illustration'

export type Q5Phase = 'show' | 'countTrees' | 'countDots' | 'ratio' | 'result'

export interface Q5Step {
  phase: Q5Phase
  hotDots: boolean
  hotTrees: boolean
  caption: string
  hold: number
  result: boolean
}

export interface Q5Storyboard {
  answer: string
  fraction: string
  steps: Q5Step[]
  finalIndex: number
}

export function buildP20G3Q5Steps(lang: Lang): Q5Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q5Step[] = [
    {
      phase: 'show',
      hotDots: false,
      hotTrees: false,
      hold: 1700,
      result: false,
      caption: t(
        'Compare two counts: the dots up top and the trees below.',
        'Bandingkan dua hitungan: titik di atas dan pohon di bawah.',
      ),
    },
    {
      phase: 'countTrees',
      hotDots: false,
      hotTrees: true,
      hold: 1900,
      result: false,
      caption: t(`Trees: there are ${TREE_COUNT} of them.`, `Pohon: ada ${TREE_COUNT} buah.`),
    },
    {
      phase: 'countDots',
      hotDots: true,
      hotTrees: false,
      hold: 2100,
      result: false,
      caption: t(
        'Dots: the strips trail off — the picture compares them as a single share.',
        'Titik: deretnya makin kecil — gambar membandingkannya sebagai satu bagian.',
      ),
    },
    {
      phase: 'ratio',
      hotDots: true,
      hotTrees: true,
      hold: 2000,
      result: false,
      caption: t(
        `So dots are 1 part for every ${TREE_COUNT} trees → 1 / ${TREE_COUNT}.`,
        `Jadi titik 1 bagian untuk tiap ${TREE_COUNT} pohon → 1 / ${TREE_COUNT}.`,
      ),
    },
    {
      phase: 'result',
      hotDots: false,
      hotTrees: false,
      hold: 0,
      result: true,
      caption: t(
        `dots = ${P20G3Q5_FRACTION} of trees — option ${P20G3Q5_ANSWER}.`,
        `titik = ${P20G3Q5_FRACTION} dari pohon — pilihan ${P20G3Q5_ANSWER}.`,
      ),
    },
  ]

  return { answer: P20G3Q5_ANSWER, fraction: P20G3Q5_FRACTION, steps, finalIndex: steps.length - 1 }
}
