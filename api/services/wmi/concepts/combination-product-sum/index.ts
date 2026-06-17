import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'
import { buildCombinationProductSumBreakdown } from './breakdown.js'
import { FIND_SUM_PRODUCTS, COUNT_PAIRS_PRODUCTS } from './constants.js'

// ─── Modes ───────────────────────────────────────────────────────────────────
// 'find-larger'  — (original) given sum S and product P of two small whole
//                  numbers, identify the larger one. Small numbers (x ≤ 9, y ≤ 12).
//
// 'find-sum'     — two 2-digit numbers whose product is P (requiring full factor
//                  enumeration or prime factorisation); report their SUM. Uses a
//                  curated set of products whose only 2-digit pair consists of two
//                  distinct primes, so one correct answer is guaranteed.
//
// 'count-pairs'  — given N, count ALL unordered pairs of distinct positive
//                  integers (a < b) with a × b = N. Requires systematic
//                  enumeration of divisors up to √N.
//
// Both new modes require genuine systematic enumeration — not guessable in one step.

export { FIND_SUM_PRODUCTS, COUNT_PAIRS_PRODUCTS }

// ─── Schema ───────────────────────────────────────────────────────────────────
const paramsSchema = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('find-larger'),
    x: z.number().int().min(2).max(11),
    y: z.number().int().min(3).max(12),
  }).refine((v) => v.y > v.x, { message: 'y must be the larger number' }),

  z.object({
    mode: z.literal('find-sum'),
    // Index into FIND_SUM_PRODUCTS; the actual a/b/product/sum are derived.
    idx: z.number().int().min(0).max(FIND_SUM_PRODUCTS.length - 1),
  }),

  z.object({
    mode: z.literal('count-pairs'),
    // Index into COUNT_PAIRS_PRODUCTS; n and count are derived.
    idx: z.number().int().min(0).max(COUNT_PAIRS_PRODUCTS.length - 1),
  }),
])
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'combination-product-sum',
  name_en: 'Two numbers from their sum and product',
  name_id: 'Dua bilangan dari jumlah dan hasil kalinya',
  grades: [3] as const,
  description_id:
    'Cari dua bilangan jika diketahui jumlah dan hasil kalinya, atau faktorkan suatu hasil kali secara sistematis.',
} as const

export function generate(rng: Rng): Params {
  const roll = rng.int(0, 2) // 0 = find-larger, 1 = find-sum, 2 = count-pairs
  if (roll === 0) {
    const x = rng.int(2, 9)
    const y = rng.int(x + 1, 12)
    return { mode: 'find-larger', x, y }
  }
  if (roll === 1) {
    const idx = rng.int(0, FIND_SUM_PRODUCTS.length - 1)
    return { mode: 'find-sum', idx }
  }
  // count-pairs
  const idx = rng.int(0, COUNT_PAIRS_PRODUCTS.length - 1)
  return { mode: 'count-pairs', idx }
}

