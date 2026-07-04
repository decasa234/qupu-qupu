import type { Breakdown, BreakdownHighlight } from '../types.js'
import type { Params } from './index.js'

// Authored decomposition of a solve-symbol-equations problem: the first
// equation isolates ★ (n identical copies summing to a total), then the
// second equation combines ★ and ● so the learner can solve for ●. The
// learner-facing part is a set of color-coded, clickable highlights over the
// problem text. Each phrase MUST be a substring of the rendered body.
export function buildSymbolBreakdown(params: Params): Breakdown {
  const { s, c, n } = params
  const total1 = n * s
  const total2 = s + c

  const highlights: BreakdownHighlight[] = [
    {
      category: 'fact',
      phrase_en: String(total1),
      phrase_id: String(total1),
      note_en: `The ${n} copies of ★ add up to ${total1}.`,
      note_id: `${n} buah ★ jika dijumlahkan menjadi ${total1}.`,
    },
    {
      category: 'fact',
      phrase_en: String(total2),
      phrase_id: String(total2),
      note_en: `★ and ● together add up to ${total2}.`,
      note_id: `★ dan ● jika dijumlahkan menjadi ${total2}.`,
    },
    {
      category: 'question',
      phrase_en: 'value of ●',
      phrase_id: 'nilai ●',
      note_en: 'Find what number ● stands for.',
      note_id: 'Cari angka berapa yang diwakili oleh ●.',
    },
  ]

  return {
    needsVisual: false,
    highlights,

    quantities: [
      { label_en: 'First equation total', label_id: 'Total persamaan pertama', value: String(total1) },
      { label_en: 'Second equation total', label_id: 'Total persamaan kedua', value: String(total2) },
      { label_en: 'Answer', label_id: 'Jawaban', value: String(c) },
    ],

    strategy: {
      conceptSlug: 'solve-symbol-equations',
      name_en: 'Isolate one symbol first',
      name_id: 'Cari satu lambang dulu',
    },

    trap: null,

    answer: {
      form: 'number',
      unit: null,
      value: String(c),
    },

    vocab: [],
  }
}
