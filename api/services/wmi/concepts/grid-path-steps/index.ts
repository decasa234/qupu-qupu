import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const paramsSchema = z.object({
  cols: z.number().int().min(4).max(6),
  rows: z.number().int().min(3).max(5),
  sx: z.number().int().min(0).max(5),
  sy: z.number().int().min(0).max(4),
  ex: z.number().int().min(0).max(5),
  ey: z.number().int().min(0).max(4),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'grid-path-steps',
  name_en: 'Shortest path on a grid',
  name_id: 'Jalur terpendek pada kisi',
  grades: [1, 2, 3] as const,
  description_id: 'Hitung langkah terpendek pada kisi (hanya gerak tegak/datar).',
} as const

export function steps(p: Params): number {
  return Math.abs(p.ex - p.sx) + Math.abs(p.ey - p.sy)
}

export function generate(rng: Rng): Params {
  const cols = rng.int(4, 6)
  const rows = rng.int(3, 5)
  const sx = rng.int(0, cols - 1)
  const sy = rng.int(0, rows - 1)
  let ex = rng.int(0, cols - 1)
  let ey = rng.int(0, rows - 1)
  let guard = 0
  while (Math.abs(ex - sx) + Math.abs(ey - sy) < 3 && guard++ < 30) {
    ex = rng.int(0, cols - 1)
    ey = rng.int(0, rows - 1)
  }
  if (Math.abs(ex - sx) + Math.abs(ey - sy) < 3) {
    // fall back to the corner farthest from the start (always >= 3 away)
    const corners: [number, number][] = [
      [0, 0],
      [cols - 1, 0],
      [0, rows - 1],
      [cols - 1, rows - 1],
    ]
    const far = corners.reduce((best, c) =>
      Math.abs(c[0] - sx) + Math.abs(c[1] - sy) > Math.abs(best[0] - sx) + Math.abs(best[1] - sy) ? c : best,
    )
    ex = far[0]
    ey = far[1]
  }
  return { cols, rows, sx, sy, ex, ey }
}

export function render(params: Params) {
  return {
    body_en: 'On the grid, what is the fewest steps from the dot to the flag? You may move up, down, left, or right — not diagonally.',
    body_id: 'Pada kisi, berapa langkah paling sedikit dari titik ke bendera? Kamu boleh bergerak atas, bawah, kiri, atau kanan — tidak diagonal.',
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(steps(params)),
    hint_en: 'Count the columns across plus the rows up or down between the two marks.',
    hint_id: 'Hitung selisih kolom ditambah selisih baris antara kedua tanda.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
