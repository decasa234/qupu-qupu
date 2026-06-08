import type { Breakdown, BreakdownHighlight } from '../types.js'
import { evaluate, type Params } from './index.js'

// Authored decomposition of an arithmetic-expression-eval problem: compute the
// value of one expression. The learner-facing part is a set of color-coded,
// clickable highlights over the problem text. Each phrase MUST be a substring of
// the DISPLAY body (after stripping the "Find:"/"Cari:" label). No glossary markup
// is used here, so phrases are the literal numbers and operators.
export function buildArithmeticExpressionEvalBreakdown(params: Params): Breakdown {
  const p = params
  const answer = evaluate(p)
  const times = '×'

  // The expression exactly as it appears in the rendered body.
  const exprStr =
    p.mode === 'sum-list'
      ? `${p.a} + ${p.b} + ${p.c} + ${p.d}`
      : p.mode === 'product-plus'
        ? `${p.a} ${times} ${p.b} + ${p.c}`
        : `${p.a} ${times} ${p.b} − ${p.c} ${times} ${p.d}`

  const usesPrecedence = p.mode !== 'sum-list'

  const highlights: BreakdownHighlight[] = [
    // fact — the whole expression to evaluate
    {
      category: 'fact',
      phrase_en: exprStr,
      phrase_id: exprStr,
      note_en: 'These are the numbers and signs you must work out.',
      note_id: 'Ini bilangan dan tandanya yang harus kamu hitung.',
    },
  ]

  // condition — order of operations, ONLY when the expression mixes × with + or −.
  if (usesPrecedence) {
    highlights.push({
      category: 'condition',
      phrase_en: times,
      phrase_id: times,
      note_en: 'Do the multiplication first, before you add or subtract.',
      note_id: 'Kerjakan perkalian dulu, sebelum menambah atau mengurangi.',
    })
  }

  // question — what to do with the expression.
  highlights.push({
    category: 'question',
    phrase_en: 'Compute',
    phrase_id: 'Hitunglah',
    note_en: 'Find the value of the whole expression.',
    note_id: 'Cari nilai dari seluruh ekspresi.',
  })

  // The classic trap: working strictly left-to-right ignores precedence.
  let trap: Breakdown['trap'] = null
  if (p.mode === 'product-plus') {
    // (a × b) + c done left-to-right: a × (b + c)
    const leftToRight = p.a * (p.b + p.c)
    if (leftToRight !== answer) {
      trap = {
        wrong: String(leftToRight),
        why_en: `Going left to right gives ${p.a} × ${p.b + p.c} = ${leftToRight}, but × comes first.`,
        why_id: `Dari kiri ke kanan jadi ${p.a} × ${p.b + p.c} = ${leftToRight}, padahal × dulu.`,
      }
    }
  } else if (p.mode === 'product-diff') {
    // a × b − c × d done left-to-right: ((a × b) − c) × d
    const leftToRight = (p.a * p.b - p.c) * p.d
    if (leftToRight !== answer) {
      trap = {
        wrong: String(leftToRight),
        why_en: `Going left to right gives ((${p.a} × ${p.b} − ${p.c}) × ${p.d}) = ${leftToRight}, but do both × first.`,
        why_id: `Dari kiri ke kanan jadi ((${p.a} × ${p.b} − ${p.c}) × ${p.d}) = ${leftToRight}, padahal kedua × dulu.`,
      }
    }
  }

  return {
    needsVisual: false,
    highlights,

    quantities: [
      { label_en: 'Expression', label_id: 'Ekspresi', value: exprStr },
      { label_en: 'Answer', label_id: 'Jawaban', value: String(answer) },
    ],

    strategy: {
      conceptSlug: 'arithmetic-expression-eval',
      name_en: usesPrecedence ? 'Multiply first, then add or subtract' : 'Group into easy pairs',
      name_id: usesPrecedence ? 'Kalikan dulu, lalu tambah atau kurang' : 'Kelompokkan jadi pasangan mudah',
    },

    trap,

    answer: {
      form: 'number',
      unit: null,
      value: String(answer),
    },

    vocab: [],
  }
}
