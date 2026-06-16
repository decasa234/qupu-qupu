import type { Lang } from '../../concepts/explainers/makeTenSteps'
import {
  ANSWER_LETTER,
  DIAMOND_VALUE,
  STAR_PLUS_DIAMOND,
  STAR_VALUE,
} from './P22G1Q21Illustration'

export type Q21Phase = 'show' | 'topRow' | 'col0' | 'col2' | 'star' | 'result'

export interface Q21Step {
  phase: Q21Phase
  highlightTopRow: boolean
  highlightCol: number | null
  highlightCells: Array<[number, number]>
  showSolution: boolean
  revealStar: boolean
  showAnswer: boolean
  caption: string
  hold: number
  result: boolean
}

export interface Q21Storyboard {
  star: number
  diamond: number
  total: number
  answer: string
  steps: Q21Step[]
  finalIndex: number
}

export function buildP22G1Q21Steps(lang: Lang): Q21Storyboard {
  const t = (en: string, id: string) => (lang === 'id' ? id : en)

  const steps: Q21Step[] = [
    {
      phase: 'show',
      highlightTopRow: false,
      highlightCol: null,
      highlightCells: [],
      showSolution: false,
      revealStar: false,
      showAnswer: false,
      hold: 1900,
      result: false,
      caption: t(
        'Fill 1–9, each once. Use the sums on the edges to pin the empty boxes.',
        'Isi 1–9, masing-masing sekali. Pakai jumlah di tepi untuk menentukan kotak kosong.',
      ),
    },
    {
      phase: 'topRow',
      highlightTopRow: true,
      highlightCol: null,
      highlightCells: [[0, 0], [0, 2]],
      showSolution: false,
      revealStar: false,
      showAnswer: false,
      hold: 2200,
      result: false,
      caption: t(
        'Top row adds to 11 and already has 5, so the two empty boxes make 6: they are 2 and 4.',
        'Baris atas berjumlah 11 dan sudah ada 5, jadi dua kotak kosongnya berjumlah 6: yaitu 2 dan 4.',
      ),
    },
    {
      phase: 'col0',
      highlightTopRow: false,
      highlightCol: 0,
      highlightCells: [],
      showSolution: false,
      revealStar: false,
      showAnswer: false,
      hold: 2200,
      result: false,
      caption: t(
        'Left column adds to 18 with 9 inside: 2 (top) + 9 + bottom = 18, so bottom-left = 7 (then top = 2).',
        'Kolom kiri berjumlah 18 dengan 9 di dalamnya: 2 (atas) + 9 + bawah = 18, jadi kiri-bawah = 7 (lalu atas = 2).',
      ),
    },
    {
      phase: 'col2',
      highlightTopRow: false,
      highlightCol: 2,
      highlightCells: [],
      showSolution: false,
      revealStar: false,
      showAnswer: false,
      hold: 2200,
      result: false,
      caption: t(
        'Right column adds to 13 with 1 inside: 4 (top) + middle + 1 = 13, so middle-right = 8. Centre box = 3 is what is left.',
        'Kolom kanan berjumlah 13 dengan 1 di dalamnya: 4 (atas) + tengah + 1 = 13, jadi tengah-kanan = 8. Kotak tengah = 3 sisanya.',
      ),
    },
    {
      phase: 'star',
      highlightTopRow: false,
      highlightCol: 1,
      highlightCells: [],
      showSolution: true,
      revealStar: true,
      showAnswer: false,
      hold: 2300,
      result: false,
      caption: t(
        `Now read the ★ column: 5 + 3 + 6 = ${STAR_VALUE}. So ★ = ${STAR_VALUE}.`,
        `Sekarang baca kolom ★: 5 + 3 + 6 = ${STAR_VALUE}. Jadi ★ = ${STAR_VALUE}.`,
      ),
    },
    {
      phase: 'result',
      highlightTopRow: false,
      highlightCol: null,
      highlightCells: [],
      showSolution: true,
      revealStar: true,
      showAnswer: true,
      hold: 0,
      result: true,
      caption: t(
        `The partner square gives ♦ = ${DIAMOND_VALUE}, so ★ + ♦ = ${STAR_VALUE} + ${DIAMOND_VALUE} = ${STAR_PLUS_DIAMOND} — answer ${ANSWER_LETTER}.`,
        `Persegi pasangannya memberi ♦ = ${DIAMOND_VALUE}, jadi ★ + ♦ = ${STAR_VALUE} + ${DIAMOND_VALUE} = ${STAR_PLUS_DIAMOND} — jawaban ${ANSWER_LETTER}.`,
      ),
    },
  ]

  return {
    star: STAR_VALUE,
    diamond: DIAMOND_VALUE,
    total: STAR_PLUS_DIAMOND,
    answer: ANSWER_LETTER,
    steps,
    finalIndex: steps.length - 1,
  }
}
