import type { Breakdown, BreakdownHighlight } from '../types.js'
import type { Params } from './index.js'

// Authored decomposition of a divisibility-multiple-property problem: four
// two-digit numbers are shown (in the choices) and the learner picks the one
// that is a multiple of d. The learner-facing part is a set of color-coded,
// clickable highlights over the problem text. Each phrase MUST be an exact
// substring of the DISPLAY body (after stripSectionLabels removes "Find:" /
// "Cari:" and resolves [[multiple|kelipatan]] -> "kelipatan"). The numbers live
// in the choices, so the machine brief carries the values every role binds to.
export function buildDivisibilityMultiplePropertyBreakdown(params: Params): Breakdown {
  const { d, options } = params
  const labels = ['A', 'B', 'C', 'D'] as const
  // Mirror render(): the correct option can sit at any position, so the answer
  // label is not always 'A'. answer.value MUST equal the choice label.
  const correctIdx = options.findIndex((n) => n % d === 0)
  const correct = options[correctIdx]
  const optionList = options.join(', ')

  const highlights: BreakdownHighlight[] = [
    // fact — the four numbers you can choose from
    {
      category: 'fact',
      phrase_en: 'Four two-digit numbers',
      phrase_id: 'Empat bilangan dua digit',
      note_en: `These are the choices: ${optionList}. One of them is a multiple of ${d}.`,
      note_id: `Inilah pilihannya: ${optionList}. Salah satunya adalah kelipatan ${d}.`,
    },
    // condition — the multiple/divisibility property to test
    {
      category: 'condition',
      phrase_en: `a multiple of ${d}`,
      phrase_id: `kelipatan ${d}`,
      note_en: `A multiple of ${d} can be divided by ${d} with no remainder.`,
      note_id: `Kelipatan ${d} bisa dibagi ${d} tanpa sisa.`,
    },
    // question — what to find
    {
      category: 'question',
      phrase_en: 'Which number',
      phrase_id: 'Bilangan manakah',
      note_en: `Find the one number that is a multiple of ${d} — it is ${correct}.`,
      note_id: `Cari satu bilangan yang merupakan kelipatan ${d} — yaitu ${correct}.`,
    },
  ]

  return {
    needsVisual: false,
    highlights,

    quantities: [
      { label_en: 'Divisor', label_id: 'Pembagi', value: String(d) },
      { label_en: 'Numbers', label_id: 'Bilangan', value: optionList },
      { label_en: 'Multiple', label_id: 'Kelipatan', value: String(correct) },
      { label_en: 'Answer', label_id: 'Jawaban', value: labels[correctIdx] },
    ],

    strategy: {
      conceptSlug: 'divisibility-multiple-property',
      name_en: 'Test each with the divisibility rule',
      name_id: 'Uji tiap pilihan dengan aturan keterbagian',
    },

    trap: null,

    answer: {
      form: 'choice',
      unit: null,
      value: labels[correctIdx],
    },

    vocab: [],
  }
}
