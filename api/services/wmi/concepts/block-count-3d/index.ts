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
  description_id: 'Hitung jumlah seluruh balok pada tumpukan padat (tanpa rongga).',
} as const

export function total(p: Params): number {
  return p.heights.reduce((s, h) => s + h, 0)
}

// In the isometric view the viewer sees each cube's top, front (+row) and
// right (+col) faces. A cube is fully hidden only if it is not the top of its
// column AND a taller column sits both in front of it and to its right.
export function hiddenCount(depth: number, width: number, heights: number[]): number {
  const H = (r: number, c: number) => (r < 0 || c < 0 || r >= depth || c >= width ? 0 : heights[r * width + c])
  let hidden = 0
  for (let r = 0; r < depth; r++) {
    for (let c = 0; c < width; c++) {
      const h = H(r, c)
      for (let z = 0; z < h; z++) {
        const isTop = z === h - 1
        const frontBlocked = r < depth - 1 && H(r + 1, c) > z
        const rightBlocked = c < width - 1 && H(r, c + 1) > z
        if (!isTop && frontBlocked && rightBlocked) hidden++
      }
    }
  }
  return hidden
}

export function generate(rng: Rng): Params {
  for (let attempt = 0; attempt < 80; attempt++) {
    const depth = rng.int(2, 3)
    const width = rng.int(2, 4)
    const heights = Array.from({ length: depth * width }, () => rng.int(1, 3))
    const t = heights.reduce((s, h) => s + h, 0)
    if (hiddenCount(depth, width, heights) === 0 && Math.max(...heights) >= 2 && t >= 5 && t <= 13) {
      return { depth, width, heights }
    }
  }
  // fallback (always valid: a flat back row with a taller front row)
  return { depth: 2, width: 3, heights: [1, 1, 1, 2, 2, 2] }
}

export function render(params: Params) {
  return {
    body_en: 'These blocks are stacked solidly with no gaps. How many blocks are there in total?',
    body_id: 'Balok-balok ini ditumpuk padat tanpa rongga. Ada berapa balok seluruhnya?',
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(total(params)),
    hint_en: 'Count column by column, including the ones partly behind — there are no hidden gaps.',
    hint_id: 'Hitung kolom per kolom, termasuk yang sebagian di belakang — tidak ada rongga tersembunyi.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
