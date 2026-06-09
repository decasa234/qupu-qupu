import type { Breakdown, BreakdownHighlight } from '../types.js'
import type { Params } from './index.js'

// Authored decomposition of a product-of-consecutive problem: two whole numbers
// that differ by 1 multiply to a known product; find the larger one. The
// learner-facing part is a set of color-coded, clickable highlights over the
// problem text. Each phrase MUST be a substring of the DISPLAY body (after the
// "Find:" / "Cari:" section labels are stripped).
export function buildProductOfConsecutiveBreakdown(params: Params): Breakdown {
  const n = params.k
  const product = n * (n + 1)
  const larger = n + 1

  const highlights: BreakdownHighlight[] = [
    // fact — the given product the two numbers multiply to
    {
      category: 'fact',
      phrase_en: String(product),
      phrase_id: String(product),
      note_en: `The two numbers multiply to ${product}.`,
      note_id: `Kedua bilangan dikalikan menjadi ${product}.`,
    },
    // condition — they are consecutive whole numbers (differ by 1)
    {
      category: 'condition',
      phrase_en: 'consecutive whole numbers',
      phrase_id: 'bilangan bulat berurutan',
      note_en: 'Consecutive means they differ by 1, like n and n + 1.',
      note_id: 'Berurutan berarti selisihnya 1, seperti n dan n + 1.',
    },
    // question — find the larger of the two
    {
      category: 'question',
      phrase_en: 'the larger of the two numbers',
      phrase_id: 'Bilangan yang lebih besar dari keduanya',
      note_en: 'Find the bigger number, which is n + 1.',
      note_id: 'Cari bilangan yang lebih besar, yaitu n + 1.',
    },
  ]

  return {
    needsVisual: false,
    highlights,

    quantities: [
      { label_en: 'Product', label_id: 'Hasil kali', value: String(product) },
      { label_en: 'Smaller number', label_id: 'Bilangan lebih kecil', value: String(n) },
      { label_en: 'Larger number', label_id: 'Bilangan lebih besar', value: String(larger) },
    ],

    strategy: {
      conceptSlug: 'product-of-consecutive',
      name_en: 'Estimate with the square root',
      name_id: 'Perkirakan dengan akar kuadrat',
    },

    trap: null,

    answer: {
      form: 'number',
      unit: null,
      value: String(larger),
    },

    vocab: [],
  }
}
