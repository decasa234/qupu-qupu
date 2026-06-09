import type { Breakdown, BreakdownHighlight } from '../types.js'
import type { Params } from './index.js'

// Authored decomposition of a perimeter-of-a-square problem: a square has four
// equal sides, so the perimeter is the side length added four times (side × 4).
// The learner-facing part is a set of color-coded, clickable highlights over the
// problem text. Each phrase MUST be a substring of the DISPLAY body (glossary
// [[slug|label]] markup resolves to its label), so the question highlight uses
// "perimeter" / "keliling", not the raw markup.
export function buildShapePerimeterSquareBreakdown(params: Params): Breakdown {
  const side = params.side
  const correct = side * 4

  // Mirror render(): choices are [correct, ...distractors] sliced to 4, labelled
  // A–D. The answer is the label sitting on the correct perimeter.
  const distractors = [correct - 1, correct + 1, side * 2].filter(
    (v) => v > 0 && v !== correct,
  )
  const labels = ['A', 'B', 'C', 'D'] as const
  const values = [correct, ...distractors].slice(0, 4)
  while (values.length < 4) values.push(values[values.length - 1] + 2)
  const answerLabel = labels[values.indexOf(correct)]

  const highlights: BreakdownHighlight[] = [
    // fact — the length of one side
    {
      category: 'fact',
      phrase_en: `${side} cm`,
      phrase_id: `${side} cm`,
      note_en: `Each side of the square is ${side} cm long.`,
      note_id: `Setiap sisi persegi panjangnya ${side} cm.`,
    },
    // condition — it's a square, so all four sides are the same length
    {
      category: 'condition',
      phrase_en: 'square',
      phrase_id: 'persegi',
      note_en: 'A square has 4 sides, and all of them are equal.',
      note_id: 'Persegi punya 4 sisi, dan semuanya sama panjang.',
    },
    // question — what to find
    {
      category: 'question',
      phrase_en: 'perimeter',
      phrase_id: 'keliling',
      note_en: 'Perimeter is the distance all the way around the outside.',
      note_id: 'Keliling adalah jarak mengelilingi seluruh bagian luar.',
    },
  ]

  return {
    needsVisual: true,
    highlights,

    quantities: [
      { label_en: 'Side', label_id: 'Sisi', value: `${side} cm` },
      { label_en: 'Sides', label_id: 'Jumlah sisi', value: '4' },
      { label_en: 'Perimeter', label_id: 'Keliling', value: `${correct} cm` },
    ],

    strategy: {
      conceptSlug: 'shape-perimeter-square',
      name_en: 'side × 4',
      name_id: 'sisi × 4',
    },

    // The tempting wrong answer: doubling the side (side × 2), which counts only
    // two sides instead of all four. render() includes side × 2 as a distractor.
    trap: {
      wrong: String(side * 2),
      why_en: `${side} × 2 = ${side * 2} only counts two sides; a square has four.`,
      why_id: `${side} × 2 = ${side * 2} hanya menghitung dua sisi; persegi punya empat.`,
    },

    answer: {
      form: 'choice',
      unit: null,
      value: String(answerLabel),
    },

    vocab: [],
  }
}
