import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const paramsSchema = z
  .object({
    name: z.string().min(1),
    right: z.number().int().min(0).max(8),
    wrong: z.number().int().min(1).max(9),
    place: z.enum(['units', 'tens']),
    correct: z.number().int().min(20).max(900),
  })
  .refine((v) => v.wrong > v.right, { message: 'misread digit must be larger than the real digit' })
export type Params = z.infer<typeof paramsSchema>

const NAMES = ['Zoey', 'Maya', 'Budi', 'Sari', 'Tono'] as const

export const meta = {
  slug: 'mistaken-digit-correction',
  name_en: 'Correct a misread digit in a sum',
  name_id: 'Koreksi salah baca angka pada penjumlahan',
  grades: [2, 3] as const,
  description_id: 'Sebuah digit terbaca salah; cari hasil penjumlahan yang benar.',
} as const

function placeValue(place: Params['place']): number {
  return place === 'units' ? 1 : 10
}

export function generate(rng: Rng): Params {
  const right = rng.int(0, 8)
  const wrong = rng.int(right + 1, 9)
  const place = rng.pick(['units', 'tens'] as const)
  const correct = rng.int(40, 400)
  return { name: rng.pick(NAMES), right, wrong, place, correct }
}

export function render(params: Params) {
  const delta = (params.wrong - params.right) * placeValue(params.place)
  const got = params.correct + delta // misread digit was larger, so the wrong sum is too big
  return {
    body_en: `While adding two numbers, ${params.name} misread the ${params.place} digit of one number as ${params.wrong} instead of ${params.right}. The sum she got was ${got}. Find: What should the correct sum be?`,
    body_id: `Saat menjumlahkan dua bilangan, ${params.name} salah membaca angka ${params.place === 'units' ? 'satuan' : 'puluhan'} pada salah satu bilangan menjadi ${params.wrong} bukan ${params.right}. Hasil yang ia peroleh adalah ${got}. Cari: Berapakah hasil yang seharusnya?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(params.correct),
    hint_en: `Work out how much too big the misread made the number, then subtract that from the sum.`,
    hint_id: `Cari tahu seberapa besar kelebihan akibat salah baca, lalu kurangi dari hasilnya.`,
    hint_steps_en: [
      `The misread made one number too big by (${params.wrong} − ${params.right}) × ${placeValue(params.place)} = ${delta}.`,
      `So the sum ${got} is ${delta} too big.`,
      `Correct sum: ${got} − ${delta} = ${params.correct}.`,
    ],
    hint_steps_id: [
      `Salah baca membuat satu bilangan terlalu besar sebanyak (${params.wrong} − ${params.right}) × ${placeValue(params.place)} = ${delta}.`,
      `Jadi hasil ${got} terlalu besar sebanyak ${delta}.`,
      `Hasil yang benar: ${got} − ${delta} = ${params.correct}.`,
    ],
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
