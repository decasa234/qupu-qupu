import type { Breakdown, BreakdownHighlight } from '../types.js'
import type { Params } from './index.js'

// Authored decomposition of a digit-sum problem: split a two-digit number into
// its tens digit and ones digit, then add them. The learner-facing part is a set
// of color-coded, clickable highlights over the problem text. Each phrase MUST be
// an exact substring of the rendered body in that language.
export function buildDigitSumBreakdown(params: Params): Breakdown {
  const n = params.n
  const tens = Math.floor(n / 10)
  const ones = n % 10
  const sum = tens + ones

  const highlights: BreakdownHighlight[] = [
    // fact — the number whose digits we add
    {
      category: 'fact',
      phrase_en: String(n),
      phrase_id: String(n),
      note_en: `This is the number. Look at its two digits: ${tens} and ${ones}.`,
      note_id: `Ini bilangannya. Lihat dua angkanya: ${tens} dan ${ones}.`,
    },
    // condition — it has exactly two digits
    {
      category: 'condition',
      phrase_en: 'two digits',
      phrase_id: 'dua angka',
      note_en: 'There are exactly two digits, so you add just two numbers.',
      note_id: 'Ada tepat dua angka, jadi kamu menjumlahkan dua bilangan saja.',
    },
    // question — what to find: the sum of the digits
    {
      category: 'question',
      phrase_en: 'the sum of its',
      phrase_id: 'jumlah',
      note_en: `Add the digits together: ${tens} + ${ones} = ${sum}.`,
      note_id: `Jumlahkan angka-angkanya: ${tens} + ${ones} = ${sum}.`,
    },
  ]

  return {
    needsVisual: false,
    highlights,

    quantities: [
      { label_en: 'Number', label_id: 'Bilangan', value: String(n) },
      { label_en: 'Tens digit', label_id: 'Angka puluhan', value: String(tens) },
      { label_en: 'Ones digit', label_id: 'Angka satuan', value: String(ones) },
      { label_en: 'Answer', label_id: 'Jawaban', value: String(sum) },
    ],

    strategy: {
      conceptSlug: 'digit-sum',
      name_en: 'Add the two digits',
      name_id: 'Jumlahkan kedua angka',
    },

    trap: null,

    answer: {
      form: 'number',
      unit: null,
      value: String(sum),
    },

    vocab: [],
  }
}
