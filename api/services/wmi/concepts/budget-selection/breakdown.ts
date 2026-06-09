import type { Breakdown, BreakdownHighlight } from '../types.js'
import { bestTwo, type Params } from './index.js'

// Authored decomposition of a budget-selection problem: buy two DIFFERENT
// tickets whose total is as large as possible without going over the budget.
// The learner-facing part is a set of color-coded, clickable highlights over the
// problem text. Each phrase MUST be a substring of the rendered body.
export function buildBudgetBreakdown(params: Params): Breakdown {
  const list = params.prices.join(', ')
  const budget = params.budget
  const answer = bestTwo(params)

  // The trap: grabbing the two most expensive tickets — their total usually
  // busts the budget.
  const desc = [...params.prices].sort((a, b) => b - a)
  const topTwoTotal = desc[0] + desc[1]

  const highlights: BreakdownHighlight[] = [
    // facts — each ticket price, then the budget
    ...params.prices.map((p) => ({
      category: 'fact' as const,
      phrase_en: String(p),
      phrase_id: String(p),
      note_en: `A ticket you could buy costs $${p}.`,
      note_id: `Salah satu tiket harganya $${p}.`,
    })),
    {
      category: 'fact',
      phrase_en: String(budget),
      phrase_id: String(budget),
      note_en: `Your budget — you can't spend more than $${budget}.`,
      note_id: `Anggaranmu — tidak boleh belanja lebih dari $${budget}.`,
    },
    // conditions — the rules you must obey
    {
      category: 'condition',
      phrase_en: 'two different tickets',
      phrase_id: 'dua tiket berbeda',
      note_en: 'Pick exactly 2 tickets, and they must not be the same one.',
      note_id: 'Pilih tepat 2 tiket, dan keduanya harus berbeda.',
    },
    {
      category: 'condition',
      phrase_en: 'without exceeding your budget',
      phrase_id: 'tanpa melampaui anggaranmu',
      note_en: `The two prices added together can't go over $${budget}.`,
      note_id: `Jumlah dua harga tidak boleh lebih dari $${budget}.`,
    },
    // question — what to find
    {
      category: 'question',
      phrase_en: 'the most you can spend',
      phrase_id: 'jumlah terbesar',
      note_en: 'Find the biggest total of two tickets that still fits the budget.',
      note_id: 'Cari total dua tiket terbesar yang masih muat dalam anggaran.',
    },
  ]

  return {
    needsVisual: true,
    highlights,

    quantities: [
      { label_en: 'Prices', label_id: 'Harga', value: list },
      { label_en: 'Budget', label_id: 'Anggaran', value: String(budget) },
      { label_en: 'Answer', label_id: 'Jawaban', value: String(answer) },
    ],

    strategy: {
      conceptSlug: 'budget-selection',
      name_en: 'Compare pair totals',
      name_id: 'Bandingkan total pasangan',
    },

    trap: {
      wrong: String(topTwoTotal),
      why_en: `${desc[0]} + ${desc[1]} = ${topTwoTotal} is over ${budget}.`,
      why_id: `${desc[0]} + ${desc[1]} = ${topTwoTotal} lebih dari ${budget}.`,
    },

    answer: {
      form: 'number',
      unit: null,
      value: String(answer),
    },

    vocab: [],
  }
}
