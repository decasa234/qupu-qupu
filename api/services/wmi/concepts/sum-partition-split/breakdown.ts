import type { Breakdown, BreakdownHighlight } from '../types.js'
import type { Params } from './index.js'

// Authored decomposition of a sum-partition-split problem: a known total is
// shared between two people so that one share is k times the other. The learner
// has to split the total into (k + 1) equal parts and report the size of one part
// (Rina's share). The learner-facing part is a set of color-coded, clickable
// highlights over the problem text; every phrase MUST be an exact substring of
// the DISPLAY body (after section labels are stripped) in that language.
export function buildSumPartitionSplitBreakdown(params: Params): Breakdown {
  const total = (params.k + 1) * params.small
  const parts = params.k + 1
  const answer = params.small

  const highlights: BreakdownHighlight[] = [
    // fact — the total being shared
    {
      category: 'fact',
      phrase_en: `${total} stickers`,
      phrase_id: `${total} stiker`,
      note_en: `${total} stickers are shared in total.`,
      note_id: `Ada ${total} stiker yang dibagi seluruhnya.`,
    },
    // condition — the split rule (Doni gets k times Rina's share)
    {
      category: 'condition',
      phrase_en: `exactly ${params.k} times as many stickers as Rina`,
      phrase_id: `tepat ${params.k} kali lebih banyak stiker daripada Rina`,
      note_en: `Rina is 1 part and Doni is ${params.k} parts, so there are ${parts} equal parts.`,
      note_id: `Rina 1 bagian dan Doni ${params.k} bagian, jadi ada ${parts} bagian sama.`,
    },
    // question — the unknown part to find
    {
      category: 'question',
      phrase_en: 'How many stickers does Rina receive',
      phrase_id: 'Berapa stiker yang diterima Rina',
      note_en: `Find one part: ${total} ÷ ${parts} = ${answer}.`,
      note_id: `Cari satu bagian: ${total} ÷ ${parts} = ${answer}.`,
    },
  ]

  return {
    needsVisual: false,
    highlights,

    quantities: [
      { label_en: 'Total', label_id: 'Total', value: String(total) },
      { label_en: 'Equal parts', label_id: 'Bagian sama', value: String(parts) },
      { label_en: "Rina's share", label_id: 'Bagian Rina', value: String(answer) },
    ],

    strategy: {
      conceptSlug: 'sum-partition-split',
      name_en: 'Split the total into equal parts',
      name_id: 'Bagi total menjadi bagian sama',
    },

    // No genuine tempting wrong answer: the split is a single clean division.
    trap: null,

    answer: {
      form: 'number',
      unit: null,
      value: String(answer),
    },

    vocab: [],
  }
}
