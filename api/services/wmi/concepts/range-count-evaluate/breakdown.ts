import type { Breakdown, BreakdownHighlight } from '../types.js'
import { countInRange, type Params } from './index.js'

// Authored decomposition of a range-count-evaluate problem: evaluate a short
// list of expressions, then count how many results land inside the inclusive
// range [lo, hi]. The learner-facing part is a set of color-coded, clickable
// highlights over the problem text — each phrase MUST be an exact substring of
// the DISPLAY body (after stripping the "Find:"/"Cari:" labels).
export function buildRangeCountEvaluateBreakdown(params: Params): Breakdown {
  const { lo, hi, exprs } = params
  const answer = countInRange(params)
  const list = exprs.map((e) => `${e.x} ${e.op === '+' ? '+' : '−'} ${e.y}`).join(',  ')

  const highlights: BreakdownHighlight[] = [
    // fact — the two range bounds the result must sit inside.
    {
      category: 'fact',
      phrase_en: `between ${lo} and ${hi}`,
      phrase_id: `antara ${lo} dan ${hi}`,
      note_en: `The result has to be from ${lo} up to ${hi}.`,
      note_id: `Hasilnya harus dari ${lo} sampai ${hi}.`,
    },
    // condition — "inclusive" means the bounds themselves count.
    {
      category: 'condition',
      phrase_en: '(inclusive)',
      phrase_id: '(termasuk batas)',
      note_en: `${lo} and ${hi} count too — don't leave them out.`,
      note_id: `${lo} dan ${hi} ikut dihitung — jangan dilewati.`,
    },
    // question — what to count.
    {
      category: 'question',
      phrase_en: 'How many of the expressions below have a value',
      phrase_id: 'Berapa banyak ekspresi di bawah ini yang hasilnya bernilai',
      note_en: 'Count how many expressions land inside the range.',
      note_id: 'Hitung berapa ekspresi yang masuk dalam rentang.',
    },
  ]

  return {
    needsVisual: false,
    highlights,

    quantities: [
      { label_en: 'Range', label_id: 'Rentang', value: `${lo}–${hi}` },
      { label_en: 'Expressions', label_id: 'Ekspresi', value: list },
      { label_en: 'In range', label_id: 'Dalam rentang', value: String(answer) },
    ],

    strategy: {
      conceptSlug: 'range-count-evaluate',
      name_en: 'Evaluate, then count in range',
      name_id: 'Hitung dulu, lalu cacah dalam rentang',
    },

    // Off-by-one on the inclusive bounds is a real trap only when an expression
    // actually equals one of the bounds — then a solver who treats the range as
    // exclusive would miss it and undercount.
    trap: (() => {
      const onBound = exprs.filter((e) => {
        const v = e.op === '+' ? e.x + e.y : e.x - e.y
        return v === lo || v === hi
      })
      if (onBound.length === 0) return null
      return {
        wrong: String(answer - onBound.length),
        why_en: `${lo} and ${hi} are inside the range, so a result equal to a bound still counts.`,
        why_id: `${lo} dan ${hi} termasuk rentang, jadi hasil yang sama dengan batas tetap dihitung.`,
      }
    })(),

    answer: {
      form: 'number',
      unit: null,
      value: String(answer),
    },

    vocab: [],
  }
}
