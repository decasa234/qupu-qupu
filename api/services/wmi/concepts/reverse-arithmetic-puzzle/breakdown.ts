import type { Breakdown, BreakdownHighlight } from '../types.js'
import type { Params } from './index.js'

function digitSum(n: number): number {
  return String(n)
    .split('')
    .reduce((s, c) => s + Number(c), 0)
}

// Authored decomposition of a reverse-arithmetic-puzzle problem: a mystery
// number minus the smallest d-digit number equals r; find the digit sum of the
// mystery number. The learner-facing part is a set of color-coded, clickable
// highlights over the problem text. Each phrase MUST be a substring of the
// rendered DISPLAY body (after section labels "Clue:"/"Find:" are stripped).
export function buildReverseArithmeticPuzzleBreakdown(params: Params): Breakdown {
  const base = params.d === 2 ? 10 : 100
  const number = base + params.r
  const answer = digitSum(number)
  const wordEN = params.d === 2 ? 'two' : 'three'
  const wordID = params.d === 2 ? 'dua' : 'tiga'

  const highlights: BreakdownHighlight[] = [
    // fact — the known number on the small side of the subtraction
    {
      category: 'fact',
      phrase_en: `the smallest ${wordEN}-digit number`,
      phrase_id: `bilangan ${wordID} angka terkecil`,
      note_en: `That number is ${base}.`,
      note_id: `Bilangan itu ${base}.`,
    },
    // fact — the known result of the subtraction
    {
      category: 'fact',
      phrase_en: String(params.r),
      phrase_id: String(params.r),
      note_en: `The subtraction gives ${params.r}.`,
      note_id: `Hasil pengurangannya ${params.r}.`,
    },
    // condition — the equation that must balance
    {
      category: 'condition',
      phrase_en: `minus the smallest ${wordEN}-digit number equals ${params.r}`,
      phrase_id: `dikurangi bilangan ${wordID} angka terkecil hasilnya ${params.r}`,
      note_en: `So the number = ${params.r} + ${base} = ${number}.`,
      note_id: `Jadi bilangannya = ${params.r} + ${base} = ${number}.`,
    },
    // question — what to find
    {
      category: 'question',
      phrase_en: 'the sum of the digits of that number',
      phrase_id: 'jumlah digit bilangan tersebut',
      note_en: `Add the digits of ${number}: ${String(number).split('').join(' + ')} = ${answer}.`,
      note_id: `Jumlahkan digit ${number}: ${String(number).split('').join(' + ')} = ${answer}.`,
    },
  ]

  return {
    needsVisual: false,
    highlights,

    quantities: [
      { label_en: 'Smallest number subtracted', label_id: 'Bilangan pengurang terkecil', value: String(base) },
      { label_en: 'Result', label_id: 'Hasil', value: String(params.r) },
      { label_en: 'Mystery number', label_id: 'Bilangan misteri', value: String(number) },
      { label_en: 'Answer (digit sum)', label_id: 'Jawaban (jumlah digit)', value: String(answer) },
    ],

    strategy: {
      conceptSlug: 'reverse-arithmetic-puzzle',
      name_en: 'Work backwards',
      name_id: 'Kerjakan secara terbalik',
    },

    trap: null,

    answer: {
      form: 'number',
      unit: null,
      value: String(answer),
    },

    vocab: [],
  }
}
