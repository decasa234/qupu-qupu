import type { Breakdown, BreakdownHighlight } from '../types.js'
import type { Params } from './index.js'

// Authored decomposition of a combination-product-sum problem: two whole numbers
// are pinned down by their sum AND their product; find the larger one. The
// learner-facing part is a set of color-coded, clickable highlights over the
// problem text. Each phrase MUST be a substring of the DISPLAY body (after
// section labels like "Find:"/"Cari:" are stripped).
export function buildCombinationProductSumBreakdown(params: Params): Breakdown {
  const sum = params.x + params.y
  const product = params.x * params.y
  const larger = params.y
  const smaller = params.x

  const highlights: BreakdownHighlight[] = [
    // facts — the two targets the pair must hit
    {
      category: 'fact',
      phrase_en: `sum of ${sum}`,
      phrase_id: `jumlah ${sum}`,
      note_en: `Added together the two numbers make ${sum}.`,
      note_id: `Bila dijumlahkan, kedua bilangan menjadi ${sum}.`,
    },
    {
      category: 'fact',
      phrase_en: `product of ${product}`,
      phrase_id: `hasil kali ${product}`,
      note_en: `Multiplied together they make ${product}.`,
      note_id: `Bila dikalikan, hasilnya ${product}.`,
    },
    // condition — both targets must be met by the SAME pair
    {
      category: 'condition',
      phrase_en: 'Two whole numbers',
      phrase_id: 'Dua bilangan bulat',
      note_en: `One pair must hit both: it sums to ${sum} and multiplies to ${product}.`,
      note_id: `Satu pasangan harus memenuhi keduanya: berjumlah ${sum} dan hasil kalinya ${product}.`,
    },
    // question — what to report
    {
      category: 'question',
      phrase_en: 'the larger of the two numbers',
      phrase_id: 'lebih besar',
      note_en: `Once you find the pair, answer with the bigger one (${larger}).`,
      note_id: `Setelah pasangannya ketemu, jawab dengan yang lebih besar (${larger}).`,
    },
  ]

  return {
    needsVisual: false,
    highlights,

    quantities: [
      { label_en: 'Sum', label_id: 'Jumlah', value: String(sum) },
      { label_en: 'Product', label_id: 'Hasil kali', value: String(product) },
      { label_en: 'Pair', label_id: 'Pasangan', value: `${smaller}, ${larger}` },
      { label_en: 'Answer', label_id: 'Jawaban', value: String(larger) },
    ],

    strategy: {
      conceptSlug: 'combination-product-sum',
      name_en: 'List sum pairs, check product',
      name_id: 'Daftar pasangan berjumlah, cek hasil kali',
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
