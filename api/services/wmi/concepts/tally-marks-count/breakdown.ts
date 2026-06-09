import type { Breakdown, BreakdownHighlight } from '../types.js'
import type { Params } from './index.js'

// Authored decomposition of a tally-marks-count problem: read a number from a
// figure of tally marks, where every crossed bundle (four uprights with a
// diagonal) is worth 5. The problem is FIGURE-HEAVY — the actual marks live in
// the illustration, so the body text is generic. Each highlight phrase MUST be
// an exact substring of the DISPLAY body (after stripSectionLabels removes
// "Find:" / "Cari:"). The machine brief carries the values every other role
// binds to.
export function buildTallyMarksCountBreakdown(params: Params): Breakdown {
  const { n } = params
  const fullGroups = Math.floor(n / 5)
  const leftover = n % 5
  const groupTotal = fullGroups * 5

  const highlights: BreakdownHighlight[] = [
    // condition — each crossed bundle of marks is worth 5
    {
      category: 'condition',
      phrase_en: 'Tally marks',
      phrase_id: 'Tanda turus',
      note_en: 'Each bundle — four uprights with a diagonal across them — is one group of 5.',
      note_id: 'Setiap ikat — empat turus tegak disilang satu garis miring — bernilai 5.',
    },
    // question — what number the marks show
    {
      category: 'question',
      phrase_en: 'What number do the tally marks show?',
      phrase_id: 'Bilangan berapa yang ditunjukkan oleh tanda turus itu?',
      note_en: 'Count the groups of 5 first, then add the leftover single marks.',
      note_id: 'Hitung dulu kelompok 5-an, lalu tambahkan turus sisa yang sendiri.',
    },
  ]

  return {
    needsVisual: true,
    highlights,

    quantities: [
      { label_en: 'Groups of 5', label_id: 'Kelompok 5-an', value: String(fullGroups) },
      { label_en: 'From groups', label_id: 'Dari kelompok', value: String(groupTotal) },
      { label_en: 'Leftover marks', label_id: 'Turus sisa', value: String(leftover) },
      { label_en: 'Total', label_id: 'Jumlah', value: String(n) },
    ],

    strategy: {
      conceptSlug: 'tally-marks-count',
      name_en: 'Count by fives',
      name_id: 'Hitung lompat lima',
    },

    // No genuine tempting wrong answer — counting every stroke as 1 just gives the
    // same total, so there is no single misleading number to flag.
    trap: null,

    answer: {
      form: 'number',
      unit: null,
      value: String(n),
    },

    vocab: [],
  }
}
