import { z } from 'zod'
import type { ConceptLogic, Rng, WmiChoice } from '../types.js'
import { buildDivisibilityMultiplePropertyBreakdown } from './breakdown.js'

const paramsSchema = z.object({
  d: z.number().int().min(2).max(12),
  options: z.array(z.number().int().min(10).max(99)).length(4),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'divisibility-multiple-property',
  name_en: 'Find the multiple',
  name_id: 'Cari kelipatan',
  grades: [2, 3] as const,
  description_id: 'Pilih bilangan yang merupakan kelipatan dari angka tertentu.',
} as const

export function generate(rng: Rng): Params {
  const d = rng.pick([3, 4, 5, 6, 9] as const)
  // keep the multiple a 2-digit number (>= 10, <= 99) to fit the schema bounds
  const correct = d * rng.int(Math.max(2, Math.ceil(10 / d)), Math.floor(99 / d))
  const used = new Set<number>([correct])
  const options: number[] = []
  let guard = 0
  while (options.length < 3 && guard++ < 300) {
    const n = rng.int(10, 99)
    if (used.has(n) || n % d === 0) continue
    used.add(n)
    options.push(n)
  }
  return { d, options: rng.shuffle([correct, ...options]) }
}

// Returns a short divisibility rule phrase for common divisors.
function divisibilityRule_en(d: number): string {
  if (d === 3) return 'A number is divisible by 3 if its digit sum is divisible by 3.'
  if (d === 4) return 'A number is divisible by 4 if its last two digits form a number divisible by 4.'
  if (d === 5) return 'A number is divisible by 5 if it ends in 0 or 5.'
  if (d === 6) return 'A number is divisible by 6 if it is divisible by both 2 and 3.'
  if (d === 9) return 'A number is divisible by 9 if its digit sum is divisible by 9.'
  return `A number is divisible by ${d} if it divides evenly with no remainder.`
}

function divisibilityRule_id(d: number): string {
  if (d === 3) return 'Suatu bilangan habis dibagi 3 jika jumlah digitnya habis dibagi 3.'
  if (d === 4) return 'Suatu bilangan habis dibagi 4 jika dua digit terakhirnya membentuk bilangan yang habis dibagi 4.'
  if (d === 5) return 'Suatu bilangan habis dibagi 5 jika berakhiran 0 atau 5.'
  if (d === 6) return 'Suatu bilangan habis dibagi 6 jika habis dibagi 2 sekaligus habis dibagi 3.'
  if (d === 9) return 'Suatu bilangan habis dibagi 9 jika jumlah digitnya habis dibagi 9.'
  return `Suatu bilangan habis dibagi ${d} jika tidak ada sisa pembagian.`
}

// Check phrase for a single candidate.
function checkPhrase_en(n: number, d: number): string {
  const rem = n % d
  if (d === 3 || d === 9) {
    const digitSum = Math.floor(n / 10) + (n % 10)
    const verdict = rem === 0 ? `${digitSum} ÷ ${d} = ${digitSum / d} ✓` : `${digitSum} ÷ ${d} has remainder ${digitSum % d} ✗`
    return `${n}: digit sum = ${digitSum}, ${verdict}`
  }
  if (d === 5) {
    const verdict = rem === 0 ? `ends in ${n % 10} ✓` : `ends in ${n % 10} ✗`
    return `${n}: ${verdict}`
  }
  const verdict = rem === 0 ? `${n} ÷ ${d} = ${n / d} ✓` : `${n} ÷ ${d} = ${Math.floor(n / d)} remainder ${rem} ✗`
  return `${n}: ${verdict}`
}

function checkPhrase_id(n: number, d: number): string {
  const rem = n % d
  if (d === 3 || d === 9) {
    const digitSum = Math.floor(n / 10) + (n % 10)
    const verdict = rem === 0 ? `${digitSum} ÷ ${d} = ${digitSum / d} ✓` : `${digitSum} ÷ ${d} bersisa ${digitSum % d} ✗`
    return `${n}: jumlah digit = ${digitSum}, ${verdict}`
  }
  if (d === 5) {
    const verdict = rem === 0 ? `berakhiran ${n % 10} ✓` : `berakhiran ${n % 10} ✗`
    return `${n}: ${verdict}`
  }
  const verdict = rem === 0 ? `${n} ÷ ${d} = ${n / d} ✓` : `${n} ÷ ${d} = ${Math.floor(n / d)} sisa ${rem} ✗`
  return `${n}: ${verdict}`
}

export function render(params: Params) {
  const labels = ['A', 'B', 'C', 'D'] as const
  const choices: WmiChoice[] = labels.map((label, i) => ({ label, text: String(params.options[i]) }))
  const correctIdx = params.options.findIndex((n) => n % params.d === 0)
  const { d, options } = params
  const correct = options[correctIdx]

  const hint_steps_en: string[] = [
    divisibilityRule_en(d),
    ...options.map((n) => checkPhrase_en(n, d)),
    `Only ${correct} passes the check, so the answer is ${labels[correctIdx]}.`,
  ]

  const hint_steps_id: string[] = [
    divisibilityRule_id(d),
    ...options.map((n) => checkPhrase_id(n, d)),
    `Hanya ${correct} yang lolos uji, sehingga jawabannya adalah ${labels[correctIdx]}.`,
  ]

  return {
    body_en: `Four two-digit numbers are shown below. Find: Which number is a multiple of ${d}?`,
    body_id: `Empat bilangan dua digit ditampilkan di bawah ini. Cari: Bilangan manakah yang merupakan [[multiple|kelipatan]] ${d}?`,
    answer_type: 'multiple_choice' as const,
    choices_en: choices,
    choices_id: choices,
    answer: labels[correctIdx],
    hint_en: `Use the divisibility rule for ${d} to test each option — only one will divide evenly.`,
    hint_id: `Gunakan aturan [[divisibility|keterbagian]] untuk ${d} dan uji setiap pilihan — hanya satu yang habis dibagi.`,
    hint_steps_en,
    hint_steps_id,
    breakdown: buildDivisibilityMultiplePropertyBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
