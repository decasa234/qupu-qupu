import { z } from 'zod'
import type { ConceptLogic, Rng, WmiChoice } from '../types.js'
import { buildDivisibilityMultiplePropertyBreakdown } from './breakdown.js'

// ─── Params (discriminated union by mode) ────────────────────────────────────
// pick-multiple : original mode — 4 choices, pick the one multiple of d
// multi-divisor : find smallest number > base divisible by BOTH k and m (LCM)
// make-divisible: find smallest x ≥ 1 so that (n + x) is a multiple of d

const pickMultipleSchema = z.object({
  mode: z.literal('pick-multiple'),
  d: z.number().int().min(2).max(12),
  options: z.array(z.number().int().min(10).max(200)).length(4),
})

const multiDivisorSchema = z.object({
  mode: z.literal('multi-divisor'),
  k: z.number().int().min(2).max(9),
  m: z.number().int().min(2).max(9),
  base: z.number().int().min(10).max(200),
  // answer = smallest multiple of lcm(k,m) that is > base
  answer: z.number().int().min(1),
})

const makeDivisibleSchema = z.object({
  mode: z.literal('make-divisible'),
  d: z.number().int().min(3).max(12),
  n: z.number().int().min(10).max(199),
  // answer = smallest x ≥ 1 so that (n + x) % d === 0
  x: z.number().int().min(1).max(11),
})

export const paramsSchema = z.discriminatedUnion('mode', [
  pickMultipleSchema,
  multiDivisorSchema,
  makeDivisibleSchema,
])
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'divisibility-multiple-property',
  name_en: 'Find the multiple',
  name_id: 'Cari kelipatan',
  grades: [2, 3] as const,
  description_id: 'Pilih bilangan yang merupakan kelipatan dari angka tertentu.',
} as const

// ─── Helpers ─────────────────────────────────────────────────────────────────
function gcd(a: number, b: number): number {
  while (b !== 0) {
    const t = b
    b = a % b
    a = t
  }
  return a
}

function lcm(a: number, b: number): number {
  return (a / gcd(a, b)) * b
}

// ─── Generate ────────────────────────────────────────────────────────────────
export function generate(rng: Rng): Params {
  const mode = rng.pick(['pick-multiple', 'multi-divisor', 'make-divisible'] as const)

  if (mode === 'pick-multiple') {
    // Wider range than before: 2-digit and 3-digit numbers up to 200
    const d = rng.pick([3, 4, 5, 6, 9, 12] as const)
    const minMultiple = Math.max(2, Math.ceil(10 / d))
    const maxMultiple = Math.floor(150 / d)
    const correctVal = d * rng.int(minMultiple, maxMultiple)
    const used = new Set<number>([correctVal])
    const options: number[] = []
    let guard = 0
    while (options.length < 3 && guard++ < 500) {
      const n = rng.int(10, 150)
      if (used.has(n) || n % d === 0) continue
      used.add(n)
      options.push(n)
    }
    return { mode: 'pick-multiple', d, options: rng.shuffle([correctVal, ...options]) }
  }

  if (mode === 'multi-divisor') {
    // Pick two distinct coprime-ish divisors so LCM is interesting
    const pairs: readonly (readonly [number, number])[] = [
      [3, 4], [3, 5], [4, 5], [2, 9], [3, 8], [4, 9], [5, 6], [2, 7], [3, 7], [4, 7], [5, 7],
    ] as const
    const [k, m] = rng.pick(pairs)
    const l = lcm(k, m)
    // base in range [20, 120]; answer is first multiple of l above base
    const base = rng.int(20, 120)
    const answer = Math.ceil((base + 1) / l) * l
    return { mode: 'multi-divisor', k, m, base, answer }
  }

  // make-divisible
  const d = rng.pick([3, 4, 5, 6, 8, 9, 12] as const)
  // n must not already be divisible by d; remainder must be non-zero → x = d - rem ∈ [1, d-1]
  let n: number
  let guard2 = 0
  do {
    n = rng.int(20, 199)
    guard2++
  } while (n % d === 0 && guard2 < 200)
  const rem = n % d
  const x = d - rem // smallest positive x so (n+x) % d === 0
  return { mode: 'make-divisible', d, n, x }
}

// ─── Divisibility rule text ───────────────────────────────────────────────────
function divisibilityRule_en(d: number): string {
  if (d === 3) return 'A number is divisible by 3 if its digit sum is divisible by 3.'
  if (d === 4) return 'A number is divisible by 4 if its last two digits form a number divisible by 4.'
  if (d === 5) return 'A number is divisible by 5 if it ends in 0 or 5.'
  if (d === 6) return 'A number is divisible by 6 if it is divisible by both 2 and 3.'
  if (d === 8) return 'A number is divisible by 8 if its last three digits form a number divisible by 8.'
  if (d === 9) return 'A number is divisible by 9 if its digit sum is divisible by 9.'
  if (d === 12) return 'A number is divisible by 12 if it is divisible by both 3 and 4.'
  return `A number is divisible by ${d} if it divides evenly with no remainder.`
}

