import type { Breakdown, BreakdownHighlight } from '../types.js'
import { triangleCount, type Params } from './index.js'

// Authored decomposition of a count-shapes-in-figure problem: a fan of rays from
// an apex to the base makes triangles at every "width". The trap is counting only
// the smallest single-section triangles and missing the larger ones that span two
// or more sections. The learner-facing part is a set of color-coded, clickable
// highlights over the problem text. Each phrase MUST be a substring of the
// rendered body (after section labels are stripped) in that language.
export function buildCountShapesInFigureBreakdown(params: Params): Breakdown {
  const { segments } = params
  const total = triangleCount(params)
  const smallOnly = segments // width-1 triangles only — the tempting wrong count

  const highlights: BreakdownHighlight[] = [
    // fact — the shape we are counting (named in the stem)
    {
      category: 'fact',
      phrase_en: 'triangle',
      phrase_id: 'segitiga',
      note_en: 'A triangle is the shape with three sides — that is what we count.',
      note_id: 'Segitiga adalah bangun dengan tiga sisi — itu yang kita hitung.',
    },
    // condition — count ALL of them, including the combined/overlapping ones
    {
      category: 'condition',
      phrase_en: 'including the larger triangles made by combining sections',
      phrase_id: 'termasuk segitiga lebih besar yang terbentuk dari gabungan beberapa bagian',
      note_en: 'Do not stop at the small ones — bigger triangles are hidden inside, made of two or more sections.',
      note_id: 'Jangan berhenti di yang kecil — ada segitiga lebih besar di dalamnya, dari dua bagian atau lebih.',
    },
    // question — what to find
    {
      category: 'question',
      phrase_en: 'How many triangles',
      phrase_id: 'Ada berapa segitiga',
      note_en: 'Find the total number of triangles of every size in the figure.',
      note_id: 'Cari jumlah seluruh segitiga dari semua ukuran dalam gambar.',
    },
  ]

  return {
    needsVisual: true,
    highlights,

    quantities: [
      { label_en: 'Sections', label_id: 'Bagian', value: String(segments) },
      { label_en: 'Smallest triangles', label_id: 'Segitiga terkecil', value: String(smallOnly) },
      { label_en: 'Answer', label_id: 'Jawaban', value: String(total) },
    ],

    strategy: {
      conceptSlug: 'count-shapes-in-figure',
      name_en: 'count small then combined',
      name_id: 'hitung kecil lalu gabungan',
    },

    // The trap: counting only the smallest single-section triangles and missing
    // the larger combined ones.
    trap: {
      wrong: String(smallOnly),
      why_en: `${smallOnly} counts only the smallest triangles; the larger combined ones are missed.`,
      why_id: `${smallOnly} hanya menghitung segitiga terkecil; yang lebih besar dari gabungan terlewat.`,
    },

    answer: {
      form: 'number',
      unit: null,
      value: String(total),
    },

    vocab: [],
  }
}
