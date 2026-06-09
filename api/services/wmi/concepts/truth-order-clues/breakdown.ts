import type { Breakdown, BreakdownHighlight } from '../types.js'
import { answer as firstName, shownClues, type Params } from './index.js'

// Authored decomposition of a truth-order-clues problem: a handful of scrambled
// "X is before Y" clues that together fix one line-up. The learner has to link
// the clues end to end into a single chain, then read off whoever sits at the
// front. Each highlight phrase MUST be an exact substring of the DISPLAY body
// (after stripSectionLabels removes the "Find:" / "Cari:" markers).
export function buildTruthOrderCluesBreakdown(params: Params): Breakdown {
  const clues = shownClues(params)
  const first = firstName(params) // the name that ends up at the front
  const chain = params.order.join(' → ')

  // One clickable clue per comparison. Each phrase is the full sentence exactly
  // as it appears in the body (e.g. "Amy is before Ben."), so it always matches.
  const clueHighlights: BreakdownHighlight[] = clues.map(([a, b]) => ({
    category: 'condition' as const,
    phrase_en: `${a} is before ${b}.`,
    phrase_id: `${a} berada sebelum ${b}.`,
    note_en: `${a} stands somewhere in front of ${b}.`,
    note_id: `${a} berdiri di depan ${b}.`,
  }))

  const highlights: BreakdownHighlight[] = [
    ...clueHighlights,
    // question — what to find
    {
      category: 'question',
      phrase_en: 'Who is first?',
      phrase_id: 'Siapa yang pertama?',
      note_en: 'Link the clues into one line, then read who is at the very front.',
      note_id: 'Sambungkan petunjuk jadi satu barisan, lalu lihat siapa paling depan.',
    },
  ]

  return {
    needsVisual: false,
    highlights,

    quantities: [
      { label_en: 'Number of clues', label_id: 'Jumlah petunjuk', value: String(clues.length) },
      { label_en: 'Full line-up', label_id: 'Barisan lengkap', value: chain },
      { label_en: 'Answer (first)', label_id: 'Jawaban (pertama)', value: first },
    ],

    strategy: {
      conceptSlug: 'truth-order-clues',
      name_en: 'line them up from the clues',
      name_id: 'baris dari petunjuk',
    },

    // No single stable tempting wrong answer: which name is the "almost right"
    // slip depends on the scramble, so there is no one trap value to name.
    trap: null,

    answer: {
      form: 'unit',
      unit: null,
      value: first,
    },

    vocab: [],
  }
}
