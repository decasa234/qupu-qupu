import type { Breakdown, BreakdownHighlight } from '../types.js'
import { unshaded, type Params } from './index.js'

// Authored decomposition of a fraction-of-region problem: a shape is split into
// equal parts, some are shaded, and the kid finds how many parts are NOT shaded.
// Figure-heavy — the drawing shows the shaded vs unshaded parts — so we highlight
// the stem words the kid actually reads.
// Display body (after stripSectionLabels removes the "Find:" / "Cari:" label):
//   EN: "A shape is divided into N equal parts and M part(s) is/are shaded. How
//        many parts are NOT shaded?"
//   ID: "Sebuah bangun dibagi menjadi N bagian sama besar dan M bagian diarsir.
//        Berapa bagian yang TIDAK diarsir?"
// Each highlight phrase MUST be an exact substring of that display body.
export function buildFractionOfRegionBreakdown(params: Params): Breakdown {
  const { parts, shaded } = params
  const notShaded = unshaded(params)

  // Match the singular/plural verb the render() uses for the shaded count.
  const shadedPhraseEn = `${shaded} part${shaded === 1 ? ' is' : 's are'} shaded`

  const highlights: BreakdownHighlight[] = [
    // fact — the total number of equal parts
    {
      category: 'fact',
      phrase_en: `${parts} equal parts`,
      phrase_id: `${parts} bagian sama besar`,
      note_en: `The whole shape is split into ${parts} equal parts.`,
      note_id: `Seluruh bangun dibagi menjadi ${parts} bagian sama besar.`,
    },
    // fact — the number of parts that are shaded
    {
      category: 'fact',
      phrase_en: shadedPhraseEn,
      phrase_id: `${shaded} bagian diarsir`,
      note_en: `${shaded} of the parts ${shaded === 1 ? 'is' : 'are'} coloured in.`,
      note_id: `${shaded} bagian sudah diwarnai.`,
    },
    // condition — count out of the WHOLE, not just the coloured ones
    {
      category: 'condition',
      phrase_en: 'equal parts',
      phrase_id: 'sama besar',
      note_en: 'Every part is the same size, so each one counts as one part.',
      note_id: 'Setiap bagian sama besar, jadi tiap bagian dihitung satu.',
    },
    // question — what to find: the parts that are NOT shaded
    {
      category: 'question',
      phrase_en: 'How many parts are NOT shaded',
      phrase_id: 'Berapa bagian yang TIDAK diarsir',
      note_en: 'Find how many parts are left without colour.',
      note_id: 'Cari berapa bagian yang belum diwarnai.',
    },
  ]

  return {
    needsVisual: true,
    highlights,

    quantities: [
      { label_en: 'Total parts', label_id: 'Total bagian', value: String(parts) },
      { label_en: 'Shaded', label_id: 'Diarsir', value: String(shaded) },
      { label_en: 'Not shaded', label_id: 'Tidak diarsir', value: String(notShaded) },
    ],

    strategy: {
      conceptSlug: 'fraction-of-region',
      name_en: 'shaded ÷ total',
      name_id: 'diarsir ÷ total',
    },

    // Real trap: counting the shaded parts instead of the unshaded ones — the
    // word NOT is easy to miss. Only a genuine trap when the shaded count differs
    // from the answer; if they happen to be equal the misconception still lands
    // on the right number, so there is no tempting wrong answer.
    trap:
      shaded === notShaded
        ? null
        : {
            wrong: String(shaded),
            why_en: `${shaded} is the shaded count; the question asks for the parts NOT shaded.`,
            why_id: `${shaded} adalah bagian yang diarsir; pertanyaannya bagian yang TIDAK diarsir.`,
          },

    answer: {
      form: 'number',
      unit: null,
      value: String(notShaded),
    },

    vocab: [],
  }
}
