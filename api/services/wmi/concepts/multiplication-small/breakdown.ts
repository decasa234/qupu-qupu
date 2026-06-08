import type { Breakdown, BreakdownHighlight } from '../types.js'
import type { Params } from './index.js'

// Authored decomposition of a small-multiplication problem: multiply two
// single-digit factors (2..5). The learner-facing part is a set of color-coded,
// clickable highlights over the problem text. Each phrase MUST be an exact
// substring of the rendered body (`body_en` / `body_id`).
export function buildMultiplicationSmallBreakdown(params: Params): Breakdown {
  const { a, b } = params
  const product = a * b
  // The two factors always appear together as "a × b" in both bodies — one
  // unambiguous substring even when a === b (e.g. "2 × 2"), so highlighting the
  // whole expression avoids duplicate-phrase collisions.
  const factors = `${a} × ${b}`

  const highlights: BreakdownHighlight[] = [
    {
      category: 'fact',
      phrase_en: factors,
      phrase_id: factors,
      note_en: `The two numbers to multiply: ${a} groups of ${b}.`,
      note_id: `Dua angka yang dikalikan: ${a} kelompok berisi ${b}.`,
    },
    {
      category: 'question',
      phrase_en: 'What is',
      phrase_id: 'Berapa',
      note_en: 'Find the product — the total of all the groups together.',
      note_id: 'Cari hasil kalinya — jumlah semua kelompok digabung.',
    },
  ]

  return {
    needsVisual: false,
    highlights,

    quantities: [
      { label_en: 'First factor', label_id: 'Faktor pertama', value: String(a) },
      { label_en: 'Second factor', label_id: 'Faktor kedua', value: String(b) },
      { label_en: 'Product', label_id: 'Hasil kali', value: String(product) },
    ],

    strategy: {
      conceptSlug: 'multiplication-small',
      name_en: 'Skip-count equal groups',
      name_id: 'Hitung lompat kelompok sama',
    },

    trap: null,

    answer: {
      form: 'number',
      unit: null,
      value: String(product),
    },

    vocab: [],
  }
}
