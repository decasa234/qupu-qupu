import type { Breakdown, BreakdownHighlight } from '../types.js'
import type { Params } from './index.js'

// Authored decomposition of a scale-read problem: read the value the arrow points
// to on a vertical numbered scale. This is figure-heavy — the scale and the arrow
// carry the data — so the stem text is short. We highlight only the words the kid
// actually sees in the body.
// Display body (no section labels, no [[glossary]] markup, so body === display):
//   EN: "What value is the arrow pointing to on the scale?"
//   ID: "Nilai berapa yang ditunjuk panah pada skala ini?"
// Each highlight phrase MUST be an exact substring of that display body.
export function buildScaleReadBreakdown(params: Params): Breakdown {
  // The scale shows 0..max with a numbered mark every max/5. The arrow lands on a
  // half-mark — exactly halfway between the two numbered marks that surround it.
  const step = params.max / 5
  const lower = Math.floor(params.value / step) * step
  const upper = lower + step

  const highlights: BreakdownHighlight[] = [
    // condition — where the pointer sits; read the scale at that spot
    {
      category: 'condition',
      phrase_en: 'the arrow pointing to',
      phrase_id: 'ditunjuk panah',
      note_en: 'Look at the spot the arrow points to and read the scale there.',
      note_id: 'Lihat tempat yang ditunjuk panah, lalu baca skala di situ.',
    },
    // fact — the numbered scale you read the value off of
    {
      category: 'fact',
      phrase_en: 'the scale',
      phrase_id: 'skala',
      note_en: `The scale is numbered 0 to ${params.max}, one number every ${step}.`,
      note_id: `Skala bernomor 0 sampai ${params.max}, tiap ${step} ada satu angka.`,
    },
    // question — what to find
    {
      category: 'question',
      phrase_en: 'What value',
      phrase_id: 'Nilai berapa',
      note_en: `The arrow is halfway between ${lower} and ${upper}, so the value is ${params.value}.`,
      note_id: `Panah ada di tengah-tengah ${lower} dan ${upper}, jadi nilainya ${params.value}.`,
    },
  ]

  return {
    needsVisual: true,
    highlights,

    quantities: [
      { label_en: 'Mark below', label_id: 'Angka di bawah', value: String(lower) },
      { label_en: 'Mark above', label_id: 'Angka di atas', value: String(upper) },
      { label_en: 'Value (half-mark)', label_id: 'Nilai (garis tengah)', value: String(params.value) },
      { label_en: 'Answer', label_id: 'Jawaban', value: String(params.value) },
    ],

    strategy: {
      conceptSlug: 'scale-read',
      name_en: 'Read the mark — find the value halfway between the two numbers',
      name_id: 'Baca garisnya — cari nilai tepat di tengah dua angka',
    },

    trap: null,

    answer: {
      form: 'number',
      unit: null,
      value: String(params.value),
    },

    vocab: [],
  }
}
