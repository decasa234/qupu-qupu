import type { Breakdown, BreakdownHighlight } from '../types.js'
import { boxesNeeded, type Params } from './index.js'

// Authored decomposition of a container-capacity-allocation problem: find the
// minimum number of boxes needed to pack `total` eggs at `capacity` per box —
// the CEILING of total / capacity, since a leftover still needs its own box.
export function buildContainerBreakdown(params: Params): Breakdown {
  const { total, capacity } = params
  const answer = boxesNeeded(params)
  const floor = Math.floor(total / capacity)
  const remainder = total % capacity

  const highlights: BreakdownHighlight[] = [
    {
      category: 'fact',
      phrase_en: `${total} eggs`,
      phrase_id: `${total} telur`,
      note_en: `The total number of eggs that need packing.`,
      note_id: `Jumlah total telur yang perlu dikemas.`,
    },
    {
      category: 'condition',
      phrase_en: `holds ${capacity}`,
      phrase_id: `memuat ${capacity}`,
      note_en: `Each box can only hold ${capacity} eggs.`,
      note_id: `Setiap kotak hanya bisa memuat ${capacity} telur.`,
    },
    {
      category: 'question',
      phrase_en: 'How many boxes',
      phrase_id: 'Berapa kotak',
      note_en: 'Find the minimum number of boxes so every egg is packed — no egg left out.',
      note_id: 'Cari jumlah kotak paling sedikit agar semua telur terkemas — tidak ada yang tersisa.',
    },
  ]

  return {
    needsVisual: false,
    highlights,

    quantities: [
      { label_en: 'Total eggs', label_id: 'Total telur', value: String(total) },
      { label_en: 'Capacity per box', label_id: 'Kapasitas per kotak', value: String(capacity) },
      { label_en: 'Answer', label_id: 'Jawaban', value: String(answer) },
    ],

    strategy: {
      conceptSlug: 'container-capacity-allocation',
      name_en: 'Divide, then round up for the leftover',
      name_id: 'Bagi, lalu bulatkan ke atas untuk sisa',
    },

    trap: {
      wrong: String(floor),
      why_en: `${total} ÷ ${capacity} = ${floor} remainder ${remainder} — forgetting the leftover ${remainder} eggs still need a box.`,
      why_id: `${total} ÷ ${capacity} = ${floor} sisa ${remainder} — lupa bahwa sisa ${remainder} telur tetap butuh sebuah kotak.`,
    },

    answer: {
      form: 'number',
      unit: null,
      value: String(answer),
    },

    vocab: [],
  }
}
