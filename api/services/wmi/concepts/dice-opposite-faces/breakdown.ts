import type { Breakdown, BreakdownHighlight } from '../types.js'
import { hiddenSum, type Params } from './index.js'

// Authored decomposition of a hidden-faces-of-a-die problem: three faces of a
// standard die are visible (top/front/right); find the total of the three
// hidden faces. The key fact is that opposite faces sum to 7, so all six faces
// total 21 and hidden = 21 − visible. The learner-facing part is a set of
// color-coded, clickable highlights over the problem text — each phrase MUST be
// a substring of the rendered DISPLAY body (after section labels are stripped).
export function buildDiceOppositeFacesBreakdown(params: Params): Breakdown {
  const visible = params.t + params.f + params.r
  const hidden = hiddenSum(params)

  const highlights: BreakdownHighlight[] = [
    // facts — the three visible face values
    {
      category: 'fact',
      phrase_en: `top ${params.t}`,
      phrase_id: `atas ${params.t}`,
      note_en: `The top face shows ${params.t}.`,
      note_id: `Sisi atas menunjukkan ${params.t}.`,
    },
    {
      category: 'fact',
      phrase_en: `front ${params.f}`,
      phrase_id: `depan ${params.f}`,
      note_en: `The front face shows ${params.f}.`,
      note_id: `Sisi depan menunjukkan ${params.f}.`,
    },
    {
      category: 'fact',
      phrase_en: `right ${params.r}`,
      phrase_id: `kanan ${params.r}`,
      note_en: `The right face shows ${params.r}.`,
      note_id: `Sisi kanan menunjukkan ${params.r}.`,
    },
    // condition — the opposite-faces rule that makes the whole die total 21
    {
      category: 'condition',
      phrase_en: 'standard die',
      phrase_id: 'dadu standar',
      note_en: 'On a standard die, opposite faces add to 7, so all six total 21.',
      note_id: 'Pada dadu standar, sisi berlawanan berjumlah 7, jadi keenamnya berjumlah 21.',
    },
    // question — what to find
    {
      category: 'question',
      phrase_en: 'the total of the three hidden faces',
      phrase_id: 'jumlah ketiga sisi yang tersembunyi',
      note_en: 'Find the sum of the three faces you cannot see.',
      note_id: 'Cari jumlah tiga sisi yang tidak terlihat.',
    },
  ]

  return {
    needsVisual: false,
    highlights,

    quantities: [
      { label_en: 'Top', label_id: 'Atas', value: String(params.t) },
      { label_en: 'Front', label_id: 'Depan', value: String(params.f) },
      { label_en: 'Right', label_id: 'Kanan', value: String(params.r) },
      { label_en: 'Visible total', label_id: 'Total terlihat', value: String(visible) },
      { label_en: 'All faces total', label_id: 'Total semua sisi', value: '21' },
      { label_en: 'Answer', label_id: 'Jawaban', value: String(hidden) },
    ],

    strategy: {
      conceptSlug: 'dice-opposite-faces',
      name_en: 'Whole minus the visible part',
      name_id: 'Keseluruhan dikurangi bagian yang terlihat',
    },

    trap: null,

    answer: {
      form: 'number',
      unit: null,
      value: String(hidden),
    },

    vocab: [],
  }
}
