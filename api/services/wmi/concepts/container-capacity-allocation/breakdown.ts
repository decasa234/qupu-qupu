import type { Breakdown, BreakdownHighlight, BreakdownQuantity } from '../types.js'
import { answerLabel, boxesNeeded, distractors, optionValues, type Params } from './index.js'

// Authored decomposition of a container-capacity-allocation problem: find the
// minimum number of boxes needed to pack `total` eggs at `capacity` per box —
// the CEILING of total / capacity, since a leftover still needs its own box.
//
// Multiple choice: the four options are the true count plus three named
// misconceptions (see `distractors`), so `answer.form` is 'choice' and the
// stored answer is the LETTER the true count sorts onto — never a fixed slot.
export function buildContainerBreakdown(params: Params): Breakdown {
  const { total, capacity } = params
  const answer = boxesNeeded(params)
  const floor = Math.floor(total / capacity)
  const remainder = total % capacity
  const label = answerLabel(params)
  // `floorMiss` is in every option set, so the trap always names a real option.
  const floorMiss = distractors(params).find((d) => d.kind === 'floorMiss')?.value ?? floor

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

  const quantities: BreakdownQuantity[] = [
    { label_en: 'Total eggs', label_id: 'Total telur', value: String(total) },
    { label_en: 'Capacity per box', label_id: 'Kapasitas per kotak', value: String(capacity) },
    { label_en: 'Full boxes', label_id: 'Kotak penuh', value: String(floor) },
    { label_en: 'Left over', label_id: 'Sisa', value: String(remainder) },
    { label_en: 'Boxes needed', label_id: 'Kotak diperlukan', value: String(answer) },
    { label_en: 'Options', label_id: 'Pilihan', value: optionValues(params).join(', ') },
    { label_en: 'Answer', label_id: 'Jawaban', value: label },
  ]

  return {
    needsVisual: false,
    highlights,
    quantities,

    strategy: {
      conceptSlug: 'container-capacity-allocation',
      name_en: 'Divide, then round up for the leftover',
      name_id: 'Bagi, lalu bulatkan ke atas untuk sisa',
    },

    // The headline misconception, and the option that exists to catch it:
    // dividing and stopping at the quotient.
    trap: {
      wrong: String(floorMiss),
      why_en: `${total} ÷ ${capacity} = ${floor} remainder ${remainder} — forgetting the leftover ${remainder} eggs still need a box.`,
      why_id: `${total} ÷ ${capacity} = ${floor} sisa ${remainder} — lupa bahwa sisa ${remainder} telur tetap butuh sebuah kotak.`,
    },

    answer: {
      form: 'choice',
      unit: null,
      value: label,
    },

    vocab: [],
  }
}
