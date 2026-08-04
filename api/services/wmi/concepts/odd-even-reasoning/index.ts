import { z } from 'zod'
import type { ConceptLogic, Rng, WmiChoice } from '../types.js'
import { buildOddEvenReasoningBreakdown } from './breakdown.js'

// ─── schemas ────────────────────────────────────────────────────────────────

const pairSchema = z.object({
  x: z.number().int().min(1).max(99),
  y: z.number().int().min(1).max(99),
})

const pairParitySchema = z.object({
  mode: z.literal('pair-parity'),
  options: z.array(pairSchema).length(4),
})

const sumDiffSchema = z.object({
  mode: z.literal('sum-diff'),
  numbers: z.array(z.number().int().min(1).max(99)).min(8).max(10),
})

const sumDiffCtxSchema = z.object({
  mode: z.literal('sum-diff-ctx'),
  numbers: z.array(z.number().int().min(1).max(99)).min(8).max(10),
  /** 0 = points, 1 = ages, 2 = tickets */
  contextKey: z.number().int().min(0).max(2),
})

const paramsSchema = z.discriminatedUnion('mode', [pairParitySchema, sumDiffSchema, sumDiffCtxSchema])
export type Params = z.infer<typeof paramsSchema>

// ─── meta ───────────────────────────────────────────────────────────────────

export const meta = {
  slug: 'odd-even-reasoning',
  name_en: 'Odd and even reasoning',
  name_id: 'Penalaran ganjil dan genap',
  grades: [1, 2, 3] as const,
  description_id: 'Terapkan aturan ganjil/genap: bedakan, jumlahkan, dan temukan selisih absolut.',
} as const

// ─── helpers ────────────────────────────────────────────────────────────────

const oddIn = (rng: Rng, lo: number, hi: number) => {
  const v = rng.int(lo, hi % 2 === 0 ? hi - 1 : hi)
  return v % 2 === 0 ? v + 1 : v
}
const evenIn = (rng: Rng, lo: number, hi: number) => {
  const v = rng.int(lo % 2 === 0 ? lo : lo + 1, hi)
  return v % 2 === 0 ? v : v + 1
}

/** Generate a list of n numbers in [1,99] with at least 2 odds and 2 evens. */
function makeNumberList(rng: Rng, n: number): number[] {
  const nums: number[] = []
  // Seed with at least 2 odds + 2 evens
  nums.push(oddIn(rng, 1, 99))
  nums.push(oddIn(rng, 1, 99))
  nums.push(evenIn(rng, 2, 98))
  nums.push(evenIn(rng, 2, 98))
  for (let i = 4; i < n; i++) {
    nums.push(rng.int(1, 99))
  }
  return rng.shuffle(nums)
}

/** |sum of odds − sum of evens| for a list */
export function computeSumDiff(numbers: number[]): number {
  let sumOdd = 0
  let sumEven = 0
  for (const n of numbers) {
    if (n % 2 === 1) sumOdd += n
    else sumEven += n
  }
  return Math.abs(sumOdd - sumEven)
}

// ─── generate ───────────────────────────────────────────────────────────────

export function generate(rng: Rng): Params {
  // Weighted: 20% pair-parity (legacy, simpler), 40% sum-diff, 40% sum-diff-ctx
  const roll = rng.int(0, 9)
  if (roll <= 1) {
    // pair-parity: exactly one pair has an odd sum
    const odd = { x: oddIn(rng, 1, 99), y: evenIn(rng, 2, 98) }
    const evens: { x: number; y: number }[] = []
    for (let i = 0; i < 3; i++) {
      if (rng.int(0, 1) === 0) evens.push({ x: oddIn(rng, 1, 99), y: oddIn(rng, 1, 99) })
      else evens.push({ x: evenIn(rng, 2, 98), y: evenIn(rng, 2, 98) })
    }
    return { mode: 'pair-parity', options: rng.shuffle([odd, ...evens]) }
  } else if (roll <= 5) {
    const n = rng.int(8, 10)
    return { mode: 'sum-diff', numbers: makeNumberList(rng, n) }
  } else {
    const n = rng.int(8, 10)
    const contextKey = rng.int(0, 2)
    return { mode: 'sum-diff-ctx', numbers: makeNumberList(rng, n), contextKey }
  }
}

// ─── contexts ───────────────────────────────────────────────────────────────

export const CONTEXTS = [
  {
    noun_en: 'points scored',
    noun_id: 'poin yang dicetak',
    subject_en: 'players in a game',
    subject_id: 'pemain dalam permainan',
    intro_en: (list: string) =>
      `In a game, the points scored by each player are: ${list}.`,
    intro_id: (list: string) =>
      `Dalam sebuah permainan, poin yang dicetak oleh setiap pemain adalah: ${list}.`,
  },
  {
    noun_en: 'ages',
    noun_id: 'usia',
    subject_en: 'people at a gathering',
    subject_id: 'orang-orang di suatu pertemuan',
    intro_en: (list: string) =>
      `The ages of people at a gathering are: ${list}.`,
    intro_id: (list: string) =>
      `Usia orang-orang di suatu pertemuan adalah: ${list}.`,
  },
  {
    noun_en: 'ticket numbers',
    noun_id: 'nomor tiket',
    subject_en: 'participants',
    subject_id: 'peserta',
    intro_en: (list: string) =>
      `Participants have ticket numbers: ${list}.`,
    intro_id: (list: string) =>
      `Para peserta memiliki nomor tiket: ${list}.`,
  },
] as const

// ─── render ─────────────────────────────────────────────────────────────────

