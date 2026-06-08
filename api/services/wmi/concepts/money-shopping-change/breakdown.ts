import type { Breakdown, BreakdownHighlight } from '../types.js'
import type { Params } from './index.js'

// Authored decomposition of a money-shopping-change problem: someone buys one
// item at a known price, pays a larger amount, and we find the change.
// The learner-facing part is a set of color-coded, clickable highlights over the
// problem text. Each phrase MUST be a substring of the rendered (display) body.
export function buildMoneyShoppingChangeBreakdown(params: Params): Breakdown {
  const change = params.pay - params.cost

  const highlights: BreakdownHighlight[] = [
    // fact — the price of the item
    {
      category: 'fact',
      phrase_en: `priced at $${params.cost}`,
      phrase_id: `seharga $${params.cost}`,
      note_en: `The ${params.item_en} costs $${params.cost}.`,
      note_id: `${params.item_id} itu berharga $${params.cost}.`,
    },
    // fact — the amount handed to the cashier
    {
      category: 'fact',
      phrase_en: `pays the cashier $${params.pay}`,
      phrase_id: `membayar kasir dengan $${params.pay}`,
      note_en: `${params.name} gives the cashier $${params.pay}.`,
      note_id: `${params.name} memberi kasir $${params.pay}.`,
    },
    // condition — the change relationship (paid is more than the price)
    {
      category: 'condition',
      phrase_en: 'change',
      phrase_id: 'kembalian',
      note_en: 'Change is the money paid that is left after the price.',
      note_id: 'Kembalian adalah sisa uang setelah dipakai membayar harga.',
    },
    // question — what to find
    {
      category: 'question',
      phrase_en: 'How much change',
      phrase_id: 'Berapa uang kembalian',
      note_en: 'Find the change: amount paid minus the price.',
      note_id: 'Cari kembalian: uang dibayar dikurangi harga.',
    },
  ]

  return {
    needsVisual: false,
    highlights,

    quantities: [
      { label_en: 'Price', label_id: 'Harga', value: String(params.cost) },
      { label_en: 'Paid', label_id: 'Dibayar', value: String(params.pay) },
      { label_en: 'Change', label_id: 'Kembalian', value: String(change) },
    ],

    strategy: {
      conceptSlug: 'money-shopping-change',
      name_en: 'paid − price',
      name_id: 'dibayar − harga',
    },

    // Natural trap: handing back the amount paid (or naming the price) instead
    // of subtracting to find the change.
    trap: {
      wrong: String(params.pay),
      why_en: `${params.pay} is the money paid, not the change. Subtract the price: ${params.pay} − ${params.cost} = ${change}.`,
      why_id: `${params.pay} itu uang yang dibayar, bukan kembalian. Kurangi harga: ${params.pay} − ${params.cost} = ${change}.`,
    },

    answer: {
      form: 'number',
      unit: null,
      value: String(change),
    },

    vocab: [],
  }
}
