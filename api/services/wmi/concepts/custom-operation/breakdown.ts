import type { Breakdown, BreakdownHighlight } from '../types.js'
import { applyFormula, formulaDef, type Params } from './index.js'

// Authored decomposition of a custom-operation problem: a made-up operator
// (e.g. a ★ b) is defined by a rule and shown with one worked example; the
// learner must plug their two numbers into the SAME rule. The learner-facing
// part is a set of color-coded, clickable highlights over the problem text.
// Each phrase MUST be a substring of the DISPLAY body — the body after section
// labels ("Example:", "Find:") are stripped. There is no [[glossary]] markup
// here, so the display body equals the raw body minus those labels.
export function buildCustomOperationBreakdown(params: Params): Breakdown {
  const def = formulaDef(params.formula)
  const example = applyFormula(params.formula, params.e1, params.e2)
  const answer = applyFormula(params.formula, params.c, params.d)

  const highlights: BreakdownHighlight[] = [
    // condition — the rule that defines the new operator
    {
      category: 'condition',
      phrase_en: def,
      phrase_id: def,
      note_en: 'This rule tells you what ★ does — always follow it exactly.',
      note_id: 'Aturan ini memberi tahu apa arti ★ — ikuti persis.',
    },
    // fact — the worked example to copy
    {
      category: 'fact',
      phrase_en: `${params.e1} ★ ${params.e2} = ${example}`,
      phrase_id: `${params.e1} ★ ${params.e2} = ${example}`,
      note_en: `The rule used on ${params.e1} and ${params.e2} gives ${example}.`,
      note_id: `Aturan dipakai pada ${params.e1} dan ${params.e2} menghasilkan ${example}.`,
    },
    // fact — the two numbers you must use
    {
      category: 'fact',
      phrase_en: String(params.c),
      phrase_id: String(params.c),
      note_en: `Your first number — put it where a goes.`,
      note_id: `Bilangan pertamamu — letakkan di tempat a.`,
    },
    {
      category: 'fact',
      phrase_en: String(params.d),
      phrase_id: String(params.d),
      note_en: `Your second number — put it where b goes.`,
      note_id: `Bilangan keduamu — letakkan di tempat b.`,
    },
    // question — the expression to evaluate
    {
      category: 'question',
      phrase_en: `Compute ${params.c} ★ ${params.d}`,
      phrase_id: `Hitunglah ${params.c} ★ ${params.d}`,
      note_en: 'Plug these two numbers into the rule, just like the example.',
      note_id: 'Masukkan dua bilangan ini ke aturan, seperti contoh.',
    },
  ]

  return {
    needsVisual: false,
    highlights,

    quantities: [
      { label_en: 'Rule', label_id: 'Aturan', value: def },
      {
        label_en: 'Example',
        label_id: 'Contoh',
        value: `${params.e1} ★ ${params.e2} = ${example}`,
      },
      {
        label_en: 'Your numbers',
        label_id: 'Bilanganmu',
        value: `${params.c}, ${params.d}`,
      },
      { label_en: 'Answer', label_id: 'Jawaban', value: String(answer) },
    ],

    strategy: {
      conceptSlug: 'custom-operation',
      name_en: 'follow the rule',
      name_id: 'ikuti aturannya',
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
