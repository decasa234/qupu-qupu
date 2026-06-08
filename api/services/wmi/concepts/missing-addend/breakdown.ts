import type { Breakdown, BreakdownHighlight } from '../types.js'
import { answer as solve, type Params } from './index.js'

// Authored decomposition of a missing-addend problem: ? + b = c, find the
// missing addend. The learner-facing part is a set of color-coded, clickable
// highlights over the problem text. Each phrase MUST be an exact substring of
// the DISPLAY body (after stripSectionLabels removes the "Find:" / "Cari:"
// label). There is no glossary markup, so the display body equals the rendered
// body with that label dropped.
export function buildMissingAddendBreakdown(params: Params): Breakdown {
  const { a, b } = params
  const sum = a + b
  const ans = solve(params) // the missing addend = a

  const highlights: BreakdownHighlight[] = [
    // fact — the known addend we already have
    {
      category: 'fact',
      phrase_en: `+ ${b}`,
      phrase_id: `+ ${b}`,
      note_en: `The part we already know — ${b}.`,
      note_id: `Bagian yang sudah diketahui — ${b}.`,
    },
    // fact — the total both parts make together
    {
      category: 'fact',
      phrase_en: `= ${sum}`,
      phrase_id: `= ${sum}`,
      note_en: `The whole — both parts add up to ${sum}.`,
      note_id: `Keseluruhan — kedua bagian berjumlah ${sum}.`,
    },
    // condition — the equation that ties the parts to the total
    {
      category: 'condition',
      phrase_en: `? + ${b} = ${sum}`,
      phrase_id: `? + ${b} = ${sum}`,
      note_en: `The missing number plus ${b} must equal ${sum}.`,
      note_id: `Bilangan yang hilang ditambah ${b} harus sama dengan ${sum}.`,
    },
    // question — what to find
    {
      category: 'question',
      phrase_en: 'What number is the question mark?',
      phrase_id: 'Bilangan apa yang menjadi tanda tanya?',
      note_en: `Take the total back apart: ${sum} − ${b} = ${ans}.`,
      note_id: `Pisahkan lagi totalnya: ${sum} − ${b} = ${ans}.`,
    },
  ]

  return {
    needsVisual: false,
    highlights,

    quantities: [
      { label_en: 'Known part', label_id: 'Bagian diketahui', value: String(b) },
      { label_en: 'Total', label_id: 'Total', value: String(sum) },
      { label_en: 'Answer', label_id: 'Jawaban', value: String(ans) },
    ],

    strategy: {
      conceptSlug: 'missing-addend',
      name_en: 'total − known part',
      name_id: 'total − bagian diketahui',
    },

    // No genuine tempting wrong answer: with only one known part and one total,
    // the inverse is the single sensible move.
    trap: null,

    answer: {
      form: 'number',
      unit: null,
      value: String(ans),
    },

    vocab: [],
  }
}
