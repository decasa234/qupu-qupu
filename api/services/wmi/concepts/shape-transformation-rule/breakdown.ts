import type { Breakdown, BreakdownHighlight } from '../types.js'
import { answer, type Params } from './index.js'

const LABELS = ['A', 'B', 'C', 'D'] as const
const OPTS = ['▲', '▶', '▼', '◀'] as const

// Authored decomposition of a shape-transformation-rule problem: a single
// transformation rule (turn one step clockwise, OR flip to the opposite
// direction) is stated, then applied to one shape — pick the resulting shape.
// The trick is to apply the SAME rule the problem gives, not guess. Each
// highlight phrase MUST be an exact substring of the DISPLAY body (here the
// body has no section labels, so display == raw body).
export function buildShapeTransformationRuleBreakdown(params: Params): Breakdown {
  const { shape, transform } = params
  const result = answer(params)
  const answerLabel = LABELS[OPTS.indexOf(result as (typeof OPTS)[number])]

  const ruleEN = transform === 'turn' ? 'turn one step clockwise' : 'flip to the opposite direction'
  const ruleID =
    transform === 'turn' ? 'putar satu langkah searah jarum jam' : 'balik ke arah berlawanan'

  const highlights: BreakdownHighlight[] = [
    // condition — the transformation rule you must obey
    {
      category: 'condition',
      phrase_en: ruleEN,
      phrase_id: ruleID,
      note_en:
        transform === 'turn'
          ? 'Rotate the shape a quarter-turn clockwise (one step).'
          : 'Mirror the shape to point the opposite way.',
      note_id:
        transform === 'turn'
          ? 'Putar bentuk seperempat putaran searah jarum jam (satu langkah).'
          : 'Cerminkan bentuk supaya menghadap arah sebaliknya.',
    },
    // question — apply the rule to this shape; which result comes out?
    {
      category: 'question',
      phrase_en: `Apply the rule to ${shape}`,
      phrase_id: `Terapkan pada ${shape}`,
      note_en: `Use the same rule once on ${shape} to get ${result} (choice ${answerLabel}).`,
      note_id: `Pakai aturan yang sama sekali pada ${shape} untuk mendapat ${result} (pilihan ${answerLabel}).`,
    },
  ]

  return {
    needsVisual: false,
    highlights,

    quantities: [
      { label_en: 'Starting shape', label_id: 'Bentuk awal', value: shape },
      {
        label_en: 'Rule',
        label_id: 'Aturan',
        value: transform === 'turn' ? 'turn clockwise' : 'flip',
      },
      { label_en: 'Result shape', label_id: 'Bentuk hasil', value: result },
      { label_en: 'Answer (choice)', label_id: 'Jawaban (pilihan)', value: answerLabel },
    ],

    strategy: {
      conceptSlug: 'shape-transformation-rule',
      name_en: 'Apply the stated rule to the shape',
      name_id: 'Terapkan aturan yang diberikan pada bentuk',
    },

    // No single fixed tempting wrong answer: the common slip is turning the
    // wrong way or applying the rule twice, and that wrong shape changes with
    // the parameters, so there is no one stable trap value.
    trap: null,

    answer: {
      form: 'choice',
      unit: null,
      value: answerLabel,
    },

    vocab: [],
  }
}
