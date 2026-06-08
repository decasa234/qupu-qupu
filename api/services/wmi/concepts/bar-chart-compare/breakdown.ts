import type { Breakdown, BreakdownHighlight } from '../types.js'
import { difference, type Params } from './index.js'

// Authored decomposition of a bar-chart-compare problem: read two bar heights
// from the chart and find how many more of the taller category there are.
// The learner-facing part is a set of color-coded, clickable highlights over the
// problem text. Each phrase MUST be a substring of the DISPLAY body (after the
// "Find:" label is stripped and [[bar-chart|bar chart]] resolves to "bar chart").
// The chart is figure-heavy: only the comparison words and the two category
// names appear in the stem — the actual bar heights live in the illustration.
export function buildBarChartCompareBreakdown(params: Params): Breakdown {
  const a = params.items[params.iA].emoji
  const b = params.items[params.iB].emoji
  const vA = params.items[params.iA].value
  const vB = params.items[params.iB].value
  const diff = difference(params)

  const highlights: BreakdownHighlight[] = [
    // condition — where the numbers come from
    {
      category: 'condition',
      phrase_en: 'bar chart',
      phrase_id: 'diagram batang',
      note_en: 'The amounts are the heights of the bars — read them from the chart.',
      note_id: 'Jumlahnya adalah tinggi batang — baca dari diagram.',
    },
    // condition — the comparison being asked
    {
      category: 'condition',
      phrase_en: 'How many more',
      phrase_id: 'lebih banyak',
      note_en: 'This asks for a difference: subtract the smaller bar from the bigger one.',
      note_id: 'Ini menanyakan selisih: kurangkan batang kecil dari batang besar.',
    },
    // facts — the two categories being compared (the emoji names in the stem)
    {
      category: 'fact',
      phrase_en: a,
      phrase_id: a,
      note_en: `The taller bar — there are ${vA} of these.`,
      note_id: `Batang yang lebih tinggi — ada ${vA} buah.`,
    },
    {
      category: 'fact',
      phrase_en: b,
      phrase_id: b,
      note_en: `The shorter bar — there are ${vB} of these.`,
      note_id: `Batang yang lebih pendek — ada ${vB} buah.`,
    },
    // question — what to find
    {
      category: 'question',
      phrase_en: `more ${a} are there than ${b}`,
      phrase_id: `lebih banyak ${a} daripada ${b}`,
      note_en: `Find how many extra ${a} there are compared to ${b}.`,
      note_id: `Cari berapa ${a} lebih banyak dibanding ${b}.`,
    },
  ]

  return {
    needsVisual: true,
    highlights,

    quantities: [
      { label_en: 'Taller bar', label_id: 'Batang lebih tinggi', value: `${a} = ${vA}` },
      { label_en: 'Shorter bar', label_id: 'Batang lebih pendek', value: `${b} = ${vB}` },
      { label_en: 'Difference', label_id: 'Selisih', value: `${vA} − ${vB} = ${diff}` },
    ],

    strategy: {
      conceptSlug: 'bar-chart-compare',
      name_en: 'Read the bars',
      name_id: 'Baca batangnya',
    },

    trap: null,

    answer: {
      form: 'number',
      unit: null,
      value: String(diff),
    },

    vocab: [],
  }
}
