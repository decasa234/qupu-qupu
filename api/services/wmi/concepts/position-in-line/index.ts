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
  const total = lineLength(params)
  const frontGroup = params.fromFront - 1
  const backGroup = params.fromBack - 1
  return {
    body_en: `${params.name} is standing in a line of children. Counting from the front, ${params.name} is in position ${params.fromFront}. Counting from the back, ${params.name} is in position ${params.fromBack}.\nFind: How many children are in the line?`,
    body_id: `${params.name} berdiri dalam sebuah barisan anak. Dihitung dari depan, ${params.name} berada di urutan ke-${params.fromFront}. Dihitung dari belakang, ${params.name} berada di urutan ke-${params.fromBack}.\nCari: Berapa banyak anak dalam barisan itu?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(total),
    hint_en: `Think of ${params.name}'s position as splitting the line into three parts: the children in front, ${params.name} in the middle, and the children behind — then count the total.`,
    hint_id: `Bayangkan posisi ${params.name} membagi barisan menjadi tiga bagian: anak-anak di depan, ${params.name} sendiri, dan anak-anak di belakang — lalu hitung seluruhnya.`,
    hint_steps_en: [
      `Children strictly in front of ${params.name}: ${params.fromFront} − 1 = ${frontGroup}.`,
      `Children strictly behind ${params.name}: ${params.fromBack} − 1 = ${backGroup}.`,
      `Add the two groups plus ${params.name} in the middle: ${frontGroup} + 1 + ${backGroup} = ${total}.`,
      `There are ${total} children in the line.`,
    ],
    hint_steps_id: [
      `Anak yang berada tepat di depan ${params.name}: ${params.fromFront} − 1 = ${frontGroup} anak.`,
      `Anak yang berada tepat di belakang ${params.name}: ${params.fromBack} − 1 = ${backGroup} anak.`,
      `Jumlahkan keduanya ditambah ${params.name} sendiri: ${frontGroup} + 1 + ${backGroup} = ${total}.`,
      `Jadi, ada ${total} anak dalam barisan itu.`,
    ],
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
