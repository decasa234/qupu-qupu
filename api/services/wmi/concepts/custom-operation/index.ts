import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'
import { buildCustomOperationBreakdown } from './breakdown.js'

// ─── Modes ───────────────────────────────────────────────────────────────────
// 'infer'  — two worked examples are shown; the learner must deduce the hidden
//            rule and apply it to a third pair. The rule is NOT revealed.
// 'nested' — the rule IS revealed (simpler fn) but applied twice: compute
//            (a☼b)☼c, so two steps of substitution are required.
export type Mode = 'infer' | 'nested'

// ─── Formulas ─────────────────────────────────────────────────────────────────
// All formulas for 'infer' mode must be:
//  (a) genuinely non-linear (not a pure linear combination a+b or a×b alone)
//  (b) recoverable from exactly 2 example pairs — i.e., the two examples
//      uniquely identify the rule among the FORMULAS list for any valid
//      (e1,e2,e3,e4) pair generated below.
// The symbol '☼' is used for the operator in both modes.
type Formula = {
  id: string
  fn: (a: number, b: number) => number
  // Human-readable rule (used only in 'nested' mode, where the rule is stated)
  def_en: string
  def_id: string
}

// sum(a..b−1) − b: sum integers from a up to (b−1), then subtract b.
// e.g. 1☼3 = (1+2)−3 = 0,  2☼5 = (2+3+4)−5 = 4,  4☼9 = (4+5+6+7+8)−9 = 21
// Requires b > a (ensured in generate).
function sumRangeMinusB(a: number, b: number): number {
  // sum of integers a, a+1, ..., b-1  =  (b-a) terms, first=a, last=b-1
  // = (b-a) * (a + b - 1) / 2
  const n = b - a // number of terms
  return (n * (a + b - 1)) / 2 - b
}

// a☼b = a² − b  (square the first, subtract the second)
// e.g. 2☼3 = 4−3 = 1,  3☼5 = 9−5 = 4,  5☼7 = 25−7 = 18
function squareMinusB(a: number, b: number): number {
  return a * a - b
}

// a☼b = a × b − a  (product minus the first)
// e.g. 2☼4 = 8−2 = 6,  3☼5 = 15−3 = 12,  4☼6 = 24−4 = 20
// Non-linear but factored as a(b-1) — ensure two examples are shown so students
// see the pattern from data, not just a trivial "subtract one" guess.
function mulMinusA(a: number, b: number): number {
  return a * b - a
}

// a☼b = (a + b)² − (a × b)  (sum-squared minus product)
// e.g. 1☼2 = 9−2 = 7,  2☼3 = 25−6 = 19,  3☼4 = 49−12 = 37
// Highly non-linear; two examples strongly constrain the rule.
function sumSqMinusProd(a: number, b: number): number {
  return (a + b) * (a + b) - a * b
}

// ─── Nested-mode formulas (stated explicitly; applied twice) ──────────────────
// Simpler functions used when the rule IS given — the difficulty is the nesting.
type NestedFormula = {
  id: string
  fn: (a: number, b: number) => number
  def_en: string
  def_id: string
}

const NESTED_FORMULAS: readonly NestedFormula[] = [
  {
    id: 'nested-mul-minus-b',
    fn: (a, b) => a * b - b,
    def_en: 'a ☼ b = a × b − b',
    def_id: 'a ☼ b = a × b − b',
  },
  {
    id: 'nested-double-sum',
    fn: (a, b) => 2 * (a + b),
    def_en: 'a ☼ b = 2 × (a + b)',
    def_id: 'a ☼ b = 2 × (a + b)',
  },
  {
    id: 'nested-sum-plus-prod',
    fn: (a, b) => a + b + a * b,
    def_en: 'a ☼ b = a + b + a × b',
    def_id: 'a ☼ b = a + b + a × b',
  },
]

