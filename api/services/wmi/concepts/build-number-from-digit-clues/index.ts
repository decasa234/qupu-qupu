import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const paramsSchema = z
  .object({
    tens: z.number().int().min(1).max(9),
    units: z.number().int().min(0).max(9),
    k: z.number().int().min(1).max(15),
    dir: z.enum(['more', 'less']),
  })
  .refine((v) => v.dir === 'more' || 10 * v.tens + v.units - v.k >= 0, {
    message: 'result must be non-negative',
  })
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'build-number-from-digit-clues',
  name_en: 'Build a number from digit clues',
  name_id: 'Susun bilangan dari petunjuk angka',
  grades: [2, 3] as const,
  description_id: 'Bentuk bilangan dari petunjuk posisi angka, lalu hitung selisihnya.',
} as const

export function targetNumber(p: Params): number {
  const n = 10 * p.tens + p.units
  return p.dir === 'more' ? n + p.k : n - p.k
}

export function generate(rng: Rng): Params {
  const tens = rng.int(1, 9)
  const units = rng.int(0, 9)
  const number = 10 * tens + units
  const dir = rng.pick(['more', 'less'] as const)
  const k = dir === 'more' ? rng.int(1, 15) : rng.int(1, Math.min(15, number))
  return { tens, units, k, dir }
}

export function render(params: Params) {
  const word = params.dir === 'more' ? 'more than' : 'less than'
  const wordId = params.dir === 'more' ? 'lebih dari' : 'kurang dari'
  const built = 10 * params.tens + params.units
  const dirEn = params.dir === 'more' ? 'up' : 'down'
  const dirId = params.dir === 'more' ? 'naik' : 'turun'
  const sign = params.dir === 'more' ? '+' : '−'
  const ans = targetNumber(params)
  return {
    body_en: `A two-digit number has ${params.tens} in the tens place and ${params.units} in the ones place. Find: Which number is ${params.k} ${word} it?`,
    body_id: `Sebuah bilangan dua angka memiliki ${params.tens} pada tempat puluhan dan ${params.units} pada tempat satuan. Cari: Bilangan manakah yang ${params.k} ${wordId} bilangan itu?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(ans),
    hint_en: `First build the number, then count ${params.k} ${dirEn} from it.`,
    hint_id: `Bentuk dulu bilangannya, lalu hitung ${params.k} ${dirId} darinya.`,
    hint_steps_en: [
      `Build the number: ${params.tens} tens and ${params.units} ones = ${built}.`,
      `Count ${params.k} ${dirEn}: ${built} ${sign} ${params.k} = ${ans}.`,
    ],
    hint_steps_id: [
      `Bentuk bilangannya: ${params.tens} puluhan dan ${params.units} satuan = ${built}.`,
      `Hitung ${params.k} ${dirId}: ${built} ${sign} ${params.k} = ${ans}.`,
    ],
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
