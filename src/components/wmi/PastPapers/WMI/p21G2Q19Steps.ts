import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { HIDDEN } from './P21G2Q19Illustration'

export type Q19Phase = 'show' | 'unit' | 'extend' | 'reveal' | 'result'

export interface Q19Step {
  phase: Q19Phase
  litUnit: boolean
  reveal: boolean
  fillAnswer: boolean
  caption: string
  hold: number
  result: boolean
}

export interface Q19Storyboard {
  answerLabel: string
  steps: Q19Step[]
  finalIndex: number
}

const NAME = { '🍌': { en: 'banana', id: 'pisang' }, '🍏': { en: 'apple', id: 'apel' } } as const

export function buildP21G2Q19Steps(lang: Lang, answerLabel: string): Q19Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const names = HIDDEN.map((f) => NAME[f][lang === 'id' ? 'id' : 'en'])
  const triple = names.join(', ')

  const steps: Q19Step[] = [
    {
      phase: 'show',
      litUnit: false,
      reveal: false,
      fillAnswer: false,
      hold: 1700,
      result: false,
      caption: t(
        'A box hides three circles. Read the visible fruit to find the rule.',
        'Sebuah kotak menutup tiga lingkaran. Baca buah yang terlihat untuk menemukan aturannya.',
      ),
    },
    {
      phase: 'unit',
      litUnit: true,
      reveal: false,
      fillAnswer: false,
      hold: 2100,
      result: false,
      caption: t(
        'Between the apples the banana groups GROW: first 1 banana, then 2, then 3…',
        'Di antara apel, kelompok pisang BERTAMBAH: mula-mula 1 pisang, lalu 2, lalu 3…',
      ),
    },
    {
      phase: 'extend',
      litUnit: false,
      reveal: false,
      fillAnswer: false,
      hold: 2100,
      result: false,
      caption: t(
        'The 3-banana group shows only 2 before the box — it hides the 3rd banana, the apple, then the 4-group starts.',
        'Kelompok 3 pisang baru terlihat 2 sebelum kotak — kotak menyembunyikan pisang ke-3, apelnya, lalu kelompok 4 dimulai.',
      ),
    },
    {
      phase: 'reveal',
      litUnit: false,
      reveal: true,
      fillAnswer: false,
      hold: 2000,
      result: false,
      caption: t(
        `Lift the box: the three hidden circles are ${triple}.`,
        `Buka kotak: tiga lingkaran tersembunyi adalah ${triple}.`,
      ),
    },
    {
      phase: 'result',
      litUnit: false,
      reveal: true,
      fillAnswer: true,
      hold: 0,
      result: true,
      caption: t(
        `So the hidden fruit are ${triple} — answer ${answerLabel}.`,
        `Jadi buah tersembunyi adalah ${triple} — jawaban ${answerLabel}.`,
      ),
    },
  ]

  return { answerLabel, steps, finalIndex: steps.length - 1 }
}
