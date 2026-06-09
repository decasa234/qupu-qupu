import type { Breakdown, BreakdownHighlight } from '../types.js'
import { perimeter, type Params } from './index.js'

// Authored decomposition of a perimeter-of-a-rectangle problem: walk all the way
// around the rectangle and add every side. The learner-facing part is a set of
// color-coded, clickable highlights over the problem text. Each phrase MUST be a
// substring of the DISPLAY body (after section labels are stripped and the
// glossary markup [[perimeter|keliling]] is resolved to its label).
export function buildShapePerimeterRectangleBreakdown(params: Params): Breakdown {
  const p = perimeter(params)
  const sum = params.w + params.h
  // The classic trap: multiplying the sides (area) instead of going around.
  const area = params.w * params.h

  const highlights: BreakdownHighlight[] = [
    // facts — the width and the height
    {
      category: 'fact',
      phrase_en: `${params.w} cm wide`,
      phrase_id: `lebarnya ${params.w} cm`,
      note_en: `The rectangle is ${params.w} cm across.`,
      note_id: `Lebar persegi panjang ${params.w} cm.`,
    },
    {
      category: 'fact',
      phrase_en: `${params.h} cm tall`,
      phrase_id: `tingginya ${params.h} cm`,
      note_en: `The rectangle is ${params.h} cm up and down.`,
      note_id: `Tinggi persegi panjang ${params.h} cm.`,
    },
    // condition — it's a rectangle, so opposite sides are equal
    {
      category: 'condition',
      phrase_en: 'rectangle',
      phrase_id: 'Persegi panjang',
      note_en: 'A rectangle has two equal widths and two equal heights.',
      note_id: 'Persegi panjang punya dua sisi lebar sama dan dua sisi tinggi sama.',
    },
    // question — find the perimeter (the DISPLAY word, not the markup)
    {
      category: 'question',
      phrase_en: 'perimeter',
      phrase_id: 'keliling',
      note_en: 'Perimeter is the total distance all the way around the shape.',
      note_id: 'Keliling adalah jarak total mengelilingi seluruh bentuk.',
    },
  ]

  return {
    needsVisual: true,
    highlights,

    quantities: [
      { label_en: 'Width', label_id: 'Lebar', value: `${params.w} cm` },
      { label_en: 'Height', label_id: 'Tinggi', value: `${params.h} cm` },
      { label_en: 'Perimeter', label_id: 'Keliling', value: `${p} cm` },
    ],

    strategy: {
      conceptSlug: 'shape-perimeter-rectangle',
      name_en: '2 × (length + width)',
      name_id: '2 × (panjang + lebar)',
    },

    trap: {
      wrong: String(area),
      why_en: `${params.w} × ${params.h} = ${area} is the area, not the perimeter. Perimeter adds the sides: 2 × ${sum} = ${p}.`,
      why_id: `${params.w} × ${params.h} = ${area} itu luas, bukan keliling. Keliling menjumlahkan sisi: 2 × ${sum} = ${p}.`,
    },

    answer: {
      form: 'number',
      unit: 'cm',
      value: String(p),
    },

    vocab: [],
  }
}
