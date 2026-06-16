import type { Lang } from '../../concepts/explainers/makeTenSteps'
import { ANSWER_KINDS, type ShapeKind } from './P21G1Q3Illustration'

export type ShapeKindsPhase = 'show' | 'triangle' | 'square' | 'rectangle' | 'circle' | 'result'

export interface ShapeKindsStep {
  phase: ShapeKindsPhase
  /** Kinds highlighted in the figure for this beat. */
  litKinds: ShapeKind[]
  /** Running count of distinct kinds named so far (0..4). */
  tally: number
  caption: string
  hold: number
  result: boolean
}

export interface ShapeKindsStoryboard {
  answer: number
  answerLetter: string
  steps: ShapeKindsStep[]
  finalIndex: number
}

export function buildP21G1Q3Steps(lang: Lang): ShapeKindsStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: ShapeKindsStep[] = [
    {
      phase: 'show',
      litKinds: [],
      tally: 0,
      hold: 1700,
      result: false,
      caption: t(
        'Count KINDS of shape, not how many shapes.',
        'Hitung JENIS bentuk, bukan jumlah bentuknya.',
      ),
    },
    {
      phase: 'triangle',
      litKinds: ['triangle'],
      tally: 1,
      hold: 1900,
      result: false,
      caption: t('Triangles — the roof and the front. Kind 1.', 'Segitiga — atap dan bagian depan. Jenis ke-1.'),
    },
    {
      phase: 'square',
      litKinds: ['square'],
      tally: 2,
      hold: 1900,
      result: false,
      caption: t('Squares — the small pink ones. Kind 2.', 'Persegi — yang kecil warna merah muda. Jenis ke-2.'),
    },
    {
      phase: 'rectangle',
      litKinds: ['rectangle'],
      tally: 3,
      hold: 1900,
      result: false,
      caption: t(
        'Rectangles — the tall box and the two carriages. Kind 3.',
        'Persegi panjang — kotak tinggi dan dua gerbong. Jenis ke-3.',
      ),
    },
    {
      phase: 'circle',
      litKinds: ['circle'],
      tally: 4,
      hold: 1900,
      result: false,
      caption: t('Circles — the four wheels. Kind 4.', 'Lingkaran — empat roda. Jenis ke-4.'),
    },
    {
      phase: 'result',
      litKinds: ['triangle', 'square', 'rectangle', 'circle'],
      tally: 4,
      hold: 0,
      result: true,
      caption: t(
        `Triangle, square, rectangle, circle = ${ANSWER_KINDS} kinds — answer C.`,
        `Segitiga, persegi, persegi panjang, lingkaran = ${ANSWER_KINDS} jenis — jawaban C.`,
      ),
    },
  ]

  return {
    answer: ANSWER_KINDS,
    answerLetter: 'C',
    steps,
    finalIndex: steps.length - 1,
  }
}
