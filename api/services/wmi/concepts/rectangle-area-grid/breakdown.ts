import type { Breakdown, BreakdownHighlight } from '../types.js'
import { area, type Params } from './index.js'

// Authored decomposition of an area-of-a-rectangle-on-a-grid problem: count the
// unit squares by multiplying columns (width) by rows (height). The learner-facing
// part is a set of color-coded, clickable highlights over the problem text. Each
// phrase MUST be a substring of the DISPLAY body (after section labels are stripped
// and the glossary markup [[area|luas]] is resolved to its label "area" / "luas").
export function buildRectangleAreaGridBreakdown(params: Params): Breakdown {
  const { w, h } = params
  const total = area(params)
  // The classic trap: adding the sides (perimeter) instead of multiplying them.
  const perimeter = 2 * (w + h)

  const highlights: BreakdownHighlight[] = [
    // facts — the width (columns) and the height (rows)
    {
      category: 'fact',
      phrase_en: `${w} squares wide`,
      phrase_id: `Lebarnya ${w} persegi`,
      note_en: `The rectangle is ${w} squares across — that is ${w} columns.`,
      note_id: `Lebar persegi panjang ${w} persegi — itu ${w} kolom.`,
    },
    {
      category: 'fact',
      phrase_en: `${h} squares tall`,
      phrase_id: `tingginya ${h} persegi`,
      note_en: `The rectangle is ${h} squares up and down — that is ${h} rows.`,
      note_id: `Tinggi persegi panjang ${h} persegi — itu ${h} baris.`,
    },
    // condition — every cell on the grid is the same 1 × 1 unit square
    {
      category: 'condition',
      phrase_en: 'unit squares',
      phrase_id: 'persegi satuan',
      note_en: 'Each little square on the grid is the same size: 1 by 1.',
      note_id: 'Setiap persegi kecil pada kisi ukurannya sama: 1 kali 1.',
    },
    // question — find the area (the DISPLAY word, not the raw markup)
    {
      category: 'question',
      phrase_en: 'area',
      phrase_id: 'luas',
      note_en: 'Area is how many unit squares fit inside the rectangle.',
      note_id: 'Luas adalah berapa banyak persegi satuan yang muat di dalam persegi panjang.',
    },
  ]

  return {
    needsVisual: true,
    highlights,

    quantities: [
      { label_en: 'Width', label_id: 'Lebar', value: `${w} squares` },
      { label_en: 'Height', label_id: 'Tinggi', value: `${h} squares` },
      { label_en: 'Area', label_id: 'Luas', value: `${total} unit squares` },
    ],

    strategy: {
      conceptSlug: 'rectangle-area-grid',
      name_en: 'length × width',
      name_id: 'panjang × lebar',
    },

    trap: {
      wrong: String(perimeter),
      why_en: `${w} + ${h} + ${w} + ${h} = ${perimeter} is the perimeter — the distance around. Area multiplies: ${w} × ${h} = ${total}.`,
      why_id: `${w} + ${h} + ${w} + ${h} = ${perimeter} itu keliling — jarak mengelilingi. Luas mengalikan: ${w} × ${h} = ${total}.`,
    },

    answer: {
      form: 'number',
      unit: null,
      value: String(total),
    },

    vocab: [],
  }
}
