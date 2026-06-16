import type { Lang } from '../concepts/explainers/makeTenSteps'
import {
  FRUIT_APPLE,
  FRUIT_BANANA,
  FRUIT_STAR,
  SHAPE_CIRCLE,
  SHAPE_SQUARE,
  SHAPE_STAR,
  STAR_DIFFERENCE,
  TOTAL_ITEMS,
} from './P23G1Q15Illustration'

export type Q15Phase = 'show' | 'total' | 'shapeStar' | 'fruitStar' | 'diff' | 'result'

export interface Q15Step {
  phase: Q15Phase
  solved: boolean
  highlightStars: boolean
  caption: string
  hold: number
  result: boolean
}

export interface Q15Storyboard {
  total: number
  shapeStar: number
  fruitStar: number
  difference: number
  answer: string
  steps: Q15Step[]
  finalIndex: number
}

export function buildP23G1Q15Steps(lang: Lang, answer: string): Q15Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q15Step[] = [
    {
      phase: 'show',
      solved: false,
      highlightStars: false,
      hold: 1700,
      result: false,
      caption: t(
        'It is the SAME group of items, just counted two ways — so both charts add up to the same total.',
        'Ini kelompok benda yang SAMA, hanya dihitung dua cara — jadi kedua tabel berjumlah total yang sama.',
      ),
    },
    {
      phase: 'total',
      solved: true,
      highlightStars: false,
      hold: 2000,
      result: false,
      caption: t(
        `Each chart covers all ${TOTAL_ITEMS} items.`,
        `Setiap tabel mencakup seluruh ${TOTAL_ITEMS} benda.`,
      ),
    },
    {
      phase: 'shapeStar',
      solved: true,
      highlightStars: true,
      hold: 2100,
      result: false,
      caption: t(
        `By shape: ${TOTAL_ITEMS} - ${SHAPE_CIRCLE} - ${SHAPE_SQUARE} = ${SHAPE_STAR}. The star (triangle) = ${SHAPE_STAR}.`,
        `Menurut bentuk: ${TOTAL_ITEMS} - ${SHAPE_CIRCLE} - ${SHAPE_SQUARE} = ${SHAPE_STAR}. Bintang (segitiga) = ${SHAPE_STAR}.`,
      ),
    },
    {
      phase: 'fruitStar',
      solved: true,
      highlightStars: true,
      hold: 2100,
      result: false,
      caption: t(
        `By fruit: ${TOTAL_ITEMS} - ${FRUIT_APPLE} - ${FRUIT_BANANA} = ${FRUIT_STAR}. The star (cherry) = ${FRUIT_STAR}.`,
        `Menurut buah: ${TOTAL_ITEMS} - ${FRUIT_APPLE} - ${FRUIT_BANANA} = ${FRUIT_STAR}. Bintang (ceri) = ${FRUIT_STAR}.`,
      ),
    },
    {
      phase: 'diff',
      solved: true,
      highlightStars: true,
      hold: 1900,
      result: false,
      caption: t(
        `Both stars are ${SHAPE_STAR}: ${SHAPE_STAR} - ${FRUIT_STAR} = ${STAR_DIFFERENCE}.`,
        `Kedua bintang bernilai ${SHAPE_STAR}: ${SHAPE_STAR} - ${FRUIT_STAR} = ${STAR_DIFFERENCE}.`,
      ),
    },
    {
      phase: 'result',
      solved: true,
      highlightStars: true,
      hold: 0,
      result: true,
      caption: t(
        `The difference is ${STAR_DIFFERENCE} — answer ${answer}.`,
        `Selisihnya ${STAR_DIFFERENCE} — jawaban ${answer}.`,
      ),
    },
  ]

  return {
    total: TOTAL_ITEMS,
    shapeStar: SHAPE_STAR,
    fruitStar: FRUIT_STAR,
    difference: STAR_DIFFERENCE,
    answer,
    steps,
    finalIndex: steps.length - 1,
  }
}
