import type { Breakdown, BreakdownHighlight } from '../types.js'
import type { Params } from './index.js'

// Authored decomposition of a lacking-money-shared problem: two people each lack
// some money for the same item; combining their money is exactly enough, so the
// two shortfalls together equal the price. We never state the price — it is the
// hidden quantity the solver must build. Each highlight phrase MUST be an exact
// substring of the DISPLAY body (after stripSectionLabels; no glossary markup
// here, so the body text is otherwise unchanged).
export function buildLackingMoneySharedBreakdown(params: Params): Breakdown {
  const price = params.lackA + params.lackB
  const answer = params.lackB // nameA's money = price − lackA = lackB

  const highlights: BreakdownHighlight[] = [
    // facts — how much each person is short
    {
      category: 'fact',
      phrase_en: `${params.nameA} is $${params.lackA} short`,
      phrase_id: `${params.nameA} kurang Rp${params.lackA}`,
      note_en: `${params.nameA} needs $${params.lackA} more to afford the cake.`,
      note_id: `${params.nameA} masih perlu Rp${params.lackA} lagi untuk membeli kue.`,
    },
    {
      category: 'fact',
      phrase_en: `${params.nameB} is $${params.lackB} short`,
      phrase_id: `${params.nameB} kurang Rp${params.lackB}`,
      note_en: `${params.nameB} needs $${params.lackB} more to afford the cake.`,
      note_id: `${params.nameB} masih perlu Rp${params.lackB} lagi untuk membeli kue.`,
    },
    // condition — combining their money is exactly the price
    {
      category: 'condition',
      phrase_en: 'they combine their money it is exactly enough',
      phrase_id: 'uang mereka digabungkan, tepat cukup',
      note_en: 'Their two shortfalls add up to exactly one cake price.',
      note_id: 'Kedua kekurangan mereka dijumlahkan tepat sama dengan harga satu kue.',
    },
    // question — what we are asked to find
    {
      category: 'question',
      phrase_en: `How much money does ${params.nameA} have?`,
      phrase_id: `Berapa uang yang dimiliki ${params.nameA}?`,
      note_en: `Find ${params.nameA}'s money: cake price minus what ${params.nameA} is short.`,
      note_id: `Cari uang ${params.nameA}: harga kue dikurangi kekurangan ${params.nameA}.`,
    },
  ]

  return {
    needsVisual: false,
    highlights,

    quantities: [
      { label_en: `${params.nameA} is short`, label_id: `${params.nameA} kurang`, value: String(params.lackA) },
      { label_en: `${params.nameB} is short`, label_id: `${params.nameB} kurang`, value: String(params.lackB) },
      { label_en: 'Cake price', label_id: 'Harga kue', value: String(price) },
      { label_en: `${params.nameA}'s money`, label_id: `Uang ${params.nameA}`, value: String(answer) },
    ],

    strategy: {
      conceptSlug: 'lacking-money-shared',
      name_en: 'price − money they have',
      name_id: 'harga − uang yang dimiliki',
    },

    // Genuine trap: the two shortfalls add to the PRICE, so a solver who stops
    // at lackA + lackB reports the cake price instead of nameA's money.
    trap: {
      wrong: String(price),
      why_en: `$${params.lackA} + $${params.lackB} = $${price} is the cake price, not ${params.nameA}'s money.`,
      why_id: `Rp${params.lackA} + Rp${params.lackB} = Rp${price} adalah harga kue, bukan uang ${params.nameA}.`,
    },

    answer: {
      form: 'number',
      unit: null,
      value: String(answer),
    },

    vocab: [],
  }
}
