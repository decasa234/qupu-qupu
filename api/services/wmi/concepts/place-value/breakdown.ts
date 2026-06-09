import type { Breakdown, BreakdownHighlight } from '../types.js'
import { solvePlaceValue, type Params } from './index.js'

// Authored decomposition of a place-value problem: find the VALUE of the tens
// digit (the digit × 10), not the digit itself. The learner-facing part is a set
// of color-coded, clickable highlights over the problem text. Each phrase MUST be
// an exact substring of the rendered body in that language.
export function buildPlaceValueBreakdown(params: Params): Breakdown {
  const { tensDigit, correct, answerLabel } = solvePlaceValue(params)

  const highlights: BreakdownHighlight[] = [
    // fact — the number we are looking at
    {
      category: 'fact',
      phrase_en: String(params.n),
      phrase_id: String(params.n),
      note_en: `The number to look at is ${params.n}.`,
      note_id: `Bilangan yang dilihat adalah ${params.n}.`,
    },
    // fact — the place that is being asked about
    {
      category: 'fact',
      phrase_en: 'tens digit',
      phrase_id: 'tempat puluhan',
      note_en: `The tens place is the left digit, ${tensDigit}.`,
      note_id: `Tempat puluhan adalah angka kiri, ${tensDigit}.`,
    },
    // question — what to find
    {
      category: 'question',
      phrase_en: 'the value of the tens digit',
      phrase_id: 'nilai angka di tempat puluhan',
      note_en: `Find its value: ${tensDigit} × 10 = ${correct}.`,
      note_id: `Cari nilainya: ${tensDigit} × 10 = ${correct}.`,
    },
  ]

  return {
    needsVisual: false,
    highlights,

    quantities: [
      { label_en: 'Number', label_id: 'Bilangan', value: String(params.n) },
      { label_en: 'Tens digit', label_id: 'Angka puluhan', value: String(tensDigit) },
      { label_en: 'Value', label_id: 'Nilai', value: String(correct) },
    ],

    strategy: {
      conceptSlug: 'place-value',
      name_en: 'Digit place × 10',
      name_id: 'Angka tempat × 10',
    },

    // Real misconception: answering the digit (${tensDigit}) instead of its
    // value (${correct} = the digit × 10).
    trap: {
      wrong: String(tensDigit),
      why_en: `${tensDigit} is the digit, not its value — the value is ${tensDigit} × 10 = ${correct}.`,
      why_id: `${tensDigit} adalah angkanya, bukan nilainya — nilainya ${tensDigit} × 10 = ${correct}.`,
    },

    answer: {
      form: 'choice',
      unit: null,
      value: String(answerLabel),
    },

    vocab: [],
  }
}
