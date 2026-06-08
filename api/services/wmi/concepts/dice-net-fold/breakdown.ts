import type { Breakdown, BreakdownHighlight } from '../types.js'
import type { Params } from './index.js'

// Authored decomposition of a dice-net-fold problem: of four nets made of 6
// squares, pick the one that folds along its edges into a closed cube. The
// learner-facing part is color-coded, clickable highlights over the problem
// text. Each phrase MUST be an exact substring of the rendered DISPLAY body in
// that language (after section labels are stripped).
const LABELS = ['A', 'B', 'C', 'D'] as const

export function buildDiceNetFoldBreakdown(params: Params): Breakdown {
  const answer = LABELS[params.validIndex]

  const highlights: BreakdownHighlight[] = [
    // fact — the face count every net shares (6 squares = the 6 faces of a cube)
    {
      category: 'fact',
      phrase_en: '6 squares',
      phrase_id: '6 persegi',
      note_en: 'A cube has 6 faces, so every net is made of 6 squares.',
      note_id: 'Kubus punya 6 sisi, jadi setiap jaring terdiri dari 6 persegi.',
    },
    // condition — the folding rule
    {
      category: 'condition',
      phrase_en: 'folded along its edges to form a closed cube',
      phrase_id: 'dilipat sepanjang sisinya membentuk kubus tertutup',
      note_en: 'Fold on the edges; the 6 squares must wrap into a cube with no gap and no overlap.',
      note_id: 'Lipat pada sisinya; ke-6 persegi harus menutup jadi kubus tanpa celah dan tanpa tumpang tindih.',
    },
    // question — which net
    {
      category: 'question',
      phrase_en: 'Which net',
      phrase_id: 'Jaring manakah',
      note_en: `Find the one net that folds into a cube — the answer is ${answer}.`,
      note_id: `Cari satu jaring yang melipat jadi kubus — jawabannya ${answer}.`,
    },
  ]

  return {
    needsVisual: true,
    highlights,

    quantities: [
      { label_en: 'Squares per net', label_id: 'Persegi tiap jaring', value: '6' },
      { label_en: 'Nets to check', label_id: 'Jaring diperiksa', value: '4' },
      { label_en: 'Answer', label_id: 'Jawaban', value: answer },
    ],

    strategy: {
      conceptSlug: 'dice-net-fold',
      name_en: 'Reject nets with a 2×2 block',
      name_id: 'Tolak jaring yang punya blok 2×2',
    },

    // A net with a 2×2 block (or a 1×6 / 2×3 rectangle) cannot fold into a
    // cube — that is the tempting wrong pick, but it is a shape on the figure,
    // not a fixed label across seeds, so no single wrong label to name here.
    trap: null,

    answer: {
      form: 'choice',
      unit: null,
      value: String(answer),
    },

    vocab: [],
  }
}
