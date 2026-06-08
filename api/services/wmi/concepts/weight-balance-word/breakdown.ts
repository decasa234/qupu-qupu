import type { Breakdown, BreakdownHighlight } from '../types.js'
import type { Params } from './index.js'

// Authored decomposition of a weight-balance word problem: a bag of sugar plus
// several identical bottles sit on a balance scale; the total and the sugar's
// weight are known, and the learner must find one bottle's weight. The
// learner-facing part is a set of color-coded, clickable highlights over the
// problem text. Each phrase MUST be an exact substring of the DISPLAY body
// (after glossary markup is resolved and "Find:"/"Cari:" labels are stripped).
export function buildWeightBalanceWordBreakdown(params: Params): Breakdown {
  const total = params.sugar + params.bottles * params.perBottle
  const remaining = total - params.sugar

  const highlights: BreakdownHighlight[] = [
    // facts — the known weights and the count of identical bottles
    {
      category: 'fact',
      phrase_en: `${params.bottles} identical`,
      phrase_id: `${params.bottles}`,
      note_en: `There are ${params.bottles} bottles, and every one weighs the same.`,
      note_id: `Ada ${params.bottles} botol, dan beratnya sama semua.`,
    },
    {
      category: 'fact',
      phrase_en: `${total} g in total`,
      phrase_id: `${total} g`,
      note_en: `Everything together weighs ${total} g.`,
      note_id: `Semuanya bersama beratnya ${total} g.`,
    },
    {
      category: 'fact',
      phrase_en: `sugar alone weighs ${params.sugar} g`,
      phrase_id: `gula saja beratnya ${params.sugar} g`,
      note_en: `The sugar by itself weighs ${params.sugar} g.`,
      note_id: `Gula sendiri beratnya ${params.sugar} g.`,
    },
    // condition — the balance: the two sides weigh the same
    {
      category: 'condition',
      phrase_en: 'Together they weigh',
      phrase_id: 'Bersama-sama beratnya',
      note_en: `Sugar plus all the bottles balances to ${total} g.`,
      note_id: `Gula ditambah semua botol seimbang dengan ${total} g.`,
    },
    // question — the unknown weight of one bottle
    {
      category: 'question',
      phrase_en: 'one bottle of milk weigh',
      phrase_id: 'berat satu botol susu',
      note_en: 'Find the weight of a single bottle.',
      note_id: 'Cari berat satu botol saja.',
    },
  ]

  return {
    needsVisual: false,
    highlights,

    quantities: [
      { label_en: 'Total weight', label_id: 'Berat total', value: `${total} g` },
      { label_en: 'Sugar weight', label_id: 'Berat gula', value: `${params.sugar} g` },
      { label_en: 'Bottles', label_id: 'Jumlah botol', value: String(params.bottles) },
      { label_en: 'Answer', label_id: 'Jawaban', value: `${params.perBottle} g` },
    ],

    strategy: {
      conceptSlug: 'weight-balance-word',
      name_en: 'both sides equal',
      name_id: 'kedua sisi sama',
    },

    trap: {
      wrong: String(remaining),
      why_en: `${remaining} g is all the bottles together, not one — divide by ${params.bottles}.`,
      why_id: `${remaining} g adalah semua botol, bukan satu — bagi dengan ${params.bottles}.`,
    },

    answer: {
      form: 'number',
      unit: 'g',
      value: String(params.perBottle),
    },

    vocab: [],
  }
}