export function render(params: Params) {
  if (params.mode === 'pair-parity') {
    const labels = ['A', 'B', 'C', 'D'] as const
    const choices: WmiChoice[] = labels.map((label, i) => ({
      label,
      text: `${params.options[i].x} + ${params.options[i].y}`,
    }))
    const correctIdx = params.options.findIndex((p) => (p.x + p.y) % 2 === 1)
    const { x, y } = params.options[correctIdx]
    const parityOf = (n: number) => (n % 2 === 1 ? 'odd' : 'even')
    const paritasDari = (n: number) => (n % 2 === 1 ? 'ganjil' : 'genap')
    return {
      body_en: `Four addition expressions are shown below. Find: Which expression gives an odd answer?`,
      body_id: `Empat ekspresi penjumlahan ditampilkan di bawah ini. Cari: Ekspresi mana yang hasilnya ganjil?`,
      answer_type: 'multiple_choice' as const,
      choices_en: choices,
      choices_id: choices,
      answer: labels[correctIdx],
      hint_en: `Check the parity of each addend — a sum is odd only when one addend is odd and the other is even.`,
      hint_id: `Periksa paritas setiap suku — hasil penjumlahan ganjil hanya jika satu suku ganjil dan satu suku genap.`,
      hint_steps_en: [
        `Rule: odd + even = odd; odd + odd = even; even + even = even.`,
        `Check each option by looking at whether each addend ends in an odd or even digit.`,
        `Option ${labels[correctIdx]}: ${x} is ${parityOf(x)} and ${y} is ${parityOf(y)}, so ${x} + ${y} is odd.`,
        `The other three options each have two addends of the same parity, giving an even sum.`,
      ],
      hint_steps_id: [
        `Aturan: ganjil + genap = ganjil; ganjil + ganjil = genap; genap + genap = genap.`,
        `Periksa setiap pilihan dengan melihat apakah setiap suku berakhir dengan angka ganjil atau genap.`,
        `Pilihan ${labels[correctIdx]}: ${x} bersifat ${paritasDari(x)} dan ${y} bersifat ${paritasDari(y)}, sehingga ${x} + ${y} hasilnya ganjil.`,
        `Ketiga pilihan lainnya memiliki dua suku dengan paritas yang sama, sehingga hasilnya genap.`,
      ],
      breakdown: buildOddEvenReasoningBreakdown(params),
    }
  }

  // sum-diff and sum-diff-ctx share the same computation
  const { numbers } = params
  const list = numbers.join(', ')
  const odds = numbers.filter((n) => n % 2 === 1)
  const evens = numbers.filter((n) => n % 2 === 0)
  const sumOdd = odds.reduce((a, b) => a + b, 0)
  const sumEven = evens.reduce((a, b) => a + b, 0)
  const diff = Math.abs(sumOdd - sumEven)
  const answer = String(diff)

  if (params.mode === 'sum-diff') {
    const oddsStr = odds.join(' + ') || '0'
    const evensStr = evens.join(' + ') || '0'
    return {
      body_en: `The following numbers are given: ${list}.\n\nFind: What is the absolute difference between the sum of all odd numbers and the sum of all even numbers in the list?`,
      body_id: `Bilangan-bilangan berikut diberikan: ${list}.\n\nCari: Berapa selisih mutlak antara jumlah semua bilangan ganjil dan jumlah semua bilangan genap dalam daftar tersebut?`,
      answer_type: 'fill_in' as const,
      choices_en: null,
      choices_id: null,
      answer,
      hint_en: `Separate the numbers by parity, sum each group, then find the absolute difference.`,
      hint_id: `Pisahkan bilangan berdasarkan paritas, jumlahkan tiap kelompok, lalu cari selisih mutlaknya.`,
      hint_steps_en: [
        `Separate odd numbers: ${oddsStr} → sum = ${sumOdd}.`,
        `Separate even numbers: ${evensStr} → sum = ${sumEven}.`,
        `Absolute difference: |${sumOdd} − ${sumEven}| = ${diff}.`,
      ],
      hint_steps_id: [
        `Pisahkan bilangan ganjil: ${oddsStr} → jumlah = ${sumOdd}.`,
        `Pisahkan bilangan genap: ${evensStr} → jumlah = ${sumEven}.`,
        `Selisih mutlak: |${sumOdd} − ${sumEven}| = ${diff}.`,
      ],
      breakdown: buildOddEvenReasoningBreakdown(params),
    }
  }

  // sum-diff-ctx
  const ctx = CONTEXTS[params.contextKey]
  const oddsStr = odds.join(' + ') || '0'
  const evensStr = evens.join(' + ') || '0'
  return {
    body_en: `${ctx.intro_en(list)}\n\nFind: What is the absolute difference between the sum of the odd ${ctx.noun_en} and the sum of the even ${ctx.noun_en}?`,
    body_id: `${ctx.intro_id(list)}\n\nCari: Berapa selisih mutlak antara jumlah ${ctx.noun_id} ganjil dan jumlah ${ctx.noun_id} genap?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer,
    hint_en: `Separate the ${ctx.noun_en} by parity, sum each group, then subtract.`,
    hint_id: `Pisahkan ${ctx.noun_id} berdasarkan paritas, jumlahkan tiap kelompok, lalu kurangkan.`,
    hint_steps_en: [
      `Odd ${ctx.noun_en}: ${oddsStr} → sum = ${sumOdd}.`,
      `Even ${ctx.noun_en}: ${evensStr} → sum = ${sumEven}.`,
      `Absolute difference: |${sumOdd} − ${sumEven}| = ${diff}.`,
    ],
    hint_steps_id: [
      `${ctx.noun_id} ganjil: ${oddsStr} → jumlah = ${sumOdd}.`,
      `${ctx.noun_id} genap: ${evensStr} → jumlah = ${sumEven}.`,
      `Selisih mutlak: |${sumOdd} − ${sumEven}| = ${diff}.`,
    ],
    breakdown: buildOddEvenReasoningBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
