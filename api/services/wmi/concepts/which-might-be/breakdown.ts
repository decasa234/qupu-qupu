import type { Breakdown, BreakdownHighlight } from '../types.js'
import { type Params } from './index.js'

const LABELS = ['A', 'B', 'C', 'D'] as const

function satisfies(n: number, p: { lo: number; hi: number; k: number }): boolean {
  return n % 2 === 1 && n > p.lo && n < p.hi && Math.floor(n / 10) + (n % 10) === p.k
}

// Authored decomposition of a which-might-be problem: a mystery number must obey
// three clues at once (odd, strictly inside a range, fixed digit sum); pick the
// option that fits ALL three. The learner-facing part is color-coded, clickable
// highlights over the problem text. Each phrase MUST be a substring of the
// rendered display body (after section labels like "Clue:"/"Find:" are stripped).
export function buildWhichMightBeBreakdown(params: Params): Breakdown {
  const correctIdx = params.options.findIndex((n) => satisfies(n, params))
  const answerLabel = LABELS[correctIdx]
  const answerVal = params.options[correctIdx]
  const digitSum = (n: number) => Math.floor(n / 10) + (n % 10)

  const highlights: BreakdownHighlight[] = [
    // condition — clue 1: parity
    {
      category: 'condition',
      phrase_en: 'odd',
      phrase_id: 'ganjil',
      note_en: 'Clue 1: the number must be odd (ends in 1, 3, 5, 7, or 9).',
      note_id: 'Petunjuk 1: bilangannya harus ganjil (berakhir 1, 3, 5, 7, atau 9).',
    },
    // condition — clue 2: lower bound
    {
      category: 'condition',
      phrase_en: `greater than ${params.lo}`,
      phrase_id: `lebih dari ${params.lo}`,
      note_en: `Clue 2: the number must be bigger than ${params.lo}.`,
      note_id: `Petunjuk 2: bilangannya harus lebih besar dari ${params.lo}.`,
    },
    // condition — clue 2: upper bound
    {
      category: 'condition',
      phrase_en: `less than ${params.hi}`,
      phrase_id: `kurang dari ${params.hi}`,
      note_en: `Clue 2: it must also be smaller than ${params.hi}.`,
      note_id: `Petunjuk 2: bilangannya juga harus lebih kecil dari ${params.hi}.`,
    },
    // condition — clue 3: digit sum
    {
      category: 'condition',
      phrase_en: `the sum of its digits equals ${params.k}`,
      phrase_id: `jumlah digitnya sama dengan ${params.k}`,
      note_en: `Clue 3: add the two digits — they must total ${params.k}.`,
      note_id: `Petunjuk 3: jumlahkan kedua digit — hasilnya harus ${params.k}.`,
    },
    // question — what to find
    {
      category: 'question',
      phrase_en: 'could be the mystery number',
      phrase_id: 'mungkin merupakan bilangan misterius',
      note_en: 'Check each choice against all three clues; keep the one that fits every clue.',
      note_id: 'Periksa setiap pilihan dengan ketiga petunjuk; ambil yang memenuhi semuanya.',
    },
  ]

  return {
    needsVisual: false,
    highlights,

    quantities: [
      { label_en: 'Must be', label_id: 'Harus', value: 'odd' },
      { label_en: 'Range', label_id: 'Rentang', value: `${params.lo} < n < ${params.hi}` },
      { label_en: 'Digit sum', label_id: 'Jumlah digit', value: String(params.k) },
      { label_en: 'Options', label_id: 'Pilihan', value: params.options.join(', ') },
      {
        label_en: 'Answer',
        label_id: 'Jawaban',
        value: `${answerLabel} (${answerVal})`,
      },
    ],

    strategy: {
      conceptSlug: 'which-might-be',
      name_en: 'check each clue',
      name_id: 'periksa setiap petunjuk',
    },

    trap: null,

    answer: {
      form: 'choice',
      unit: null,
      value: String(answerLabel),
    },

    vocab: [],
  }
}
