import type { Breakdown, BreakdownHighlight } from '../types.js'
import type { Params } from './index.js'

// Authored decomposition of a single-digit-addition problem: add two one-digit
// numbers. The learner-facing part is a set of color-coded, clickable highlights
// over the problem text. Each phrase MUST be a substring of the rendered body.
export function buildSingleDigitAdditionBreakdown(params: Params): Breakdown {
  const { a, b } = params
  const sum = a + b
  const bridges = sum > 10

  // The two addends are facts. When a === b the phrase is the same digit; one
  // highlight is enough, so we only add the second when it differs.
  const highlights: BreakdownHighlight[] = [
    {
      category: 'fact',
      phrase_en: String(a),
      phrase_id: String(a),
      note_en: `One number you are adding is ${a}.`,
      note_id: `Salah satu angka yang dijumlahkan adalah ${a}.`,
    },
  ]
  if (b !== a) {
    highlights.push({
      category: 'fact',
      phrase_en: String(b),
      phrase_id: String(b),
      note_en: `The other number you are adding is ${b}.`,
      note_id: `Angka satunya yang dijumlahkan adalah ${b}.`,
    })
  }
  highlights.push({
    category: 'question',
    phrase_en: `What is ${a} + ${b}?`,
    phrase_id: `Berapa ${a} + ${b}?`,
    note_en: 'Add the two numbers to find the total.',
    note_id: 'Jumlahkan kedua angka untuk mendapat totalnya.',
  })

  return {
    needsVisual: false,
    highlights,

    quantities: [
      { label_en: 'First number', label_id: 'Angka pertama', value: String(a) },
      { label_en: 'Second number', label_id: 'Angka kedua', value: String(b) },
      { label_en: 'Answer', label_id: 'Jawaban', value: String(sum) },
    ],

    strategy: {
      conceptSlug: 'single-digit-addition',
      name_en: bridges ? 'Make a ten' : 'Count on from the bigger number',
      name_id: bridges ? 'Jadikan sepuluh' : 'Hitung maju dari angka lebih besar',
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
