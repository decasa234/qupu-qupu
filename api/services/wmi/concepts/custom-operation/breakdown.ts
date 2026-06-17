import type { Breakdown, BreakdownHighlight } from '../types.js'
import { applyInferFormula, applyNestedFormula, formulaDef, type Params } from './index.js'

// Authored decomposition of a custom-operation problem.
//
// 'infer' mode: a ☼ symbol is shown with TWO worked examples; the learner
//   deduces the hidden rule and applies it to a third pair.
// 'nested' mode: the rule IS stated, but the learner must evaluate (a☼b)☼c —
//   two sequential substitutions from the inside out.
export function buildCustomOperationBreakdown(params: Params): Breakdown {
  if (params.mode === 'nested') {
    const inner = applyNestedFormula(params.formula, params.a, params.b)
    const answer = applyNestedFormula(params.formula, inner, params.c)
    const def = formulaDef(params.formula)
    const expr = `(${params.a} ☼ ${params.b}) ☼ ${params.c}`

    const highlights: BreakdownHighlight[] = [
      {
        category: 'condition',
        phrase_en: def,
        phrase_id: def,
        note_en: 'This is the rule — remember it for BOTH ☼ applications.',
        note_id: 'Ini adalah aturannya — ingat untuk KEDUA penerapan ☼.',
      },
      {
        category: 'fact',
        phrase_en: `${params.a} ☼ ${params.b}`,
        phrase_id: `${params.a} ☼ ${params.b}`,
        note_en: `Inner bracket — compute this first: result is ${inner}.`,
        note_id: `Kurung dalam — hitung ini dulu: hasilnya ${inner}.`,
      },
      {
        category: 'question',
        phrase_en: expr,
        phrase_id: expr,
        note_en: `Now apply ☼ to ${inner} and ${params.c}: answer is ${answer}.`,
        note_id: `Sekarang terapkan ☼ pada ${inner} dan ${params.c}: jawabannya ${answer}.`,
      },
    ]

    return {
      needsVisual: false,
      highlights,
      quantities: [
        { label_en: 'Rule', label_id: 'Aturan', value: def },
        { label_en: 'Inner step', label_id: 'Langkah dalam', value: `${params.a} ☼ ${params.b} = ${inner}` },
        { label_en: 'Outer step', label_id: 'Langkah luar', value: `${inner} ☼ ${params.c} = ${answer}` },
        { label_en: 'Answer', label_id: 'Jawaban', value: String(answer) },
      ],
      strategy: {
        conceptSlug: 'custom-operation',
        name_en: 'inside-out substitution',
        name_id: 'substitusi dari dalam ke luar',
      },
      trap: {
        wrong: String(applyNestedFormula(params.formula, params.a, params.c)),
        why_en: 'Do not skip the inner bracket — you must compute a☼b first, then use that result, not the original a.',
        why_id: 'Jangan lewati kurung dalam — kamu harus hitung a☼b dahulu, baru gunakan hasilnya, bukan a yang asli.',
      },
      answer: {
        form: 'number',
        unit: null,
        value: String(answer),
      },
      vocab: [],
    }
  }

  // 'infer' mode
  const ex1 = applyInferFormula(params.formula, params.e1, params.e2)
  const ex2 = applyInferFormula(params.formula, params.e3, params.e4)
  const answer = applyInferFormula(params.formula, params.c, params.d)

  const highlights: BreakdownHighlight[] = [
    {
      category: 'fact',
      phrase_en: `${params.e1} ☼ ${params.e2} = ${ex1}`,
      phrase_id: `${params.e1} ☼ ${params.e2} = ${ex1}`,
      note_en: `First example — study what ☼ does to ${params.e1} and ${params.e2}.`,
      note_id: `Contoh pertama — pelajari apa yang ☼ lakukan pada ${params.e1} dan ${params.e2}.`,
    },
    {
      category: 'fact',
      phrase_en: `${params.e3} ☼ ${params.e4} = ${ex2}`,
      phrase_id: `${params.e3} ☼ ${params.e4} = ${ex2}`,
      note_en: `Second example — verify your hypothesis with ${params.e3} and ${params.e4}.`,
      note_id: `Contoh kedua — verifikasi hipotesismu dengan ${params.e3} dan ${params.e4}.`,
    },
    {
      category: 'question',
      phrase_en: `${params.c} ☼ ${params.d} = ?`,
      phrase_id: `${params.c} ☼ ${params.d} = ?`,
      note_en: 'Apply the pattern you found from both examples.',
      note_id: 'Terapkan pola yang kamu temukan dari kedua contoh.',
    },
  ]

  return {
    needsVisual: false,
    highlights,
    quantities: [
      { label_en: 'Example 1', label_id: 'Contoh 1', value: `${params.e1} ☼ ${params.e2} = ${ex1}` },
      { label_en: 'Example 2', label_id: 'Contoh 2', value: `${params.e3} ☼ ${params.e4} = ${ex2}` },
      { label_en: 'Find', label_id: 'Cari', value: `${params.c} ☼ ${params.d}` },
      { label_en: 'Answer', label_id: 'Jawaban', value: String(answer) },
    ],
    strategy: {
      conceptSlug: 'custom-operation',
      name_en: 'pattern inference from examples',
      name_id: 'inferensi pola dari contoh',
    },
    trap: {
      wrong: String(params.c + params.d),
      why_en: 'Do not just add or subtract — study both examples carefully to find the actual rule.',
      why_id: 'Jangan hanya menjumlah atau mengurangi — pelajari kedua contoh dengan seksama untuk menemukan aturan yang sebenarnya.',
    },
    answer: {
      form: 'number',
      unit: null,
      value: String(answer),
    },
    vocab: [],
  }
}
