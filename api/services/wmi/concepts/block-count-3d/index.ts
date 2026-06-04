import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const paramsSchema = z
  .object({
    depth: z.number().int().min(2).max(3),
    width: z.number().int().min(2).max(4),
    heights: z.array(z.number().int().min(1).max(3)),
  })
  .refine((v) => v.heights.length === v.depth * v.width, {
    message: 'heights length must equal depth*width',
  })
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'block-count-3d',
  name_en: 'Count the stacked blocks',
  name_id: 'Hitung balok yang ditumpuk',
  grades: [1, 2, 3] as const,
  description_id: 'Hitung jumlah seluruh balok pada tumpukan padat berbentuk tangga.',
} as const

export function total(p: Params): number {
  return p.heights.reduce((s, h) => s + h, 0)
}

// True iff heights form a "staircase" (a plane partition): non-increasing from
// the back-left corner toward the front-right, so the solid reads as descending
// steps and its cube count is unambiguous from the shape.
export function isStaircase(depth: number, width: number, heights: number[]): boolean {
  const H = (r: number, c: number) => heights[r * width + c]
  for (let r = 0; r < depth; r++) {
    for (let c = 0; c < width; c++) {
      if (r > 0 && H(r, c) > H(r - 1, c)) return false
      if (c > 0 && H(r, c) > H(r, c - 1)) return false
    }
  }
  return true
}

export function generate(rng: Rng): Params {
  for (let attempt = 0; attempt < 40; attempt++) {
    const depth = rng.int(2, 3)
    const width = rng.int(2, 4)
    const heights = new Array<number>(depth * width)
    const H = (r: number, c: number) => heights[r * width + c]
    heights[0] = rng.int(2, 3) // tallest, back-left
    for (let r = 0; r < depth; r++) {
      for (let c = 0; c < width; c++) {
        if (r === 0 && c === 0) continue
        const cap = Math.min(r > 0 ? H(r - 1, c) : heights[0], c > 0 ? H(r, c - 1) : heights[0])
        heights[r * width + c] = rng.int(1, cap)
      }
    }
    const t = heights.reduce((s, h) => s + h, 0)
    if (t >= 5 && t <= 14) return { depth, width, heights }
  }
  return { depth: 2, width: 3, heights: [3, 2, 1, 2, 1, 1] } // valid staircase fallback
}

export function render(params: Params) {
  return {
    body_en: 'The blocks form a solid staircase with no gaps. How many blocks are there in total?',
    body_id: 'Balok-balok membentuk tangga padat tanpa rongga. Ada berapa balok seluruhnya?',
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(total(params)),
    hint_en: 'Count each column by its height — the steps show how tall every stack is.',
    hint_id: 'Hitung tiap kolom dari tingginya — anak tangga menunjukkan tinggi setiap tumpukan.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
