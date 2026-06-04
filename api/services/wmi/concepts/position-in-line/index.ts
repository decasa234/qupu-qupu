import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const paramsSchema = z.object({
  name: z.string().min(1),
  fromFront: z.number().int().min(2).max(15),
  fromBack: z.number().int().min(2).max(15),
})
export type Params = z.infer<typeof paramsSchema>

const NAMES = ['Dan', 'Paul', 'Ann', 'Ken', 'Maya', 'Budi'] as const

export const meta = {
  slug: 'position-in-line',
  name_en: 'How many people are in the line',
  name_id: 'Berapa orang dalam barisan',
  grades: [1, 2] as const,
  description_id: 'Hitung jumlah orang dalam barisan dari posisi seseorang.',
} as const

export function lineLength(p: Params): number {
  return p.fromFront + p.fromBack - 1
}

export function generate(rng: Rng): Params {
  return {
    name: rng.pick(NAMES),
    fromFront: rng.int(2, 12),
    fromBack: rng.int(2, 12),
  }
}

export function render(params: Params) {
  return {
    body_en: `In a line of children, counting from the front ${params.name} is at position ${params.fromFront}, and counting from the back ${params.name} is at position ${params.fromBack}. How many children are in the line?`,
    body_id: `Dalam sebuah barisan anak, dihitung dari depan ${params.name} berada di posisi ${params.fromFront}, dan dihitung dari belakang ${params.name} berada di posisi ${params.fromBack}. Berapa banyak anak dalam barisan itu?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(lineLength(params)),
    hint_en: 'Add the two positions, then subtract 1 so the child is not counted twice.',
    hint_id: 'Jumlahkan kedua posisi, lalu kurangi 1 agar anak itu tidak terhitung dua kali.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
