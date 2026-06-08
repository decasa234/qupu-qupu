import type { Breakdown, BreakdownHighlight } from '../types.js'
import { topNumber, type Params } from './index.js'

// Authored decomposition of a number-pyramid problem: the bottom row holds three
// given blocks, each higher block is the sum of the two directly below it, and we
// hunt for the single block at the top. The body is plain prose (no figure), so
// the highlights spotlight the words the kid actually reads: the given numbers,
// the build-up rule, and the question.
export function buildNumberPyramidBreakdown(params: Params): Breakdown {
  const mid1 = params.a + params.b
  const mid2 = params.b + params.c
  const top = topNumber(params)
  const bottom = `${params.a}, ${params.b}, ${params.c}`

  const highlights: BreakdownHighlight[] = [
    // fact — the three given blocks on the bottom row
    {
      category: 'fact',
      phrase_en: bottom,
      phrase_id: bottom,
      note_en: `The bottom row starts with ${bottom}.`,
      note_id: `Baris bawah dimulai dari ${bottom}.`,
    },
    // condition — the rule that builds every block above
    {
      category: 'condition',
      phrase_en: 'Each block is the sum of the two blocks directly below it',
      phrase_id: 'Setiap blok adalah jumlah dua blok tepat di bawahnya',
      note_en: 'Add the two neighbours below to fill each block above them.',
      note_id: 'Jumlahkan dua tetangga di bawah untuk mengisi blok di atasnya.',
    },
    // question — the block we must find
    {
      category: 'question',
      phrase_en: 'What number is at the top of the pyramid',
      phrase_id: 'Bilangan berapa yang ada di puncak piramida',
      note_en: 'Find the single block sitting at the very top.',
      note_id: 'Cari satu blok yang ada di paling puncak.',
    },
  ]

  return {
    needsVisual: false,
    highlights,

    quantities: [
      { label_en: 'Bottom row', label_id: 'Baris bawah', value: bottom },
      { label_en: 'Middle row', label_id: 'Baris tengah', value: `${mid1}, ${mid2}` },
      { label_en: 'Top', label_id: 'Puncak', value: String(top) },
    ],

    strategy: {
      conceptSlug: 'number-pyramid',
      name_en: 'add the two below',
      name_id: 'jumlahkan dua di bawah',
    },

    trap: null,

    answer: {
      form: 'number',
      unit: null,
      value: String(top),
    },

    vocab: [],
  }
}
