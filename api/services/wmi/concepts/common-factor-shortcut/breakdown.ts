import type { Breakdown, BreakdownHighlight } from '../types.js'
import { result, type Params } from './index.js'

// Authored decomposition of a common-factor-shortcut problem: a×c + b×c is
// easiest to compute by grouping the shared factor: (a+b)×c. The learner-facing
// part is a set of color-coded, clickable highlights over the problem text.
// Each phrase MUST be a substring of the rendered body.
export function buildCommonFactorBreakdown(params: Params): Breakdown {
  const { a, b, c } = params
  const sum = a + b
  const answer = result(params)
  const sharedFactor = `× ${c}`

  const highlights: BreakdownHighlight[] = [
    // facts — both terms share the same ×c factor
    {
      category: 'fact',
      phrase_en: sharedFactor,
      phrase_id: sharedFactor,
      note_en: `This term is multiplied by ${c}.`,
      note_id: `Suku ini dikalikan dengan ${c}.`,
    },
    {
      category: 'fact',
      phrase_en: sharedFactor,
      phrase_id: sharedFactor,
      note_en: `This term is also multiplied by ${c} — the same shared factor.`,
      note_id: `Suku ini juga dikalikan dengan ${c} — faktor yang sama.`,
    },
    // question — what to find
    {
      category: 'question',
      phrase_en: '?',
      phrase_id: '?',
      note_en: `Find the value of ${a} × ${c} + ${b} × ${c}.`,
      note_id: `Cari nilai dari ${a} × ${c} + ${b} × ${c}.`,
    },
  ]

  return {
    needsVisual: false,
    highlights,

    quantities: [
      { label_en: 'a', label_id: 'a', value: String(a) },
      { label_en: 'b', label_id: 'b', value: String(b) },
      { label_en: 'c', label_id: 'c', value: String(c) },
      { label_en: 'Answer', label_id: 'Jawaban', value: String(answer) },
    ],

    strategy: {
      conceptSlug: 'common-factor-shortcut',
      name_en: 'Group the shared factor',
      name_id: 'Kelompokkan faktor bersama',
    },

    trap: null,

    answer: {
      form: 'number',
      unit: null,
      value: String(answer),
    },

    vocab: [],
  }
}
