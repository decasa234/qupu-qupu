import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'
import { buildCountRectanglesGridBreakdown } from './breakdown.js'

const paramsSchema = z.object({
  cols: z.number().int().min(2).max(4),
  rows: z.number().int().min(1).max(3),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'count-rectangles-grid',
  name_en: 'Count the squares',
  name_id: 'Hitung persegi',
  grades: [1, 2, 3] as const,
  description_id: 'Hitung banyak persegi dari semua ukuran dalam sebuah kisi.',
} as const

// Count squares of every possible size in a cols x rows grid.
export function rectangleCount(p: Params): number {
  let total = 0
  for (let size = 1; size <= Math.min(p.cols, p.rows); size++) {
    total += (p.cols - size + 1) * (p.rows - size + 1)
  }
  return total
}

export function generate(rng: Rng): Params {
  return { cols: rng.int(2, 4), rows: rng.int(1, 3) }
}

export function render(params: Params) {
  const { cols, rows } = params
  const total = rectangleCount(params)
  const parts = Array.from({ length: Math.min(cols, rows) }, (_, i) => {
    const size = i + 1
    return { size, count: (cols - size + 1) * (rows - size + 1) }
  })
  const sumText = parts.map((p) => p.count).join(' + ')

  return {
    body_en:
      `The grid below has ${cols} column${cols > 1 ? 's' : ''} and ${rows} row${rows > 1 ? 's' : ''}.\n\nFind: How many squares of any size are in the grid?`,
    body_id:
      `Kisi di bawah memiliki ${cols} kolom dan ${rows} baris.\n\nCari: Ada berapa persegi dari semua ukuran dalam kisi tersebut?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(total),
    hint_en:
      `Count squares by size: 1×1 squares, then 2×2 squares, and so on. Add the counts: ${sumText} = ${total}.`,
    hint_id:
      `Hitung persegi berdasarkan ukuran: persegi 1×1, lalu 2×2, dan seterusnya. Jumlahkan: ${sumText} = ${total}.`,
    hint_steps_en: [
      ...parts.map((part) => `${part.size}×${part.size} squares: ${cols - part.size + 1} × ${rows - part.size + 1} = ${part.count}.`),
      `Total squares: ${sumText} = ${total}.`,
    ],
    hint_steps_id: [
      ...parts.map((part) => `Persegi ${part.size}×${part.size}: ${cols - part.size + 1} × ${rows - part.size + 1} = ${part.count}.`),
      `Total persegi: ${sumText} = ${total}.`,
    ],
    breakdown: buildCountRectanglesGridBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
