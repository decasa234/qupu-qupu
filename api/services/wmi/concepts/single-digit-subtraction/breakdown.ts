import type { Breakdown, BreakdownHighlight } from '../types.js'
import type { Params } from './index.js'

// Authored decomposition of a single-digit-subtraction problem: take a smaller
// one-digit number away from a bigger one. The learner-facing part is a set of
// color-coded, clickable highlights over the problem text. Each phrase MUST be a
// substring of the rendered body.
export function buildSingleDigitSubtractionBreakdown(params: Params): Breakdown {
  const { a, b } = params
  const left = a - b
  const sum = a + b

  // Facts: the whole (a) and the part taken away (b). Highlight them as the exact
  // operands inside the "${a} − ${b}" string so the spans light up in the body.
  const minus = `${a} − ${b}`
  const highlights: BreakdownHighlight[] = [
    {
      category: 'fact',
      phrase_en: String(a),
      phrase_id: String(a),
      note_en: `The whole you start with is ${a}.`,
      note_id: `Keseluruhan yang kamu mulai adalah ${a}.`,
    },
    {
      category: 'fact',
      phrase_en: String(b),
      phrase_id: String(b),
      note_en: `${b} is the part you take away.`,
      note_id: `${b} adalah bagian yang kamu ambil.`,
    },
    {
      category: 'question',
      phrase_en: `What is ${minus}?`,
      phrase_id: `Berapa ${minus}?`,
      note_en: `Take ${b} away from ${a} to find how many are left.`,
      note_id: `Ambil ${b} dari ${a} untuk tahu berapa yang tersisa.`,
    },
  ]

  return {
    needsVisual: false,
    highlights,

    quantities: [
      { label_en: 'Whole', label_id: 'Keseluruhan', value: String(a) },
      { label_en: 'Take away', label_id: 'Diambil', value: String(b) },
      { label_en: 'Answer', label_id: 'Jawaban', value: String(left) },
    ],

    strategy: {
      conceptSlug: 'single-digit-subtraction',
      name_en: 'Take the part away from the whole',
      name_id: 'Ambil sebagian dari keseluruhan',
    },

    // Real misconception at this age: adding instead of subtracting. That gives a
    // concrete, tempting wrong number (a + b).
    trap: {
      wrong: String(sum),
      why_en: `${a} + ${b} = ${sum} adds instead of taking away. You must subtract: ${a} − ${b} = ${left}.`,
      why_id: `${a} + ${b} = ${sum} itu menjumlah, bukan mengurangi. Harus dikurangi: ${a} − ${b} = ${left}.`,
    },

    answer: {
      form: 'number',
      unit: null,
      value: String(left),
    },

    vocab: [],
  }
}
