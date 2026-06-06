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
  const { cols, rows } = params
  const vLines = cols + 1          // vertical lines
  const hLines = rows + 1          // horizontal lines
  const c2 = (n: number) => (n * (n - 1)) / 2
  const vPairs = c2(vLines)        // C(cols+1, 2)
  const hPairs = c2(hLines)        // C(rows+1, 2)

  return {
    body_en:
      `The grid below has ${cols} column${cols > 1 ? 's' : ''} and ${rows} row${rows > 1 ? 's' : ''}.\n\nFind: How many rectangles of any size are in the grid?`,
    body_id:
      `Kisi di bawah memiliki ${cols} kolom dan ${rows} baris.\n\nCari: Ada berapa persegi panjang dari semua ukuran dalam kisi tersebut?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(rectangleCount(params)),
    hint_en:
      `Choose 2 of the ${vLines} vertical lines and 2 of the ${hLines} horizontal lines — each pair of choices defines exactly one rectangle.`,
    hint_id:
      `Pilih 2 dari ${vLines} garis vertikal dan 2 dari ${hLines} garis horizontal — setiap pasangan pilihan menentukan tepat satu persegi panjang.`,
    hint_steps_en: [
      `The grid has ${vLines} vertical lines and ${hLines} horizontal lines.`,
      `Pairs of vertical lines: C(${vLines}, 2) = ${vPairs}.`,
      `Pairs of horizontal lines: C(${hLines}, 2) = ${hPairs}.`,
      `Total rectangles: ${vPairs} × ${hPairs} = ${rectangleCount(params)}.`,
    ],
    hint_steps_id: [
      `Kisi memiliki ${vLines} garis vertikal dan ${hLines} garis horizontal.`,
      `Pasangan garis vertikal: C(${vLines}, 2) = ${vPairs}.`,
      `Pasangan garis horizontal: C(${hLines}, 2) = ${hPairs}.`,
      `Total persegi panjang: ${vPairs} × ${hPairs} = ${rectangleCount(params)}.`,
    ],
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
