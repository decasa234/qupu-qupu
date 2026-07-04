import type { Breakdown, BreakdownHighlight } from '../types.js'
import { sumOf, type Params } from './index.js'

// Authored decomposition of a consecutive-integer-sum problem: n consecutive
// whole numbers add up to a given sum; find the smallest one. The learner-facing
// part is a set of color-coded, clickable highlights over the problem text.
// Each phrase MUST be a substring of the rendered body.
export function buildConsecutiveSumBreakdown(params: Params): Breakdown {
  const { n, start } = params
  const sum = sumOf(params)
  const stepSum = (n * (n - 1)) / 2

  // The trap: dividing the sum straight by n gives the middle/average value,
  // not the smallest — only a clean tempting wrong answer when n is odd
  // (average lands on a whole number that isn't the smallest).
  const average = start + stepSum / n
  const trapWrong = n % 2 === 1 && average !== start ? String(average) : null

  const highlights: BreakdownHighlight[] = [
    {
      category: 'fact',
      phrase_en: String(sum),
      phrase_id: String(sum),
      note_en: `The total of all ${n} numbers added together is ${sum}.`,
      note_id: `Total dari semua ${n} bilangan yang dijumlahkan adalah ${sum}.`,
    },
    {
      category: 'condition',
      phrase_en: `${n} consecutive`,
      phrase_id: `${n} bilangan bulat berurutan`,
      note_en: `The numbers must be ${n} in a row, each one more than the last.`,
      note_id: `Bilangan-bilangan itu harus ${n} berurutan, masing-masing satu lebih besar dari sebelumnya.`,
    },
    {
      category: 'question',
      phrase_en: 'smallest',
      phrase_id: 'terkecil',
      note_en: 'Find the first (smallest) number in the run, not the average.',
      note_id: 'Cari bilangan pertama (terkecil) dalam deret, bukan rata-ratanya.',
    },
  ]

  return {
    needsVisual: false,
    highlights,

    quantities: [
      { label_en: 'Count', label_id: 'Banyak bilangan', value: String(n) },
      { label_en: 'Sum', label_id: 'Jumlah', value: String(sum) },
      { label_en: 'Answer', label_id: 'Jawaban', value: String(start) },
    ],

    strategy: {
      conceptSlug: 'consecutive-integer-sum',
      name_en: 'Subtract the step-sum, then divide',
      name_id: 'Kurangi jumlah langkah, lalu bagi',
    },

    trap: trapWrong
      ? {
          wrong: trapWrong,
          why_en: `${sum} ÷ ${n} = ${trapWrong} is the middle number, not the smallest.`,
          why_id: `${sum} ÷ ${n} = ${trapWrong} adalah bilangan tengah, bukan yang terkecil.`,
        }
      : null,

    answer: {
      form: 'number',
      unit: null,
      value: String(start),
    },

    vocab: [],
  }
}
