import type { Breakdown, BreakdownHighlight } from '../types.js'
import { type Params, computeSumDiff } from './index.js'

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
    {
      category: 'condition',
      phrase_en: 'odd',
      phrase_id: 'ganjil',
      note_en: 'A sum is odd only when one addend is odd and the other is even.',
      note_id: 'Hasil ganjil hanya jika satu suku ganjil dan satu suku genap.',
    },
    {
      category: 'question',
      phrase_en: 'Which expression gives an odd answer',
      phrase_id: 'Ekspresi mana yang hasilnya ganjil',
      note_en: `Pick the one with one odd + one even addend — that is ${answerLabel}.`,
      note_id: `Pilih yang punya satu suku ganjil + satu genap — yaitu ${answerLabel}.`,
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

// ─── sum-diff breakdown (shared by sum-diff + sum-diff-ctx) ─────────────────

function buildSumDiffBreakdown(numbers: number[]): Breakdown {
  const odds = numbers.filter((n) => n % 2 === 1)
  const evens = numbers.filter((n) => n % 2 === 0)
  const sumOdd = odds.reduce((a, b) => a + b, 0)
  const sumEven = evens.reduce((a, b) => a + b, 0)
  const diff = computeSumDiff(numbers)

  const highlights: BreakdownHighlight[] = [
    {
      category: 'fact',
      phrase_en: 'following numbers',
      phrase_id: 'bilangan-bilangan berikut',
      note_en: `${numbers.length} numbers to sort into odd and even groups.`,
      note_id: `${numbers.length} bilangan yang harus dikelompokkan jadi ganjil dan genap.`,
    },
    {
      category: 'condition',
      phrase_en: 'odd numbers',
      phrase_id: 'bilangan ganjil',
      note_en: `Odd group: ${odds.join(', ')} — sum = ${sumOdd}.`,
      note_id: `Kelompok ganjil: ${odds.join(', ')} — jumlah = ${sumOdd}.`,
    },
    {
      category: 'condition',
      phrase_en: 'even numbers',
      phrase_id: 'bilangan genap',
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
  return buildSumDiffBreakdown(params.numbers)
}