function divisibilityRule_id(d: number): string {
  if (d === 3) return 'Suatu bilangan habis dibagi 3 jika jumlah digitnya habis dibagi 3.'
  if (d === 4) return 'Suatu bilangan habis dibagi 4 jika dua digit terakhirnya membentuk bilangan yang habis dibagi 4.'
  if (d === 5) return 'Suatu bilangan habis dibagi 5 jika berakhiran 0 atau 5.'
  if (d === 6) return 'Suatu bilangan habis dibagi 6 jika habis dibagi 2 sekaligus habis dibagi 3.'
  if (d === 8) return 'Suatu bilangan habis dibagi 8 jika tiga digit terakhirnya membentuk bilangan yang habis dibagi 8.'
  if (d === 9) return 'Suatu bilangan habis dibagi 9 jika jumlah digitnya habis dibagi 9.'
  if (d === 12) return 'Suatu bilangan habis dibagi 12 jika habis dibagi 3 sekaligus habis dibagi 4.'
  return `Suatu bilangan habis dibagi ${d} jika tidak ada sisa pembagian.`
}

function checkPhrase_en(n: number, d: number): string {
  const rem = n % d
  if (d === 3 || d === 9) {
    const digitSum = String(n).split('').reduce((s, c) => s + parseInt(c, 10), 0)
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
    const digitSum = String(n).split('').reduce((s, c) => s + parseInt(c, 10), 0)
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

// ─── Render ──────────────────────────────────────────────────────────────────
export function render(params: Params) {
  if (params.mode === 'pick-multiple') {
    const labels = ['A', 'B', 'C', 'D'] as const
    const { d, options } = params
    const choices: WmiChoice[] = labels.map((label, i) => ({ label, text: String(options[i]) }))
    const correctIdx = options.findIndex((n) => n % d === 0)
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
      body_en: `Four numbers are shown below. Find: Which number is a multiple of ${d}?`,
      body_id: `Empat bilangan ditampilkan di bawah ini. Cari: Bilangan manakah yang merupakan [[multiple|kelipatan]] ${d}?`,
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

  if (params.mode === 'multi-divisor') {
    const { k, m, base, answer } = params
    const l = lcm(k, m)
    const hint_steps_en = [
      `To be divisible by both ${k} and ${m}, a number must be a multiple of LCM(${k}, ${m}) = ${l}.`,
      `List multiples of ${l}: ${Array.from({ length: 6 }, (_, i) => l * (i + 1)).join(', ')}, ...`,
      `We need the smallest multiple of ${l} that is greater than ${base}.`,
      `${answer} ÷ ${l} = ${answer / l}, and ${answer} > ${base}, so the answer is ${answer}.`,
    ]
    const hint_steps_id = [
      `Agar habis dibagi ${k} sekaligus ${m}, bilangan harus merupakan kelipatan KPK(${k}, ${m}) = ${l}.`,
      `Daftar kelipatan ${l}: ${Array.from({ length: 6 }, (_, i) => l * (i + 1)).join(', ')}, ...`,
      `Kita perlu kelipatan ${l} terkecil yang lebih besar dari ${base}.`,
      `${answer} ÷ ${l} = ${answer / l}, dan ${answer} > ${base}, jadi jawabannya adalah ${answer}.`,
    ]

    return {
      body_en: `Find: What is the smallest number greater than ${base} that is divisible by both ${k} and ${m}?`,
      body_id: `Cari: Bilangan terkecil yang lebih besar dari ${base} dan habis dibagi ${k} maupun ${m} adalah ...?`,
      answer_type: 'fill_in' as const,
      choices_en: null,
      choices_id: null,
      answer: String(answer),
      hint_en: `Find LCM(${k}, ${m}) first, then list its multiples until you pass ${base}.`,
      hint_id: `Cari dulu KPK(${k}, ${m}), lalu daftarkan kelipatannya sampai melewati ${base}.`,
      hint_steps_en,
      hint_steps_id,
      breakdown: buildDivisibilityMultiplePropertyBreakdown(params),
    }
  }

  // make-divisible
  const { d, n, x } = params
  const target = n + x
  const hint_steps_en = [
    `${n} ÷ ${d} = ${Math.floor(n / d)} remainder ${n % d}. It is NOT yet divisible by ${d}.`,
    `The next multiple of ${d} above ${n} is ${target} (= ${d} × ${target / d}).`,
    `So we need to add ${target} − ${n} = ${x}.`,
  ]
  const hint_steps_id = [
    `${n} ÷ ${d} = ${Math.floor(n / d)} sisa ${n % d}. Belum habis dibagi ${d}.`,
    `Kelipatan ${d} berikutnya di atas ${n} adalah ${target} (= ${d} × ${target / d}).`,
    `Jadi kita perlu menambah ${target} − ${n} = ${x}.`,
  ]

  return {
    body_en: `Find: What is the smallest number you must add to ${n} so that the result is divisible by ${d}?`,
    body_id: `Cari: Bilangan terkecil yang harus ditambahkan ke ${n} agar hasilnya habis dibagi ${d} adalah ...?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(x),
    hint_en: `Find the next multiple of ${d} after ${n}, then subtract.`,
    hint_id: `Cari kelipatan ${d} berikutnya setelah ${n}, lalu kurangkan.`,
    hint_steps_en,
    hint_steps_id,
    breakdown: buildDivisibilityMultiplePropertyBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
