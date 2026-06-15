import type { Lang } from '../concepts/explainers/makeTenSteps'

// The example given on the paper: pieces 1 + 2 + 3 + 6 tile the rectangle.
export const EXAMPLE_SET = [1, 2, 3, 6] as const
// The four answer sets; B is the one that also tiles the rectangle.
export const ANSWER_B_SET = [2, 3, 4, 6] as const

export interface TileStep {
  /** Pieces shown placed inside the target rectangle this beat (in order). */
  placed: number[]
  /** Which set is being demonstrated: 'example' (1+2+3+6) or 'B' (2+3+4+6). */
  mode: 'example' | 'B' | 'intro'
  caption: string
  hold: number
  result: boolean
}

export interface TileStoryboard {
  exampleSet: readonly number[]
  answerBSet: readonly number[]
  steps: TileStep[]
  finalIndex: number
}

export function buildTilePieces19P1Steps(lang: Lang): TileStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: TileStep[] = [
    {
      mode: 'intro',
      placed: [],
      hold: 1700,
      result: false,
      caption: t(
        'The example shows pieces 1 + 2 + 3 + 6 fill the rectangle exactly.',
        'Contoh menunjukkan potongan 1 + 2 + 3 + 6 mengisi persegi panjang dengan pas.',
      ),
    },
    {
      mode: 'example',
      placed: [1, 2, 3, 6],
      hold: 2000,
      result: false,
      caption: t(
        'Drop 1, 2, 3 and 6 in — no gaps, no overlaps. So that set works.',
        'Taruh 1, 2, 3 dan 6 — tanpa celah, tanpa tumpang tindih. Set itu berhasil.',
      ),
    },
    {
      mode: 'B',
      placed: [],
      hold: 1800,
      result: false,
      caption: t(
        'Now test set B: 2 + 3 + 4 + 6. Their areas add up to the same rectangle.',
        'Sekarang uji set B: 2 + 3 + 4 + 6. Luasnya menjumlah ke persegi panjang yang sama.',
      ),
    },
    {
      mode: 'B',
      placed: [6, 2],
      hold: 1900,
      result: false,
      caption: t(
        'Place the T-shape 6 and the tall bar 2 — they frame the rectangle.',
        'Pasang bentuk-T 6 dan batang tinggi 2 — keduanya membingkai persegi panjang.',
      ),
    },
    {
      mode: 'B',
      placed: [6, 2, 4, 3],
      hold: 1900,
      result: false,
      caption: t(
        'The trapezoid 4 and square 3 fill the last gaps — a perfect fit.',
        'Trapesium 4 dan persegi 3 mengisi celah terakhir — pas sempurna.',
      ),
    },
    {
      mode: 'B',
      placed: [6, 2, 4, 3],
      hold: 0,
      result: true,
      caption: t(
        'Set B (2 + 3 + 4 + 6) tiles the rectangle. Answer B.',
        'Set B (2 + 3 + 4 + 6) menutup persegi panjang. Jawaban B.',
      ),
    },
  ]

  return {
    exampleSet: EXAMPLE_SET,
    answerBSet: ANSWER_B_SET,
    steps,
    finalIndex: steps.length - 1,
  }
}
