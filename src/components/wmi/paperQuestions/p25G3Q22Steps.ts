import type { Lang } from '../concepts/explainers/makeTenSteps'
import { PICTURE_COUNTS } from './P25G3Q22Illustration'

export type TriSeqPhase = 'show' | 'list' | 'growth' | 'extend5' | 'result'

export interface TriSeqStep {
  phase: TriSeqPhase
  /** Which picture's mesh to spotlight (1..4), or 6 for the answer, 0 = none. */
  spotlight: number
  /** A small running table of (picture -> count) revealed so far. */
  revealed: Array<{ pic: number; count: number }>
  caption: string
  hold: number
  result: boolean
}

export interface TriSeqStoryboard {
  answer: number // 43
  answerLetter: string // 'E'
  steps: TriSeqStep[]
  finalIndex: number
}

export function buildP25G3Q22Steps(lang: Lang, answerLetter = 'E'): TriSeqStoryboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const c1 = PICTURE_COUNTS[1] // 1
  const c2 = PICTURE_COUNTS[2] // 2
  const c3 = PICTURE_COUNTS[3] // 5
  const c4 = PICTURE_COUNTS[4] // 12
  const answer = PICTURE_COUNTS[6] // 43

  const known = [
    { pic: 1, count: c1 },
    { pic: 2, count: c2 },
    { pic: 3, count: c3 },
    { pic: 4, count: c4 },
  ]

  const steps: TriSeqStep[] = [
    {
      phase: 'show',
      spotlight: 0,
      revealed: [],
      hold: 1700,
      result: false,
      caption: t(
        'Count every triangle — small ones AND the big enclosing ones — in each picture.',
        'Hitung semua segitiga — yang kecil DAN yang besar pembungkus — pada tiap gambar.',
      ),
    },
    {
      phase: 'list',
      spotlight: 4,
      revealed: known,
      hold: 2200,
      result: false,
      caption: t(
        `Counting gives 1, 2, 5, 12 for Pictures 1–4.`,
        `Hasil hitung: 1, 2, 5, 12 untuk Gambar 1–4.`,
      ),
    },
    {
      phase: 'growth',
      spotlight: 0,
      revealed: known,
      hold: 2400,
      result: false,
      caption: t(
        `Each jump grows: +1, then +3, then +7 — the extra amount keeps rising.`,
        `Tiap lompatan membesar: +1, lalu +3, lalu +7 — tambahannya terus naik.`,
      ),
    },
    {
      phase: 'extend5',
      spotlight: 0,
      revealed: [...known, { pic: 5, count: 27 }],
      hold: 2400,
      result: false,
      caption: t(
        `Continue the pattern up to Picture 6, counting the triangles two steps further.`,
        `Lanjutkan pola sampai Gambar 6, menghitung segitiga dua langkah lebih jauh.`,
      ),
    },
    {
      phase: 'result',
      spotlight: 6,
      revealed: [...known, { pic: 6, count: answer }],
      hold: 0,
      result: true,
      caption: t(
        `Picture 6 has ${answer} triangles. Answer ${answerLetter}.`,
        `Gambar 6 punya ${answer} segitiga. Jawaban ${answerLetter}.`,
      ),
    },
  ]

  return {
    answer,
    answerLetter,
    steps,
    finalIndex: steps.length - 1,
  }
}
