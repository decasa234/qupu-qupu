import type { Breakdown, BreakdownHighlight } from '../types.js'
import { neededForDollar, total, type Params } from './index.js'

// Authored decomposition of a money-coins-total problem: add up the coins in the
// pocket, then find how many more cents reach one dollar (100 cents). The coins
// themselves live in the illustration, so the only stem numbers are the dollar
// target. The learner-facing part is a set of color-coded, clickable highlights
// over the problem text — each phrase MUST be a substring of the rendered body.
export function buildMoneyCoinsTotalBreakdown(params: Params): Breakdown {
  const counts: Record<number, number> = {}
  for (const v of params.coins) counts[v] = (counts[v] ?? 0) + 1
  const denoms = ([25, 10, 5, 1] as const).filter((d) => counts[d])

  const groupSummary_en = denoms.map((d) => `${d}¢ ×${counts[d]}`).join(', ')
  const groupSummary_id = denoms.map((d) => `${d} sen ×${counts[d]}`).join(', ')
  const sum = total(params)
  const need = neededForDollar(params)

  const highlights: BreakdownHighlight[] = [
    // fact — the coins you are holding (shown in the picture, named in the text)
    {
      category: 'fact',
      phrase_en: 'These coins are in your pocket',
      phrase_id: 'Koin-koin ini ada di sakumu',
      note_en: `Add these up first: ${groupSummary_en} = ${sum}¢.`,
      note_id: `Jumlahkan dulu: ${groupSummary_id} = ${sum} sen.`,
    },
    // fact — the goal amount, one dollar = 100 cents
    {
      category: 'fact',
      phrase_en: 'one dollar (100 cents)',
      phrase_id: 'satu dolar (100 sen)',
      note_en: 'One dollar is 100 cents — that is the target.',
      note_id: 'Satu dolar sama dengan 100 sen — itulah targetnya.',
    },
    // question — what to find: how many more cents
    {
      category: 'question',
      phrase_en: 'How many more cents do you need',
      phrase_id: 'Berapa sen lagi yang kamu butuhkan',
      note_en: `Take 100 − ${sum} = ${need} to reach a dollar.`,
      note_id: `Hitung 100 − ${sum} = ${need} untuk mencapai satu dolar.`,
    },
  ]

  return {
    needsVisual: true,
    highlights,

    quantities: [
      { label_en: 'Coins', label_id: 'Koin', value: groupSummary_en },
      { label_en: 'Coin total', label_id: 'Total koin', value: String(sum) },
      { label_en: 'Target', label_id: 'Target', value: '100' },
      { label_en: 'Answer', label_id: 'Jawaban', value: String(need) },
    ],

    strategy: {
      conceptSlug: 'money-coins-total',
      name_en: 'add the coins',
      name_id: 'jumlahkan koin',
    },

    trap: null,

    answer: {
      form: 'number',
      unit: null,
      value: String(need),
    },

    vocab: [],
  }
}
