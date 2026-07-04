import type { Breakdown, BreakdownHighlight } from '../types.js'
import { evalExpr, exprText, type Params } from './index.js'

// Authored decomposition of a rank-computed-expressions problem: four
// expressions are offered and the learner picks the one with the greatest
// computed value. The learner-facing part is a set of color-coded, clickable
// highlights over the rendered body. Each phrase MUST be a substring of that
// rendered body.
export function buildRankBreakdown(params: Params): Breakdown {
  const labels = ['A', 'B', 'C', 'D'] as const
  const values = params.exprs.map(evalExpr)
  const maxIdx = values.indexOf(Math.max(...values))
  const answerLabel = labels[maxIdx]

  const optionList = params.exprs.map((e, i) => `${labels[i]}) ${exprText(e)}`).join('  ')

  // The trap: the expression whose OPERANDS look the biggest (largest a+b),
  // but whose computed value is not actually the largest.
  const operandSums = params.exprs.map((e) => e.a + e.b)
  const bigOperandIdx = operandSums.indexOf(Math.max(...operandSums))
  const trap =
    bigOperandIdx !== maxIdx
      ? {
          wrong: labels[bigOperandIdx],
          why_en: `${exprText(params.exprs[bigOperandIdx])} looks big but equals ${values[bigOperandIdx]}, which is less than ${values[maxIdx]}.`,
          why_id: `${exprText(params.exprs[bigOperandIdx])} terlihat besar tetapi hasilnya ${values[bigOperandIdx]}, lebih kecil dari ${values[maxIdx]}.`,
        }
      : null

  const highlights: BreakdownHighlight[] = [
    // fact — you're given four expressions to evaluate (their text lives in
    // the choices, not the body, so the highlight anchors on the instruction).
    {
      category: 'fact',
      phrase_en: 'each expression',
      phrase_id: 'setiap ekspresi',
      note_en: `There are four expressions to choose from: ${params.exprs.map((e, i) => `${labels[i]}) ${exprText(e)}`).join(', ')}.`,
      note_id: `Ada empat ekspresi untuk dipilih: ${params.exprs.map((e, i) => `${labels[i]}) ${exprText(e)}`).join(', ')}.`,
    },
    // condition — must compute before comparing
    {
      category: 'condition',
      phrase_en: 'Work out each expression',
      phrase_id: 'Hitung setiap ekspresi',
      note_en: 'You must compute the value of every expression before comparing them.',
      note_id: 'Kamu harus menghitung nilai setiap ekspresi sebelum membandingkannya.',
    },
    // question — what to find
    {
      category: 'question',
      phrase_en: 'the largest',
      phrase_id: 'paling besar',
      note_en: 'Find the expression whose computed value is the greatest.',
      note_id: 'Cari ekspresi dengan nilai hasil hitung yang paling besar.',
    },
    {
      category: 'question',
      phrase_en: 'greatest value',
      phrase_id: 'nilainya paling besar',
      note_en: 'The answer is the one with the biggest result, not the biggest-looking numbers.',
      note_id: 'Jawabannya adalah yang hasilnya paling besar, bukan yang angkanya terlihat paling besar.',
    },
  ]

  return {
    needsVisual: false,
    highlights,

    quantities: [
      { label_en: 'Options', label_id: 'Pilihan', value: optionList },
      {
        label_en: 'Values',
        label_id: 'Nilai',
        value: params.exprs.map((_, i) => `${labels[i]}=${values[i]}`).join(', '),
      },
      { label_en: 'Answer', label_id: 'Jawaban', value: `${answerLabel}) ${exprText(params.exprs[maxIdx])} = ${values[maxIdx]}` },
    ],

    strategy: {
      conceptSlug: 'rank-computed-expressions',
      name_en: 'Compute then compare',
      name_id: 'Hitung lalu bandingkan',
    },

    trap,

    answer: {
      form: 'choice',
      unit: null,
      value: answerLabel,
    },

    vocab: [],
  }
}