// ─── Infer-mode formula registry ──────────────────────────────────────────────
export const INFER_FORMULAS: readonly Formula[] = [
  {
    id: 'sum-range-minus-b',
    fn: sumRangeMinusB,
    def_en: 'a ☼ b = (a + (a+1) + … + (b−1)) − b',
    def_id: 'a ☼ b = (a + (a+1) + … + (b−1)) − b',
  },
  {
    id: 'square-minus-b',
    fn: squareMinusB,
    def_en: 'a ☼ b = a² − b',
    def_id: 'a ☼ b = a² − b',
  },
  {
    id: 'mul-minus-a',
    fn: mulMinusA,
    def_en: 'a ☼ b = a × b − a',
    def_id: 'a ☼ b = a × b − a',
  },
  {
    id: 'sum-sq-minus-prod',
    fn: sumSqMinusProd,
    def_en: 'a ☼ b = (a + b)² − (a × b)',
    def_id: 'a ☼ b = (a + b)² − (a × b)',
  },
] as const

const INFER_IDS = INFER_FORMULAS.map((f) => f.id)
const NESTED_IDS = NESTED_FORMULAS.map((f) => f.id)
const ALL_IDS = [...INFER_IDS, ...NESTED_IDS]
const INFER_BY_ID = Object.fromEntries(INFER_FORMULAS.map((f) => [f.id, f]))
const NESTED_BY_ID = Object.fromEntries(NESTED_FORMULAS.map((f) => [f.id, f]))

// ─── Schema ───────────────────────────────────────────────────────────────────
const paramsSchema = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('infer'),
    formula: z.enum(INFER_IDS as [string, ...string[]]),
    // Two worked examples shown to the learner (rule NOT stated)
    e1: z.number().int().min(1).max(9),
    e2: z.number().int().min(2).max(12),
    e3: z.number().int().min(1).max(9),
    e4: z.number().int().min(2).max(12),
    // Query pair
    c: z.number().int().min(1).max(9),
    d: z.number().int().min(2).max(12),
  }),
  z.object({
    mode: z.literal('nested'),
    formula: z.enum(NESTED_IDS as [string, ...string[]]),
    // Three operands: compute (a ☼ b) ☼ c
    a: z.number().int().min(2).max(8),
    b: z.number().int().min(2).max(8),
    c: z.number().int().min(2).max(8),
  }),
])
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'custom-operation',
  name_en: 'Apply a newly-defined operation',
  name_id: 'Terapkan operasi yang baru didefinisikan',
  grades: [2, 3] as const,
  description_id: 'Temukan pola operasi baru dari dua contoh, lalu terapkan aturannya.',
} as const

// ─── Public helpers (used in breakdown + tests) ───────────────────────────────
export function applyInferFormula(id: string, a: number, b: number): number {
  const f = INFER_BY_ID[id]
  if (!f) throw new Error(`Unknown infer formula: ${id}`)
  return f.fn(a, b)
}

export function applyNestedFormula(id: string, a: number, b: number): number {
  const f = NESTED_BY_ID[id]
  if (!f) throw new Error(`Unknown nested formula: ${id}`)
  return f.fn(a, b)
}

export function formulaDef(id: string): string {
  const f = INFER_BY_ID[id] ?? NESTED_BY_ID[id]
  if (!f) throw new Error(`Unknown formula: ${id}`)
  return f.def_en
}

