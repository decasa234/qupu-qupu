import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const paramsSchema = z.object({
  sides: z.number().int().min(3).max(8),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'count-polygon-sides',
  name_en: 'Count the sides of a shape',
  name_id: 'Hitung sisi sebuah bangun',
  grades: [0, 1] as const,
  description_id: 'Hitung banyak sisi sebuah bangun datar.',
} as const

export function generate(rng: Rng): Params {
  return { sides: rng.int(3, 8) }
}

const POLYGON_NAME_EN: Record<number, string> = {
  3: 'triangle',
  4: 'quadrilateral',
  5: 'pentagon',
  6: 'hexagon',
  7: 'heptagon',
  8: 'octagon',
}

const POLYGON_NAME_ID: Record<number, string> = {
  3: 'segitiga',
  4: 'segiempat',
  5: 'segilima',
  6: 'segienam',
  7: 'segi tujuh',
  8: 'segi delapan',
}

export function render(params: Params) {
  const { sides } = params
  const nameEn = POLYGON_NAME_EN[sides]
  const nameId = POLYGON_NAME_ID[sides]

  return {
    body_en: `Find: How many sides does the polygon in the figure have?`,
    body_id: `Cari: Berapa banyak sisi yang dimiliki bangun datar pada gambar?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(sides),
    hint_en: `Trace each straight edge of the shape one at a time and count as you go.`,
    hint_id: `Telusuri setiap tepi lurus bangun satu per satu sambil menghitung.`,
    hint_steps_en: [
      `Look at the figure and find a corner to start from. Trace along the outline, counting each straight edge: 1, 2, 3, … until you return to the start.`,
      `The shape in the figure has ${sides} straight edges, so it has ${sides} sides.`,
      `A polygon with ${sides} sides is called a ${nameEn}. Answer: ${sides}.`,
    ],
    hint_steps_id: [
      `Perhatikan gambar dan tentukan satu sudut sebagai titik awal. Telusuri tepi bangun sambil menghitung setiap tepi lurus: 1, 2, 3, … sampai kembali ke titik awal.`,
      `Bangun pada gambar memiliki ${sides} tepi lurus, jadi bangun itu memiliki ${sides} sisi.`,
      `Bangun datar bersisi ${sides} disebut ${nameId}. Jawaban: ${sides}.`,
    ],
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
