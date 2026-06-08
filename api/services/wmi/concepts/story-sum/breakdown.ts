import type { Breakdown, BreakdownHighlight } from '../types.js'
import type { Params } from './index.js'

// Authored decomposition of a story-sum word problem: a basket starts with some
// fruit, a distractor item sits on the table (not in the basket), then two
// give-aways happen. The learner must subtract only the basket give-aways.
// Each highlight phrase MUST be an exact substring of the DISPLAY body (after
// stripSectionLabels — the "Find:" / "Cari:" labels are removed).
export function buildStorySumBreakdown(params: Params): Breakdown {
  const { start, distractor, giveMorning, giveLunch, name, fruit_en, fruit_id, distractor_en, distractor_id } = params
  const afterMorning = start - giveMorning
  const answer = afterMorning - giveLunch

  const highlights: BreakdownHighlight[] = [
    // fact — how many are in the basket to begin with
    {
      category: 'fact',
      phrase_en: `${start} ${fruit_en} in a basket`,
      phrase_id: `${start} ${fruit_id} di dalam keranjang`,
      note_en: `The basket starts with ${start} ${fruit_en}.`,
      note_id: `Keranjang dimulai dengan ${start} ${fruit_id}.`,
    },
    // condition — the distractor is NOT in the basket
    {
      category: 'condition',
      phrase_en: `not in the basket`,
      phrase_id: `tidak berada di keranjang`,
      note_en: `The ${distractor} ${distractor_en} on the table do not count.`,
      note_id: `${distractor} ${distractor_id} di meja tidak ikut dihitung.`,
    },
    // fact — first give-away (morning)
    {
      category: 'fact',
      phrase_en: `gives ${giveMorning} ${fruit_en} to a sibling`,
      phrase_id: `memberi ${giveMorning} ${fruit_id} kepada adiknya`,
      note_en: `Take away ${giveMorning}: ${start} − ${giveMorning} = ${afterMorning}.`,
      note_id: `Ambil ${giveMorning}: ${start} − ${giveMorning} = ${afterMorning}.`,
    },
    // fact — second give-away (lunch)
    {
      category: 'fact',
      phrase_en: `gives ${giveLunch} more ${fruit_en} to a friend`,
      phrase_id: `memberi ${giveLunch} ${fruit_id} lagi kepada temannya`,
      note_en: `Take away ${giveLunch} more: ${afterMorning} − ${giveLunch} = ${answer}.`,
      note_id: `Ambil ${giveLunch} lagi: ${afterMorning} − ${giveLunch} = ${answer}.`,
    },
    // question — what to find
    {
      category: 'question',
      phrase_en: `How many ${fruit_en} are left in the basket?`,
      phrase_id: `Berapa ${fruit_id} yang tersisa di keranjang?`,
      note_en: `Count only what stays in the basket after both give-aways.`,
      note_id: `Hitung hanya yang tersisa di keranjang setelah dua kali memberi.`,
    },
  ]

  return {
    needsVisual: false,
    highlights,

    quantities: [
      { label_en: 'Start in basket', label_id: 'Awal di keranjang', value: String(start) },
      { label_en: 'On table (ignore)', label_id: 'Di meja (abaikan)', value: `${distractor} ${distractor_id}` },
      { label_en: 'Given in the morning', label_id: 'Diberi pagi hari', value: String(giveMorning) },
      { label_en: 'Given at lunch', label_id: 'Diberi makan siang', value: String(giveLunch) },
      { label_en: 'Answer', label_id: 'Jawaban', value: String(answer) },
    ],

    strategy: {
      conceptSlug: 'story-sum',
      name_en: 'Subtract step by step, ignore the distractor',
      name_id: 'Kurangi bertahap, abaikan pengecoh',
    },

    // Tempting wrong answer: subtracting the distractor too.
    trap: {
      wrong: String(answer - distractor),
      why_en: `The ${distractor} ${distractor_en} are on the table, not in the basket, so don't subtract them.`,
      why_id: `${distractor} ${distractor_id} ada di meja, bukan di keranjang, jadi jangan dikurangi.`,
    },

    answer: {
      form: 'number',
      unit: null,
      value: String(answer),
    },

    vocab: [],
  }
}