// ─── Generate ─────────────────────────────────────────────────────────────────
export function generate(rng: Rng): Params {
  const useNested = rng.int(0, 2) === 0 // ~33% nested, ~67% infer

  if (useNested) {
    const formula = rng.pick(NESTED_IDS)
    const a = rng.int(2, 8)
    const b = rng.int(2, 8)
    let c = rng.int(2, 8)
    // Ensure c is distinct enough that the nested application is non-trivial
    if (c === a && c === b) c = c === 8 ? 2 : c + 1
    return { mode: 'nested', formula, a, b, c }
  }

  // 'infer' mode: pick a formula and generate two distinct example pairs + query
  const formula = rng.pick(INFER_IDS)
  const fn = (INFER_BY_ID[formula] as Formula).fn

  // For sum-range-minus-b, require b > a (so the range a..b-1 is non-empty)
  const needsAscending = formula === 'sum-range-minus-b'

  function pickPair(): [number, number] {
    if (needsAscending) {
      const a = rng.int(1, 6)
      const b = rng.int(a + 2, a + 6) // ensure b > a+1 so range has ≥2 terms
      return [a, Math.min(b, 12)]
    }
    return [rng.int(1, 7), rng.int(2, 9)]
  }

  const [e1, e2] = pickPair()
  const pair2 = pickPair()
  let e3 = pair2[0]
  const e4 = pair2[1]
  // Ensure the two example pairs are distinct
  if (e3 === e1 && e4 === e2) {
    e3 = e3 === 7 ? 1 : e3 + 1
  }

  const pair3 = pickPair()
  let c = pair3[0]
  const d = pair3[1]
  // Ensure query pair is distinct from both examples
  if ((c === e1 && d === e2) || (c === e3 && d === e4)) {
    c = c === 7 ? 1 : c + 1
  }

  // Verify all computations are integers (sum-range needs b > a for clean integer)
  const ex1 = fn(e1, e2)
  const ex2 = fn(e3, e4)
  if (!Number.isInteger(ex1) || !Number.isInteger(ex2)) {
    // Fallback: use square-minus-b which always produces integers
    return generate_squareMinusB(rng)
  }

  return { mode: 'infer', formula, e1, e2, e3, e4, c, d }
}

// Fallback generator using square-minus-b (always integer, no domain restrictions)
function generate_squareMinusB(rng: Rng): Params {
  const e1 = rng.int(1, 7)
  const e2 = rng.int(2, 8)
  let e3 = rng.int(1, 7)
  const e4 = rng.int(2, 8)
  if (e3 === e1 && e4 === e2) e3 = e3 === 7 ? 1 : e3 + 1
  let c = rng.int(1, 8)
  const d = rng.int(2, 9)
  if ((c === e1 && d === e2) || (c === e3 && d === e4)) c = c === 8 ? 1 : c + 1
  return { mode: 'infer', formula: 'square-minus-b', e1, e2, e3, e4, c, d }
}

// ─── Render ───────────────────────────────────────────────────────────────────
export function render(params: Params): ReturnType<typeof _render> {
  return _render(params)
}