// ─── Render ───────────────────────────────────────────────────────────────────
export function render(params: Params) {
  if (params.mode === 'find-larger') {
    const sum = params.x + params.y
    const product = params.x * params.y
    return {
      body_en: `Two whole numbers have a sum of ${sum} and a product of ${product}.\nFind: What is the larger of the two numbers?`,
      body_id: `Dua bilangan bulat memiliki jumlah ${sum} dan hasil kali ${product}.\nCari: Berapakah bilangan yang lebih besar dari keduanya?`,
      answer_type: 'fill_in' as const,
      choices_en: null,
      choices_id: null,
      answer: String(params.y),
      hint_en: `Think about pairs of whole numbers that add up to ${sum}, then check which pair also multiplies to ${product}.`,
      hint_id: `Pikirkan pasangan bilangan bulat yang jumlahnya ${sum}, lalu periksa pasangan mana yang hasil kalinya juga ${product}.`,
      hint_steps_en: [
        `The two numbers add to ${sum}, so list pairs that sum to ${sum}: (1, ${sum - 1}), (2, ${sum - 2}), … up to (${params.x}, ${params.y}).`,
        `Multiply each pair and stop when you reach ${product}: ${params.x} × ${params.y} = ${product}. ✓`,
        `The two numbers are ${params.x} and ${params.y}. The larger number is ${params.y}.`,
      ],
      hint_steps_id: [
        `Kedua bilangan berjumlah ${sum}, jadi buat pasangan yang totalnya ${sum}: (1, ${sum - 1}), (2, ${sum - 2}), … sampai (${params.x}, ${params.y}).`,
        `Kalikan setiap pasangan sampai hasilnya ${product}: ${params.x} × ${params.y} = ${product}. ✓`,
        `Kedua bilangan adalah ${params.x} dan ${params.y}. Bilangan yang lebih besar adalah ${params.y}.`,
      ],
      breakdown: buildCombinationProductSumBreakdown(params),
    }
  }

  if (params.mode === 'find-sum') {
    const entry = FIND_SUM_PRODUCTS[params.idx]
    const { a, b, product, sum } = entry
    return {
      body_en: `Two 2-digit numbers have a product of ${product}.\nFind: What is the sum of the two numbers?`,
      body_id: `Dua bilangan dua angka memiliki hasil kali ${product}.\nCari: Berapakah jumlah kedua bilangan tersebut?`,
      answer_type: 'fill_in' as const,
      choices_en: null,
      choices_id: null,
      answer: String(sum),
      hint_en: `Systematically check which pairs of 2-digit numbers multiply to ${product}. Try dividing ${product} by 11, 13, 17, 19, … (the 2-digit primes).`,
      hint_id: `Periksa secara sistematis pasangan bilangan dua angka yang hasil kalinya ${product}. Coba bagi ${product} dengan 11, 13, 17, 19, … (bilangan prima dua angka).`,
      hint_steps_en: [
        `You need two 2-digit numbers (10–99) whose product is ${product}.`,
        `Try dividing: ${product} ÷ ${a} = ${b}. Both ${a} and ${b} are 2-digit numbers. ✓`,
        `Their sum is ${a} + ${b} = ${sum}.`,
      ],
      hint_steps_id: [
        `Kamu butuh dua bilangan dua angka (10–99) yang hasil kalinya ${product}.`,
        `Coba bagi: ${product} ÷ ${a} = ${b}. Kedua-duanya adalah bilangan dua angka. ✓`,
        `Jumlahnya adalah ${a} + ${b} = ${sum}.`,
      ],
      breakdown: buildCombinationProductSumBreakdown(params),
    }
  }

  // count-pairs mode
  const entry = COUNT_PAIRS_PRODUCTS[params.idx]
  const { n, count } = entry
  // Build enumeration list for hint steps
  const pairs: Array<[number, number]> = []
  for (let a = 1; a * a < n; a++) {
    if (n % a === 0) pairs.push([a, n / a])
  }
  const pairStr = pairs.map(([a, b]) => `(${a}, ${b})`).join(', ')
  return {
    body_en: `How many pairs of different positive integers (a, b) with a < b satisfy a × b = ${n}?`,
    body_id: `Berapa banyak pasangan bilangan bulat positif berbeda (a, b) dengan a < b yang memenuhi a × b = ${n}?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(count),
    hint_en: `Look for every divisor of ${n} that is less than √${n} (≈ ${Math.sqrt(n).toFixed(1)}). Each such divisor a gives a valid pair (a, ${n}/a).`,
    hint_id: `Cari setiap pembagi ${n} yang kurang dari √${n} (≈ ${Math.sqrt(n).toFixed(1)}). Setiap pembagi a seperti itu membentuk pasangan (a, ${n}/a).`,
    hint_steps_en: [
      `Test each integer from 1 up to √${n} (≈ ${Math.sqrt(n).toFixed(1)}) and check if it divides ${n} evenly.`,
      `The pairs are: ${pairStr}.`,
      `Count them: there are ${count} pairs.`,
    ],
    hint_steps_id: [
      `Uji setiap bilangan bulat dari 1 hingga √${n} (≈ ${Math.sqrt(n).toFixed(1)}) dan periksa apakah ia membagi ${n} habis.`,
      `Pasangannya adalah: ${pairStr}.`,
      `Hitung: ada ${count} pasangan.`,
    ],
    breakdown: buildCombinationProductSumBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
