import type { Breakdown, BreakdownHighlight } from '../types.js'
import type { Params } from './index.js'

// Authored decomposition of a compare-order-numbers problem: each answer choice
// is a "p > q > r" chain over the SAME three numbers, and exactly one lists them
// from largest to smallest. The learner-facing part is a set of color-coded,
// clickable highlights over the problem text. Each phrase MUST be an exact
// substring of the DISPLAY body (after stripSectionLabels removes "Find:" /
// "Cari:"). The body is generic — the actual numbers live in the choices — so the
// machine brief carries the values every other role binds to.
export function buildCompareOrderNumbersBreakdown(params: Params): Breakdown {
  const [hi, mid, lo] = [params.x, params.y, params.z].sort((a, b) => b - a)
  const chain = `${hi} > ${mid} > ${lo}`
  // Mirror render(): the correct chain sits at a params-dependent position, so
  // the answer label is not always 'A'. answer.value MUST equal the choice label.
  const labels = ['A', 'B', 'C', 'D'] as const
  const correctLabel = labels[(hi + mid + lo) % 4]

  const highlights: BreakdownHighlight[] = [
    // fact — what each statement shows you
    {
      category: 'fact',
      phrase_en: 'Three numbers',
      phrase_id: 'Tiga bilangan',
      note_en: `The same three numbers (${hi}, ${mid}, ${lo}) appear in every statement.`,
      note_id: `Tiga bilangan yang sama (${hi}, ${mid}, ${lo}) muncul di setiap pernyataan.`,
    },
    // condition — the order rule each chain claims
    {
      category: 'condition',
      phrase_en: 'each statement',
      phrase_id: 'setiap pernyataan',
      note_en: 'The ">" sign means "is bigger than", so a statement reads left-to-right from biggest.',
      note_id: 'Tanda ">" berarti "lebih besar dari", jadi pernyataan dibaca dari yang terbesar di kiri.',
    },
    {
      category: 'condition',
      phrase_en: 'ordering statement',
      phrase_id: 'urutan',
      note_en: `A correct ordering goes largest to smallest: ${chain}.`,
      note_id: `Urutan yang benar dari terbesar ke terkecil: ${chain}.`,
    },
    // question — what to pick
    {
      category: 'question',
      phrase_en: 'Which ordering statement is correct?',
      phrase_id: 'Pernyataan urutan manakah yang benar?',
      note_en: 'Pick the one chain that lists the numbers from biggest to smallest.',
      note_id: 'Pilih satu pernyataan yang mengurutkan bilangan dari terbesar ke terkecil.',
    },
  ]

  return {
    needsVisual: false,
    highlights,

    quantities: [
      { label_en: 'Numbers', label_id: 'Bilangan', value: `${params.x}, ${params.y}, ${params.z}` },
      { label_en: 'Largest', label_id: 'Terbesar', value: String(hi) },
      { label_en: 'Smallest', label_id: 'Terkecil', value: String(lo) },
      { label_en: 'Correct order', label_id: 'Urutan benar', value: chain },
    ],

    strategy: {
      conceptSlug: 'compare-order-numbers',
      name_en: 'Compare tens, then ones',
      name_id: 'Bandingkan puluhan, lalu satuan',
    },

    // Tempting wrong answer: reading the chain smallest-to-largest instead.
    trap: {
      wrong: `${lo} > ${mid} > ${hi}`,
      why_en: `${lo} > ${mid} > ${hi} is backwards — that lists smallest first, but ">" needs the biggest on the left.`,
      why_id: `${lo} > ${mid} > ${hi} terbalik — itu menaruh yang terkecil dulu, padahal ">" butuh yang terbesar di kiri.`,
    },

    answer: {
      form: 'choice',
      unit: null,
      value: correctLabel,
    },

    vocab: [],
  }
}