function _render(params: Params) {
  if (params.mode === 'nested') {
    const f = NESTED_BY_ID[params.formula] as NestedFormula
    const inner = f.fn(params.a, params.b)
    const answer = f.fn(inner, params.c)
    const expr = `(${params.a} ☼ ${params.b}) ☼ ${params.c}`

    return {
      body_en: [
        `A new operation is defined: ${f.def_en}.`,
        `Compute ${expr}.`,
      ].join(' '),
      body_id: [
        `Sebuah operasi baru didefinisikan: ${f.def_id}.`,
        `Hitunglah ${expr}.`,
      ].join(' '),
      answer_type: 'fill_in' as const,
      choices_en: null,
      choices_id: null,
      answer: String(answer),
      hint_en: 'Work from the inside out: first compute the inner ☼, then use that result as the first input to the outer ☼.',
      hint_id: 'Kerjakan dari dalam ke luar: hitung ☼ bagian dalam terlebih dahulu, lalu gunakan hasilnya sebagai masukan pertama untuk ☼ luar.',
      hint_steps_en: [
        `The rule is: ${f.def_en}.`,
        `Step 1 — inner bracket: ${params.a} ☼ ${params.b} = ${inner}.`,
        `Step 2 — outer bracket: ${inner} ☼ ${params.c} = ${answer}.`,
      ],
      hint_steps_id: [
        `Aturannya: ${f.def_id}.`,
        `Langkah 1 — kurung dalam: ${params.a} ☼ ${params.b} = ${inner}.`,
        `Langkah 2 — kurung luar: ${inner} ☼ ${params.c} = ${answer}.`,
      ],
      breakdown: buildCustomOperationBreakdown(params),
    }
  }

  // 'infer' mode
  const f = INFER_BY_ID[params.formula] as Formula
  const ex1 = f.fn(params.e1, params.e2)
  const ex2 = f.fn(params.e3, params.e4)
  const answer = f.fn(params.c, params.d)

  return {
    body_en: [
      `A new operation ☼ is used. Study the examples:`,
      `${params.e1} ☼ ${params.e2} = ${ex1},`,
      `${params.e3} ☼ ${params.e4} = ${ex2}.`,
      `Find: ${params.c} ☼ ${params.d} = ?`,
    ].join(' '),
    body_id: [
      `Sebuah operasi ☼ digunakan. Pelajari contoh-contohnya:`,
      `${params.e1} ☼ ${params.e2} = ${ex1},`,
      `${params.e3} ☼ ${params.e4} = ${ex2}.`,
      `Cari: ${params.c} ☼ ${params.d} = ?`,
    ].join(' '),
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(answer),
    hint_en: 'Look at both examples carefully and find the pattern — what did ☼ do to the two numbers each time?',
    hint_id: 'Perhatikan kedua contoh dengan seksama dan temukan polanya — apa yang dilakukan ☼ pada dua bilangan setiap kali?',
    hint_steps_en: buildInferHintSteps(params.formula, params.e1, params.e2, ex1, params.e3, params.e4, ex2, params.c, params.d, answer),
    hint_steps_id: buildInferHintStepsId(params.formula, params.e1, params.e2, ex1, params.e3, params.e4, ex2, params.c, params.d, answer),
    breakdown: buildCustomOperationBreakdown(params),
  }
}

// ─── Hint step builders ───────────────────────────────────────────────────────
function buildInferHintSteps(
  formula: string,
  e1: number, e2: number, ex1: number,
  e3: number, e4: number, ex2: number,
  c: number, d: number, answer: number,
): string[] {
  switch (formula) {
    case 'sum-range-minus-b':
      return [
        `Look at the first example: ${e1} ☼ ${e2} = ${ex1}. The integers from ${e1} up to ${e2 - 1} sum to ${ex1 + e2}; then subtract ${e2} → ${ex1}.`,
        `Check with the second: ${e3} ☼ ${e4} = ${ex2}. Sum from ${e3} to ${e4 - 1}, then subtract ${e4} → ${ex2}. ✓`,
        `Apply the pattern: sum from ${c} to ${d - 1}, then subtract ${d} → ${answer}.`,
      ]
    case 'square-minus-b':
      return [
        `First example: ${e1} ☼ ${e2} = ${ex1}. Notice ${e1}² = ${e1 * e1} and ${e1 * e1} − ${e2} = ${ex1}.`,
        `Second example: ${e3} ☼ ${e4} = ${ex2}. Check: ${e3}² − ${e4} = ${e3 * e3 - e4}. ✓`,
        `Apply: ${c}² − ${d} = ${c * c} − ${d} = ${answer}.`,
      ]
    case 'mul-minus-a':
      return [
        `First example: ${e1} ☼ ${e2} = ${ex1}. Notice ${e1} × ${e2} = ${e1 * e2} and ${e1 * e2} − ${e1} = ${ex1}.`,
        `Second example: ${e3} ☼ ${e4} = ${ex2}. Check: ${e3} × ${e4} − ${e3} = ${ex2}. ✓`,
        `Apply: ${c} × ${d} − ${c} = ${c * d} − ${c} = ${answer}.`,
      ]
    case 'sum-sq-minus-prod':
      return [
        `First example: ${e1} ☼ ${e2} = ${ex1}. The sum ${e1}+${e2} = ${e1 + e2}; squared = ${(e1 + e2) ** 2}; minus product ${e1 * e2} → ${ex1}.`,
        `Second example: ${e3} ☼ ${e4} = ${ex2}. Sum ${e3}+${e4} = ${e3 + e4}; squared = ${(e3 + e4) ** 2}; minus ${e3 * e4} → ${ex2}. ✓`,
        `Apply: (${c}+${d})² − ${c}×${d} = ${(c + d) ** 2} − ${c * d} = ${answer}.`,
      ]
    default:
      return [
        `Study both examples: ${e1} ☼ ${e2} = ${ex1} and ${e3} ☼ ${e4} = ${ex2}.`,
        `Find the pattern that works for both.`,
        `Apply it: ${c} ☼ ${d} = ${answer}.`,
      ]
  }
}

