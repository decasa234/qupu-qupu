import type { Breakdown, BreakdownHighlight } from '../types.js'
import { digitSum, type Params } from './index.js'

// Authored decomposition of a find-number-by-digit-sum problem: pick the
// two-digit option whose tens digit + ones digit equals a target sum k.
// Highlights are color-coded, clickable spans over the rendered body — each
// phrase MUST be an exact substring of the DISPLAY body (after section labels
// like "Find:" are stripped; there is no glossary markup here).
export function buildFindNumberByDigitSumBreakdown(params: Params): Breakdown {
  const k = params.k
  const correctIdx = params.options.findIndex((n) => digitSum(n) === k)
  const correctLabel = ['A', 'B', 'C', 'D'][correctIdx]
  const correct = params.options[correctIdx]

  const highlights: BreakdownHighlight[] = [
    {
      category: 'fact',
      phrase_en: 'two-digit number',
      phrase_id: 'bilangan dua angka',
      note_en: 'Each option has a tens digit and a ones digit.',
      note_id: 'Setiap pilihan punya angka puluhan dan angka satuan.',
    },
    {
      category: 'condition',
      phrase_en: `digit sum equal to ${k}`,
      phrase_id: `jumlah digitnya sama dengan ${k}`,
      note_en: `Add the two digits — they must total ${k}.`,
      note_id: `Jumlahkan kedua angkanya — totalnya harus ${k}.`,
    },
    {
      category: 'question',
      phrase_en: 'Which number',
      phrase_id: 'Bilangan manakah',
      note_en: 'Find the one option that fits the rule.',
      note_id: 'Cari satu pilihan yang sesuai aturan.',
    },
  ]

  return {
    needsVisual: false,
    highlights,

    quantities: [
      { label_en: 'Target digit sum', label_id: 'Jumlah digit yang dicari', value: String(k) },
      { label_en: 'Options', label_id: 'Pilihan', value: params.options.join(', ') },
      { label_en: 'Answer', label_id: 'Jawaban', value: `${correctLabel} (${correct})` },
    ],

    strategy: {
      conceptSlug: 'find-number-by-digit-sum',
      name_en: 'Add the tens and ones digit',
      name_id: 'Jumlahkan angka puluhan dan satuan',
    },

    trap: null,

    answer: {
      form: 'choice',
      unit: null,
      value: String(correctLabel),
    },

    vocab: [],
  }
}
