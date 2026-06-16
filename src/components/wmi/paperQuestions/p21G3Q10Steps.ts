import type { Lang } from '../concepts/explainers/makeTenSteps'
import { EQUAL_COUNT, SHAPE_CELLS } from './P21G3Q10Illustration'

export type Q10Phase = 'show' | 'inspect' | 'result'

export interface Q10Step {
  phase: Q10Phase
  focusIdx: number
  verdictIdx: number[]
  equalSoFar: number | null
  caption: string
  hold: number
  result: boolean
}

export interface Q10Storyboard {
  answer: number
  steps: Q10Step[]
  finalIndex: number
}

// Per-shape one-liners (en, id) for the inspection beats.
const NOTES: Record<string, { en: string; id: string }> = {
  circle: {
    en: 'Circle: the line misses the centre — the two pieces differ. NOT equal.',
    id: 'Lingkaran: garisnya tidak lewat pusat — kedua bagian berbeda. TIDAK sama.',
  },
  triangle: {
    en: 'Triangle: 3 cuts from the centre give 3 equal pieces. EQUAL.',
    id: 'Segitiga: 3 potongan dari pusat memberi 3 bagian sama. SAMA.',
  },
  yellowBar: {
    en: 'Tall bar: 4 strips of the same height. EQUAL.',
    id: 'Batang tinggi: 4 jalur dengan tinggi sama. SAMA.',
  },
  invTriangle: {
    en: 'Inverted triangle: the cuts are off-centre — pieces differ. NOT equal.',
    id: 'Segitiga terbalik: potongannya miring tak rata — bagian berbeda. TIDAK sama.',
  },
  square: {
    en: 'Square: one diagonal makes 2 matching triangles. EQUAL.',
    id: 'Persegi: satu diagonal jadi 2 segitiga sama. SAMA.',
  },
  greenBar: {
    en: 'Wide bar: a thin middle strip — widths differ. NOT equal.',
    id: 'Batang lebar: jalur tengah tipis — lebarnya beda. TIDAK sama.',
  },
}

export function buildP21G3Q10Steps(lang: Lang): Q10Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q10Step[] = [
    {
      phase: 'show',
      focusIdx: -1,
      verdictIdx: [],
      equalSoFar: null,
      hold: 1700,
      result: false,
      caption: t(
        'Equal parts = every piece is the same size. Check each shape.',
        'Bagian sama = setiap bagian ukurannya sama. Periksa tiap bangun.',
      ),
    },
  ]

  let equal = 0
  SHAPE_CELLS.forEach((c, i) => {
    if (c.equal) equal += 1
    const note = NOTES[c.id]
    steps.push({
      phase: 'inspect',
      focusIdx: i,
      verdictIdx: SHAPE_CELLS.slice(0, i + 1).map((_, k) => k),
      equalSoFar: equal,
      hold: 1700,
      result: false,
      caption: t(note.en, note.id),
    })
  })

  steps.push({
    phase: 'result',
    focusIdx: -1,
    verdictIdx: SHAPE_CELLS.map((_, k) => k),
    equalSoFar: EQUAL_COUNT,
    hold: 0,
    result: true,
    caption: t(
      `${EQUAL_COUNT} shapes have equal parts — answer B.`,
      `${EQUAL_COUNT} bangun terbagi sama besar — jawaban B.`,
    ),
  })

  return { answer: EQUAL_COUNT, steps, finalIndex: steps.length - 1 }
}
