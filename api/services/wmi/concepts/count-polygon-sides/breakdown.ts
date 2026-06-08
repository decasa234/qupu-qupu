import type { Breakdown, BreakdownHighlight } from '../types.js'
import { type Params } from './index.js'

const POLYGON_NAME_EN: Record<number, string> = {
  3: 'triangle',
  4: 'quadrilateral',
  5: 'pentagon',
  6: 'hexagon',
  7: 'heptagon',
  8: 'octagon',
}
const POLYGON_NAME_ID: Record<number, string> = {
  3: 'segitiga',
  4: 'segiempat',
  5: 'segilima',
  6: 'segienam',
  7: 'segi tujuh',
  8: 'segi delapan',
}

// Authored decomposition of a count-polygon-sides problem: count how many
// straight sides the polygon in the picture has. This is figure-heavy — the
// drawn shape carries all the data, the stem text holds no numbers — so we
// highlight only the words the kid actually sees.
// Display body (after stripSectionLabels strips the "Find:" / "Cari:" label):
//   EN: "How many sides does the polygon in the figure have?"
//   ID: "Berapa banyak sisi yang dimiliki bangun datar pada gambar?"
// Each highlight phrase MUST be an exact substring of that display body.
export function buildCountPolygonSidesBreakdown(params: Params): Breakdown {
  const { sides } = params
  const nameEn = POLYGON_NAME_EN[sides]
  const nameId = POLYGON_NAME_ID[sides]

  const highlights: BreakdownHighlight[] = [
    // question — what to find: how many sides
    {
      category: 'question',
      phrase_en: 'How many sides',
      phrase_id: 'Berapa banyak sisi',
      note_en: 'Find how many straight sides the shape has.',
      note_id: 'Cari berapa banyak sisi lurus yang dimiliki bangun.',
    },
    // condition — count the sides of THIS shape (a side = one straight edge)
    {
      category: 'condition',
      phrase_en: 'does the polygon',
      phrase_id: 'yang dimiliki bangun datar',
      note_en: 'A side is one straight edge of the shape; a corner joins two sides.',
      note_id: 'Sisi adalah satu tepi lurus bangun; sudut adalah pertemuan dua sisi.',
    },
    // fact — the picture holds the data; trace its outline to count
    {
      category: 'fact',
      phrase_en: 'in the figure',
      phrase_id: 'pada gambar',
      note_en: 'Trace the outline in the picture and count each straight edge.',
      note_id: 'Telusuri garis luar pada gambar dan hitung setiap tepi lurus.',
    },
  ]

  return {
    needsVisual: true,
    highlights,

    quantities: [
      {
        label_en: 'Sides',
        label_id: 'Sisi',
        value: String(sides),
      },
      {
        label_en: 'Shape',
        label_id: 'Bangun',
        value: `${nameEn} / ${nameId}`,
      },
    ],

    strategy: {
      conceptSlug: 'count-polygon-sides',
      name_en: 'Trace and count edges',
      name_id: 'Telusuri dan hitung tepi',
    },

    // Pure counting straight off the figure — no tempting wrong answer.
    trap: null,

    answer: {
      form: 'number',
      unit: null,
      value: String(sides),
    },

    vocab: [],
  }
}
