import type { Breakdown, BreakdownHighlight } from '../types.js'
import { evalExpr, exprText, type Expr, type Params } from './index.js'

// Authored decomposition of a which-expression-equals problem: four expressions
// are offered and the learner picks the one whose value equals the target.
// The learner-facing part is a set of color-coded, clickable highlights over the
// DISPLAY body. The body the kid sees is "Which expression equals <target>?"
// (en) / "Ekspresi manakah yang hasilnya <target>?" (id) — the "Find:"/"Cari:"
// section label is stripped before display, so phrases must come from what
// remains. Each phrase MUST be a substring of that rendered body.
export function buildWhichExpressionEqualsBreakdown(params: Params): Breakdown {
  const labels = ['A', 'B', 'C', 'D'] as const
  const target = params.target
  const correctIdx = params.exprs.findIndex((e: Expr) => evalExpr(e) === target)
  const correct = params.exprs[correctIdx]
  const answerLabel = labels[correctIdx]

  const optionList = params.exprs
    .map((e, i) => `${labels[i]}) ${exprText(e)}`)
    .join('  ')

  const highlights: BreakdownHighlight[] = [
    // fact — the target value the right expression must reach
    {
      category: 'fact',
      phrase_en: String(target),
      phrase_id: String(target),
      note_en: `The answer must work out to exactly ${target}.`,
      note_id: `Jawabannya harus tepat ${target}.`,
    },
    // question — what to do
    {
      category: 'question',
      phrase_en: 'Which expression equals',
      phrase_id: 'Ekspresi manakah yang hasilnya',
      note_en: 'Work out each option, then pick the one that matches.',
      note_id: 'Hitung tiap pilihan, lalu pilih yang cocok.',
    },
  ]

  return {
    needsVisual: false,
    highlights,

    quantities: [
      { label_en: 'Target', label_id: 'Target', value: String(target) },
      { label_en: 'Options', label_id: 'Pilihan', value: optionList },
      {
        label_en: 'Correct',
        label_id: 'Benar',
        value: `${answerLabel}) ${exprText(correct)} = ${target}`,
      },
    ],

    strategy: {
      conceptSlug: 'which-expression-equals',
      name_en: 'Compute each option',
      name_id: 'Hitung setiap pilihan',
    },

    trap: null,

    answer: {
      form: 'choice',
      unit: null,
      value: String(answerLabel),
    },

    vocab: [],
  }
}
