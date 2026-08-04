import type { Breakdown, BreakdownHighlight } from '../types.js'
import { type Params, computeSumDiff, CONTEXTS } from './index.js'

const LABELS = ['A', 'B', 'C', 'D'] as const

const parity_en = (n: number) => (n % 2 === 1 ? 'odd' : 'even')

// ─── pair-parity breakdown ───────────────────────────────────────────────────

function buildPairParityBreakdown(params: Extract<Params, { mode: 'pair-parity' }>): Breakdown {
  const correctIdx = params.options.findIndex((p) => (p.x + p.y) % 2 === 1)
  const answerLabel = LABELS[correctIdx]
  const { x, y } = params.options[correctIdx]
  const optionList = params.options.map((p) => `${p.x} + ${p.y}`).join(', ')

  const highlights: BreakdownHighlight[] = [
    {
      category: 'fact',
      phrase_en: 'Four addition expressions',
      phrase_id: 'Empat ekspresi penjumlahan',
      note_en: 'There are 4 sums to check — look at the parity of each addend.',
      note_id: 'Ada 4 penjumlahan untuk diperiksa — lihat paritas tiap suku.',
    },
    // The bare word "odd" / "ganjil" used to sit here as its own condition
    // highlight, but it occurs only inside the question phrase below, so the two
    // fought over one span and one of them was always dropped. The parity rule
    // is folded into the question note instead.
    {
      category: 'question',
      phrase_en: 'Which expression gives an odd answer',
      phrase_id: 'Ekspresi mana yang hasilnya ganjil',
      note_en: `A sum is odd only when one addend is odd and the other even — that is ${answerLabel}.`,
      note_id: `Hasil ganjil hanya jika satu suku ganjil dan satu genap — yaitu ${answerLabel}.`,
    },
  ]

  return {
    needsVisual: false,
    highlights,
    quantities: [
      { label_en: 'Expressions', label_id: 'Ekspresi', value: optionList },
      { label_en: 'Rule', label_id: 'Aturan', value: 'odd + even = odd' },
      {
        label_en: 'Answer',
        label_id: 'Jawaban',
        value: `${answerLabel} (${x} ${parity_en(x)} + ${y} ${parity_en(y)} = odd)`,
      },
    ],
    strategy: {
      conceptSlug: 'odd-even-reasoning',
      name_en: 'Check each addend parity',
      name_id: 'Periksa paritas tiap suku',
    },
    trap: null,
    answer: { form: 'choice', unit: null, value: String(answerLabel) },
    vocab: [],
  }
}

// ─── sum-diff breakdown (sum-diff + sum-diff-ctx) ───────────────────────────
//
// Both modes share the maths but NOT their wording, and that used to be the bug:
// one set of phrases was written for the plain mode and reused for the context
// mode, where the body says "the odd ages" rather than "odd numbers". Highlight
// phrases must be exact substrings of the body or the refined renderer silently
// stops highlighting — measured at 321 of 400 generated instances before this.
//
// So every phrase below is built from the same pieces the body is built from.
// The plain mode's Indonesian intro also begins the sentence, so its phrase has
// to carry the capital "B" the body actually prints.

/** The nouns the context mode substitutes into its body, or null for plain mode. */
export interface SumDiffWording {
  noun_en: string
  noun_id: string
}

function buildSumDiffBreakdown(numbers: number[], w: SumDiffWording | null): Breakdown {
  const odds = numbers.filter((n) => n % 2 === 1)
  const evens = numbers.filter((n) => n % 2 === 0)
  const sumOdd = odds.reduce((a, b) => a + b, 0)
  const sumEven = evens.reduce((a, b) => a + b, 0)
  const diff = computeSumDiff(numbers)

  const highlights: BreakdownHighlight[] = [
    {
      category: 'fact',
      // The context mode's intro differs per context and capitalises its first
      // word, so the one thing guaranteed present in both modes and both
      // languages is the list of numbers itself — which is the fact anyway.
      phrase_en: w ? numbers.join(', ') : 'following numbers',
      phrase_id: w ? numbers.join(', ') : 'Bilangan-bilangan berikut',
      note_en: `${numbers.length} numbers to sort into odd and even groups.`,
      note_id: `${numbers.length} bilangan yang harus dikelompokkan jadi ganjil dan genap.`,
    },
    {
      category: 'condition',
      phrase_en: w ? `odd ${w.noun_en}` : 'odd numbers',
      phrase_id: w ? `${w.noun_id} ganjil` : 'bilangan ganjil',
      note_en: `Odd group: ${odds.join(', ')} — sum = ${sumOdd}.`,
      note_id: `Kelompok ganjil: ${odds.join(', ')} — jumlah = ${sumOdd}.`,
    },
    {
      category: 'condition',
      phrase_en: w ? `even ${w.noun_en}` : 'even numbers',
      phrase_id: w ? `${w.noun_id} genap` : 'bilangan genap',
      note_en: `Even group: ${evens.join(', ')} — sum = ${sumEven}.`,
      note_id: `Kelompok genap: ${evens.join(', ')} — jumlah = ${sumEven}.`,
    },
    {
      category: 'question',
      phrase_en: 'absolute difference',
      phrase_id: 'selisih mutlak',
      note_en: `|${sumOdd} − ${sumEven}| = ${diff}.`,
      note_id: `|${sumOdd} − ${sumEven}| = ${diff}.`,
    },
  ]

  return {
    needsVisual: false,
    highlights,
    quantities: [
      { label_en: 'All numbers', label_id: 'Semua bilangan', value: numbers.join(', ') },
      { label_en: 'Odd sum', label_id: 'Jumlah ganjil', value: `${odds.join(' + ')} = ${sumOdd}` },
      { label_en: 'Even sum', label_id: 'Jumlah genap', value: `${evens.join(' + ')} = ${sumEven}` },
      { label_en: 'Answer', label_id: 'Jawaban', value: `|${sumOdd} − ${sumEven}| = ${diff}` },
    ],
    strategy: {
      conceptSlug: 'odd-even-reasoning',
      name_en: 'Group by parity, sum each group, subtract',
      name_id: 'Kelompokkan berdasarkan paritas, jumlahkan tiap kelompok, kurangi',
    },
    trap: {
      wrong: String(sumOdd + sumEven),
      why_en: 'Adding all numbers gives the total, not the difference between groups.',
      why_id: 'Menjumlahkan semua bilangan memberi total, bukan selisih antar kelompok.',
    },
    answer: { form: 'number', unit: null, value: String(diff) },
    vocab: [],
  }
}

// ─── dispatch ────────────────────────────────────────────────────────────────

export function buildOddEvenReasoningBreakdown(params: Params): Breakdown {
  if (params.mode === 'pair-parity') return buildPairParityBreakdown(params)
  // The context mode renames "numbers" to its own noun ("ages", "usia"), so the
  // breakdown has to be built from the same noun or its phrases never match.
  const w =
    params.mode === 'sum-diff-ctx'
      ? { noun_en: CONTEXTS[params.contextKey].noun_en, noun_id: CONTEXTS[params.contextKey].noun_id }
      : null
  return buildSumDiffBreakdown(params.numbers, w)
}
