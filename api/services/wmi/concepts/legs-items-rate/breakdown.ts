import type { Breakdown, BreakdownHighlight } from '../types.js'
import { ANIMALS_BY_KEY, type Animal, type Params } from './index.js'

// Authored decomposition of a legs-items-rate problem: several groups of animals,
// each animal kind has a fixed number of legs (the rate). The learner multiplies
// each count by its leg-rate, then adds the partial totals.
// Each highlight phrase MUST be an exact substring of the DISPLAY body (after
// stripSectionLabels — the "Find:" / "Cari:" labels are removed, so highlight
// "How many legs are there altogether?", not "Find: How many...").
export function buildLegsItemsRateBreakdown(params: Params): Breakdown {
  const items = params.kinds.map((k, i) => ({ a: ANIMALS_BY_KEY[k] as Animal, n: params.counts[i] }))
  const answer = items.reduce((sum, it) => sum + it.n * it.a.legs, 0)

  // Per-group label exactly as it appears in the rendered list (en1 for 1, en for many).
  const labelEN = (it: { a: Animal; n: number }) => `${it.n} ${it.n === 1 ? it.a.en1 : it.a.en}`
  const labelID = (it: { a: Animal; n: number }) => `${it.n} ekor ${it.a.id}`

  const highlights: BreakdownHighlight[] = [
    // facts — each animal group: its count and its leg-rate.
    ...items.map((it) => ({
      category: 'fact' as const,
      phrase_en: labelEN(it),
      phrase_id: labelID(it),
      note_en: `${it.n} ${it.n === 1 ? it.a.en1 : it.a.en}, each with ${it.a.legs} legs: ${it.n} x ${it.a.legs} = ${it.n * it.a.legs}.`,
      note_id: `${it.n} ekor ${it.a.id}, tiap ekor ${it.a.legs} kaki: ${it.n} x ${it.a.legs} = ${it.n * it.a.legs}.`,
    })),
    // conditions — the rate relationship, spelled out in the body only for the
    // less-familiar animals (spider 8, ant 6).
    ...items
      .filter((it) => it.a.note)
      .map((it) => ({
        category: 'condition' as const,
        phrase_en: `${/^[aeiou]/i.test(it.a.en1) ? 'An' : 'A'} ${it.a.en1} has ${it.a.legs} legs.`,
        phrase_id: `Seekor ${it.a.id} memiliki ${it.a.legs} kaki.`,
        note_en: `Use this rate: every ${it.a.en1} has ${it.a.legs} legs.`,
        note_id: `Pakai aturan ini: tiap ${it.a.id} punya ${it.a.legs} kaki.`,
      })),
    // question — what to find: the grand total.
    {
      category: 'question',
      phrase_en: 'How many legs are there altogether?',
      phrase_id: 'Berapa jumlah kaki seluruhnya?',
      note_en: 'Add the legs from every group together.',
      note_id: 'Jumlahkan kaki dari semua kelompok.',
    },
  ]

  return {
    needsVisual: false,
    highlights,

    quantities: [
      ...items.map((it) => ({
        label_en: `${it.n === 1 ? it.a.en1 : it.a.en} (legs each)`,
        label_id: `${it.a.id} (kaki/ekor)`,
        value: `${it.n} x ${it.a.legs} = ${it.n * it.a.legs}`,
      })),
      { label_en: 'Total legs', label_id: 'Jumlah kaki', value: String(answer) },
    ],

    strategy: {
      conceptSlug: 'legs-items-rate',
      name_en: 'multiply count × rate',
      name_id: 'kalikan jumlah × kaki per ekor',
    },

    trap: null,

    answer: {
      form: 'number',
      unit: null,
      value: String(answer),
    },

    vocab: [],
  }
}
