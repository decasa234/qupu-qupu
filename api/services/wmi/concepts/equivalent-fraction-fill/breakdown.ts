import type { Breakdown, BreakdownHighlight } from '../types.js'
import { answer, type Params } from './index.js'

// Authored decomposition of an equivalent-fraction-fill problem: a known
// fraction equals a second fraction whose bottom number is given, and the
// learner must find the missing top number that keeps them equivalent.
// The learner-facing part is a set of color-coded, clickable highlights over
// the problem text. Each phrase MUST be a substring of the rendered body.
export function buildEquivalentFractionFillBreakdown(params: Params): Breakdown {
  const newDen = params.den * params.m
  const ans = answer(params)

  const highlights: BreakdownHighlight[] = [
    // facts — the fraction we already know, then the bottom number we are given
    {
      category: 'fact',
      phrase_en: `${params.num}/${params.den}`,
      phrase_id: `${params.num}/${params.den}`,
      note_en: `The fraction we already know: ${params.num} over ${params.den}.`,
      note_id: `Pecahan yang sudah diketahui: ${params.num} per ${params.den}.`,
    },
    {
      category: 'fact',
      phrase_en: String(newDen),
      phrase_id: String(newDen),
      note_en: `The new bottom number we are given.`,
      note_id: `Penyebut baru yang sudah diketahui.`,
    },
    // condition — the equals sign means the two fractions are equivalent
    {
      category: 'condition',
      phrase_en: '=',
      phrase_id: '=',
      note_en: `The two fractions must be equal, so they are the same amount.`,
      note_id: `Kedua pecahan harus sama, jadi nilainya sama besar.`,
    },
    // question — the missing top number marked by the question mark
    {
      category: 'question',
      phrase_en: '?',
      phrase_id: '?',
      note_en: `Find the missing top number.`,
      note_id: `Cari bilangan atas yang hilang.`,
    },
  ]

  return {
    needsVisual: false,
    highlights,

    quantities: [
      { label_en: 'Known fraction', label_id: 'Pecahan diketahui', value: `${params.num}/${params.den}` },
      { label_en: 'New denominator', label_id: 'Penyebut baru', value: String(newDen) },
      { label_en: 'Multiplier', label_id: 'Pengali', value: String(params.m) },
      { label_en: 'Answer', label_id: 'Jawaban', value: String(ans) },
    ],

    strategy: {
      conceptSlug: 'equivalent-fraction-fill',
      name_en: 'multiply top and bottom the same',
      name_id: 'kalikan atas dan bawah dengan angka yang sama',
    },

    trap: null,

    answer: {
      form: 'number',
      unit: null,
      value: String(ans),
    },

    vocab: [],
  }
}
