import type { Breakdown, BreakdownHighlight } from '../types.js'
import { evaluate, type Params } from './index.js'

// Authored decomposition of an alternating-chain-eval problem: a chain like
// `34 + 7 − 12 + 5` that you evaluate from left to right, one step at a time.
// The learner-facing part is a set of color-coded, clickable highlights over the
// problem text. Each phrase MUST be an exact substring of the DISPLAY body, which
// for this concept is `Compute <expr>.` / `Hitunglah <expr>.` after stripSectionLabels
// removes the leading "Find:" / "Cari:". The chain uses the Unicode minus sign
// (U+2212, "−") for subtraction, matching render().
export function buildAlternatingChainEvalBreakdown(params: Params): Breakdown {
  const answer = evaluate(params)

  // The numbers a kid reads in the chain, in order: the start, then each step's
  // value. Highlight every distinct value once (duplicates light up together).
  const numbers = [params.start, ...params.steps.map((s) => s.n)]
  const seen = new Set<number>()
  const numberHighlights: BreakdownHighlight[] = []
  for (const n of numbers) {
    if (seen.has(n)) continue
    seen.add(n)
    const isStart = n === params.start && numberHighlights.length === 0
    numberHighlights.push({
      category: 'fact',
      phrase_en: String(n),
      phrase_id: String(n),
      note_en: isStart
        ? `Start here, at ${n}.`
        : `One of the numbers in the chain: ${n}.`,
      note_id: isStart
        ? `Mulai di sini, dari ${n}.`
        : `Salah satu bilangan dalam rantai: ${n}.`,
    })
  }

  // Which operator signs appear, so we only highlight signs that are really there.
  const hasPlus = params.steps.some((s) => s.op === '+')
  const hasMinus = params.steps.some((s) => s.op === '-')
  const opHighlights: BreakdownHighlight[] = []
  if (hasPlus) {
    opHighlights.push({
      category: 'condition',
      phrase_en: '+',
      phrase_id: '+',
      note_en: 'A "+" means add the next number to your running total.',
      note_id: 'Tanda "+" berarti tambahkan bilangan berikutnya ke jumlah berjalan.',
    })
  }
  if (hasMinus) {
    opHighlights.push({
      category: 'condition',
      // U+2212 minus sign — matches the "−" used in render()'s expression.
      phrase_en: '−',
      phrase_id: '−',
      note_en: 'A "−" means take the next number away from your running total.',
      note_id: 'Tanda "−" berarti kurangi jumlah berjalan dengan bilangan berikutnya.',
    })
  }

  const highlights: BreakdownHighlight[] = [
    ...numberHighlights,
    ...opHighlights,
    // question — what to do: go left to right, one step at a time.
    {
      category: 'question',
      phrase_en: 'Compute',
      phrase_id: 'Hitunglah',
      note_en: 'Work from left to right, one step at a time, keeping a running total.',
      note_id: 'Kerjakan dari kiri ke kanan, satu langkah demi satu, jaga jumlah berjalan.',
    },
  ]

  const chain = `${params.start} ${params.steps
    .map((s) => `${s.op === '+' ? '+' : '−'} ${s.n}`)
    .join(' ')}`

  return {
    needsVisual: false,
    highlights,

    quantities: [
      { label_en: 'Start', label_id: 'Mulai', value: String(params.start) },
      { label_en: 'Chain', label_id: 'Rantai', value: chain },
      { label_en: 'Answer', label_id: 'Jawaban', value: String(answer) },
    ],

    strategy: {
      conceptSlug: 'alternating-chain-eval',
      name_en: 'go left to right',
      name_id: 'kerjakan dari kiri ke kanan',
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
