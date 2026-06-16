import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { TRIANGLE_COUNT } from './P20G1Q8Illustration'

export type TrianglePhase = 'show' | 'count' | 'result'

export interface TriangleStep {
  phase: TrianglePhase
  /** Which triangle to ring (0..7) or null. */
  ringed: number | null
  /** Triangles counted so far. */
  countedUpTo: number
  ringColor: string
  caption: string
  hold: number
  result: boolean
}

export interface TriangleStoryboard {
  total: number
  steps: TriangleStep[]
  finalIndex: number
}

const BLUE = '#2f6df0'
const GREEN = '#10B981'

// One short clue per triangle, in counting order 1..8.
const CLUES_EN = [
  'The left part is a triangle (the circle inside is a decoy).',
  'The point at the top is a triangle.',
  'The point at the bottom is a triangle.',
  'The big arrow on the right is a triangle.',
  'A small triangle at the top right.',
  'Another small triangle just below it.',
  'A small triangle at the bottom right.',
  'And one more small triangle below it.',
]
const CLUES_ID = [
  'Bagian kiri adalah segitiga (lingkaran di dalamnya hanya jebakan).',
  'Ujung di atas adalah segitiga.',
  'Ujung di bawah adalah segitiga.',
  'Panah besar di kanan adalah segitiga.',
  'Segitiga kecil di kanan atas.',
  'Segitiga kecil lain tepat di bawahnya.',
  'Segitiga kecil di kanan bawah.',
  'Dan satu segitiga kecil lagi di bawahnya.',
]

export function buildP20G1Q8Steps(lang: Lang): TriangleStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)
  const clue = (i: number) => (lang === 'id' ? CLUES_ID[i] : CLUES_EN[i])

  const steps: TriangleStep[] = []

  steps.push({
    phase: 'show',
    ringed: null,
    countedUpTo: 0,
    ringColor: BLUE,
    hold: 1700,
    result: false,
    caption: t(
      'Count only triangles. Skip the bars, squares and circles.',
      'Hitung hanya segitiga. Lewati persegi panjang, persegi, dan lingkaran.',
    ),
  })

  for (let i = 0; i < TRIANGLE_COUNT; i += 1) {
    steps.push({
      phase: 'count',
      ringed: i,
      countedUpTo: i + 1,
      ringColor: BLUE,
      hold: 1400,
      result: false,
      caption: t(`${clue(i)} (${i + 1})`, `${clue(i)} (${i + 1})`),
    })
  }

  steps.push({
    phase: 'result',
    ringed: null,
    countedUpTo: TRIANGLE_COUNT,
    ringColor: GREEN,
    hold: 0,
    result: true,
    caption: t(
      `${TRIANGLE_COUNT} triangles in all — answer C.`,
      `Seluruhnya ada ${TRIANGLE_COUNT} segitiga — jawaban C.`,
    ),
  })

  return { total: TRIANGLE_COUNT, steps, finalIndex: steps.length - 1 }
}
