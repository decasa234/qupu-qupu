import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const paramsSchema = z.object({
  cols: z.number().int().min(2).max(4),
  rows: z.number().int().min(1).max(3),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'count-rectangles-grid',
  name_en: 'Count the rectangles',
  name_id: 'Hitung persegi panjang',
  grades: [3] as const,
  description_id: 'Hitung banyak persegi panjang (segala ukuran) dalam sebuah kisi.',
} as const

// Rectangles of any size in a cols×rows grid = C(cols+1,2) · C(rows+1,2):
// choose 2 of the vertical lines and 2 of the horizontal lines.
export function rectangleCount(p: Params): number {
  const choose2 = (n: number) => (n * (n - 1)) / 2
  return choose2(p.cols + 1) * choose2(p.rows + 1)
}

export function generate(rng: Rng): Params {
  return { cols: rng.int(2, 4), rows: rng.int(1, 3) }
}

export function render(params: Params) {
  return {
    body_en: 'How many rectangles of any size are in this grid?',
    body_id: 'Ada berapa persegi panjang segala ukuran dalam kisi ini?',
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(rectangleCount(params)),
    hint_en: 'Count singles, then 1×2s, 2×2s, and so on — every size counts.',
    hint_id: 'Hitung yang satuan, lalu 1×2, 2×2, dan seterusnya — semua ukuran dihitung.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