function buildInferHintStepsId(
  formula: string,
  e1: number, e2: number, ex1: number,
  e3: number, e4: number, ex2: number,
  c: number, d: number, answer: number,
): string[] {
  switch (formula) {
    case 'sum-range-minus-b':
      return [
        `Lihat contoh pertama: ${e1} ☼ ${e2} = ${ex1}. Bilangan dari ${e1} sampai ${e2 - 1} berjumlah ${ex1 + e2}; lalu dikurangi ${e2} → ${ex1}.`,
        `Cek dengan contoh kedua: ${e3} ☼ ${e4} = ${ex2}. Jumlah dari ${e3} ke ${e4 - 1}, lalu kurangi ${e4} → ${ex2}. ✓`,
        `Terapkan polanya: jumlah dari ${c} ke ${d - 1}, lalu kurangi ${d} → ${answer}.`,
      ]
    case 'square-minus-b':
      return [
        `Contoh pertama: ${e1} ☼ ${e2} = ${ex1}. Perhatikan ${e1}² = ${e1 * e1} dan ${e1 * e1} − ${e2} = ${ex1}.`,
        `Contoh kedua: ${e3} ☼ ${e4} = ${ex2}. Cek: ${e3}² − ${e4} = ${e3 * e3 - e4}. ✓`,
        `Terapkan: ${c}² − ${d} = ${c * c} − ${d} = ${answer}.`,
      ]
    case 'mul-minus-a':
      return [
        `Contoh pertama: ${e1} ☼ ${e2} = ${ex1}. Perhatikan ${e1} × ${e2} = ${e1 * e2} dan ${e1 * e2} − ${e1} = ${ex1}.`,
        `Contoh kedua: ${e3} ☼ ${e4} = ${ex2}. Cek: ${e3} × ${e4} − ${e3} = ${ex2}. ✓`,
        `Terapkan: ${c} × ${d} − ${c} = ${c * d} − ${c} = ${answer}.`,
      ]
    case 'sum-sq-minus-prod':
      return [
        `Contoh pertama: ${e1} ☼ ${e2} = ${ex1}. Jumlah ${e1}+${e2} = ${e1 + e2}; dikuadratkan = ${(e1 + e2) ** 2}; dikurangi hasil kali ${e1 * e2} → ${ex1}.`,
        `Contoh kedua: ${e3} ☼ ${e4} = ${ex2}. Jumlah ${e3}+${e4} = ${e3 + e4}; dikuadratkan = ${(e3 + e4) ** 2}; dikurangi ${e3 * e4} → ${ex2}. ✓`,
        `Terapkan: (${c}+${d})² − ${c}×${d} = ${(c + d) ** 2} − ${c * d} = ${answer}.`,
      ]
    default:
      return [
        `Pelajari kedua contoh: ${e1} ☼ ${e2} = ${ex1} dan ${e3} ☼ ${e4} = ${ex2}.`,
        `Temukan pola yang berlaku untuk keduanya.`,
        `Terapkan: ${c} ☼ ${d} = ${answer}.`,
      ]
  }
}

// ─── Concept export ───────────────────────────────────────────────────────────
const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
export { ALL_IDS, INFER_IDS, NESTED_IDS }
