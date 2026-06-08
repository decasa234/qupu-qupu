import type { Breakdown, BreakdownHighlight } from '../types.js'
import { total, type Params } from './index.js'

// Authored decomposition of a block-count-3d problem: count EVERY cube in the
// figure, including the solid cubes hidden underneath each visible top. This is
// figure-heavy — the stack of cubes carries the data — so the stem text is short
// and holds no numbers. We highlight only the words the kid actually sees.
// Display body (after stripSectionLabels strips the "Find:" / "Cari:" label):
//   EN: "How many blocks are there in total in the figure shown?"
//   ID: "Ada berapa balok seluruhnya pada gambar yang ditunjukkan?"
// Each highlight phrase MUST be an exact substring of that display body.
export function buildBlockCount3dBreakdown(params: Params): Breakdown {
  const grandTotal = total(params)
  const groupTotals = params.groups.map((g) => g.heights.reduce((a, b) => a + b, 0))

  // The trap: counting only the cubes you can see on top (one top per column)
  // and forgetting the solid cubes stacked underneath. That undercount equals
  // the number of columns = total footprint cells across every group.
  const topsOnly = params.groups.reduce((s, g) => s + g.depth * g.width, 0)

  const highlights: BreakdownHighlight[] = [
    // question — what to find
    {
      category: 'question',
      phrase_en: 'How many blocks',
      phrase_id: 'Ada berapa balok',
      note_en: 'Find the number of cubes in the whole figure.',
      note_id: 'Cari banyaknya kubus pada seluruh gambar.',
    },
    // condition — count ALL cubes, including the hidden ones underneath
    {
      category: 'condition',
      phrase_en: 'in total',
      phrase_id: 'seluruhnya',
      note_en: 'Count every cube, even the ones hidden under the top.',
      note_id: 'Hitung setiap kubus, termasuk yang tersembunyi di bawah puncak.',
    },
    // fact — the picture holds the data; every stack is solid down to the floor
    {
      category: 'fact',
      phrase_en: 'the figure shown',
      phrase_id: 'gambar yang ditunjukkan',
      note_en: 'Each stack is solid, so count straight down to the floor.',
      note_id: 'Tiap tumpukan padat, jadi hitung lurus ke bawah sampai lantai.',
    },
  ]

  return {
    needsVisual: true,
    highlights,

    quantities: [
      {
        label_en: 'Blocks per group',
        label_id: 'Balok tiap kelompok',
        value: groupTotals.join(', '),
      },
      {
        label_en: 'Total blocks',
        label_id: 'Jumlah balok',
        value: String(grandTotal),
      },
    ],

    strategy: {
      conceptSlug: 'block-count-3d',
      name_en: 'Count by layers',
      name_id: 'Hitung lapis demi lapis',
    },

    // A real misconception: counting only the visible tops and missing the
    // cubes stacked underneath. Only include it when it actually undercounts.
    trap:
      topsOnly < grandTotal
        ? {
            wrong: String(topsOnly),
            why_en: `That only counts the ${topsOnly} top cube${topsOnly !== 1 ? 's' : ''} you can see and misses the solid cubes underneath.`,
            why_id: `Itu hanya menghitung ${topsOnly} kubus puncak yang terlihat dan melewatkan kubus padat di bawahnya.`,
          }
        : null,

    answer: {
      form: 'number',
      unit: null,
      value: String(grandTotal),
    },

    vocab: [],
  }
}
