import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'
import { buildCustomOperationBreakdown } from './breakdown.js'

type Formula = { id: string; fn: (a: number, b: number) => number; def: string }
const FORMULAS: readonly Formula[] = [
  { id: 'mul-minus-b', fn: (a, b) => a * b - b, def: 'a ★ b = a × b − b' },
  { id: 'mul-plus-sum', fn: (a, b) => a * b + a + b, def: 'a ★ b = a × b + a + b' },
  { id: 'double-first-plus', fn: (a, b) => a + a + b, def: 'a ★ b = a + a + b' },
  { id: 'sum-times-two', fn: (a, b) => (a + b) * 2, def: 'a ★ b = (a + b) × 2' },
] as const
const IDS = FORMULAS.map((f) => f.id)
const BY_ID = Object.fromEntries(FORMULAS.map((f) => [f.id, f]))

const paramsSchema = z.object({
  formula: z.enum(IDS as [string, ...string[]]),
  e1: z.number().int().min(1).max(6),
  e2: z.number().int().min(1).max(6),
  c: z.number().int().min(2).max(9),
  d: z.number().int().min(2).max(9),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'custom-operation',
  name_en: 'Apply a newly-defined operation',
  name_id: 'Terapkan operasi yang baru didefinisikan',
  grades: [2, 3] as const,
  description_id: 'Pahami definisi operasi baru dari contoh, lalu hitung soalnya.',
} as const

export function applyFormula(id: string, a: number, b: number): number {
  return (BY_ID[id] as Formula).fn(a, b)
}

// The human-readable rule string for a formula id, e.g. "a ★ b = a × b − b".
export function formulaDef(id: string): string {
  return (BY_ID[id] as Formula).def
}

export function generate(rng: Rng): Params {
  const formula = rng.pick(IDS)
  let c = rng.int(2, 9)
  const d = rng.int(2, 9)
  const e1 = rng.int(1, 6)
  const e2 = rng.int(1, 6)
  if (c === e1 && d === e2) c = c === 9 ? 8 : c + 1
  return { formula, e1, e2, c, d }
}

export function render(params: Params) {
  const f = BY_ID[params.formula] as Formula
  const example = f.fn(params.e1, params.e2)
  const answer = f.fn(params.c, params.d)
  return {
    body_en: `A new operation is defined as ${f.def}. Example: ${params.e1} ★ ${params.e2} = ${example}. Find: Compute ${params.c} ★ ${params.d}.`,
    body_id: `Sebuah operasi baru didefinisikan sebagai ${f.def}. Contoh: ${params.e1} ★ ${params.e2} = ${example}. Cari: Hitunglah ${params.c} ★ ${params.d}.`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(answer),
    hint_en: 'Put your two numbers into the rule, exactly like the example.',
    hint_id: 'Masukkan dua bilanganmu ke dalam aturan, persis seperti contoh.',
    hint_steps_en: [
      `Read the rule: ${f.def}.`,
      `The example shows ${params.e1} ★ ${params.e2} = ${example}.`,
      `Do the same with your numbers: ${params.c} ★ ${params.d} = ${answer}.`,
    ],
    hint_steps_id: [
      `Baca aturannya: ${f.def}.`,
      `Contohnya ${params.e1} ★ ${params.e2} = ${example}.`,
      `Lakukan hal yang sama dengan bilanganmu: ${params.c} ★ ${params.d} = ${answer}.`,
    ],
    breakdown: buildCustomOperationBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
