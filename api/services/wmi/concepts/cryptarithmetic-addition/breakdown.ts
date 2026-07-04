import type { Breakdown, BreakdownHighlight } from '../types.js'
import { buildMapping, type Params } from './index.js'

// Authored decomposition of a letter-addition (cryptarithm) puzzle: each letter
// stands for a distinct digit, no number starts with 0, and the puzzle has a
// unique solution. The learner-facing highlights are color-coded spans over the
// problem text — each phrase MUST be a substring of the rendered body.
export function buildCryptarithmeticBreakdown(params: Params): Breakdown {
  const m = buildMapping(params.addend1, params.addend2)
  const askLetter = m.digitToLetter[String(params.askDigit)]

  const highlights: BreakdownHighlight[] = [
    // facts — the three letter-words that make up the sum
    {
      category: 'fact',
      phrase_en: m.wordA,
      phrase_id: m.wordA,
      note_en: `The first number, written in letters as ${m.wordA}.`,
      note_id: `Bilangan pertama, ditulis dalam huruf sebagai ${m.wordA}.`,
    },
    {
      category: 'fact',
      phrase_en: m.wordB,
      phrase_id: m.wordB,
      note_en: `The second number, written in letters as ${m.wordB}.`,
      note_id: `Bilangan kedua, ditulis dalam huruf sebagai ${m.wordB}.`,
    },
    {
      category: 'fact',
      phrase_en: m.wordS,
      phrase_id: m.wordS,
      note_en: `Their total, written in letters as ${m.wordS}.`,
      note_id: `Jumlahnya, ditulis dalam huruf sebagai ${m.wordS}.`,
    },
    // condition — the rules that make the puzzle solvable
    {
      category: 'condition',
      phrase_en: 'a different digit',
      phrase_id: 'satu angka yang berbeda',
      note_en: 'Two different letters can never be the same digit.',
      note_id: 'Dua huruf yang berbeda tidak boleh mewakili angka yang sama.',
    },
    {
      category: 'condition',
      phrase_en: 'no number starts with 0',
      phrase_id: 'tidak ada bilangan yang diawali 0',
      note_en: 'A leading letter cannot be 0, which helps narrow the digits down.',
      note_id: 'Huruf terdepan tidak boleh 0, ini membantu mempersempit pilihan angka.',
    },
    // question — the letter we must identify
    {
      category: 'question',
      phrase_en: `the letter ${askLetter}`,
      phrase_id: `huruf ${askLetter}`,
      note_en: `Find which single digit the letter ${askLetter} stands for.`,
      note_id: `Cari satu angka yang diwakili oleh huruf ${askLetter}.`,
    },
  ]

  return {
    needsVisual: false,
    highlights,

    quantities: [
      { label_en: 'Puzzle', label_id: 'Teka-teki', value: `${m.wordA} + ${m.wordB} = ${m.wordS}` },
      { label_en: 'Asked letter', label_id: 'Huruf ditanya', value: askLetter },
      { label_en: 'Answer', label_id: 'Jawaban', value: String(params.askDigit) },
    ],

    strategy: {
      conceptSlug: 'cryptarithmetic-addition',
      name_en: 'Work column by column with carries',
      name_id: 'Kerjakan kolom demi kolom dengan simpanan',
    },

    trap: null,

    answer: {
      form: 'number',
      unit: null,
      value: String(params.askDigit),
    },

    vocab: [],
  }
}
