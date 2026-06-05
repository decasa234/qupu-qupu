import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

// Each group is a SOLID monotone staircase (a plane partition): heights are
// non-increasing as you move toward the front and toward the right. That
// guarantees every stack's TOP is visible — nothing in front is taller — so no
// stack is ever completely hidden and the count is readable straight off the
// figure, while the cubes under each top are solid (no gaps). Each group is
// bounded by 5 wide x 5 deep x 3 tall; 2–4 groups per question.
export function isMonotone(depth: number, width: number, h: number[]): boolean {
  const H = (r: number, c: number) => h[r * width + c]
  for (let r = 0; r < depth; r++) {
    for (let c = 0; c < width; c++) {
      if (r > 0 && H(r, c) > H(r - 1, c)) return false
      if (c > 0 && H(r, c) > H(r, c - 1)) return false
    }
  }
  return true
}

const groupSchema = z
  .object({
    depth: z.number().int().min(1).max(5),
    width: z.number().int().min(1).max(5),
    heights: z.array(z.number().int().min(2).max(3)), // every stack is 2–3 tall (chunky, WMI-style)
  })
  .refine((g) => g.heights.length === g.depth * g.width, { message: 'heights length must be depth*width' })
  .refine((g) => isMonotone(g.depth, g.width, g.heights), {
    message: 'heights must step down toward front/right so every stack top stays visible',
  })

const paramsSchema = z.object({ groups: z.array(groupSchema).min(2).max(4) })
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'block-count-3d',
  name_en: 'Count the stacked blocks',
  name_id: 'Hitung balok yang ditumpuk',
  grades: [1, 2, 3] as const,
  description_id: 'Hitung jumlah seluruh balok dari beberapa kelompok tumpukan padat.',
} as const

function groupCubes(g: { heights: number[] }): number {
  return g.heights.reduce((a, b) => a + b, 0)
}
export function total(p: Params): number {
  return p.groups.reduce((s, g) => s + groupCubes(g), 0)
}

function genGroup(rng: Rng) {
  // Small footprints (<=3 per side, well within the 5x5 bound): with every
  // stack 2–3 tall, larger footprints make the pile uncountable.
  const depth = rng.int(1, 3)
  const width = rng.int(1, 3)
  const maxH = rng.int(2, 3)
  const heights: number[] = []
  const H = (r: number, c: number) => heights[r * width + c]
  for (let r = 0; r < depth; r++) {
    for (let c = 0; c < width; c++) {
      const up = r > 0 ? H(r - 1, c) : maxH
      const left = c > 0 ? H(r, c - 1) : maxH
      heights.push(rng.int(2, Math.min(up, left))) // 2..min(neighbours) -> monotone, never below 2
    }
  }
  return { depth, width, heights }
}

export function generate(rng: Rng): Params {
  for (let attempt = 0; attempt < 80; attempt++) {
    const numGroups = rng.int(2, 4)
    const groups = Array.from({ length: numGroups }, () => genGroup(rng))
    const t = groups.reduce((s, g) => s + groupCubes(g), 0)
    const okGroups = groups.every((g) => groupCubes(g) >= 2 && groupCubes(g) <= 16)
    const someDepth = groups.some((g) => g.depth >= 2 || g.width >= 2) // keep a 3D feel
    if (okGroups && someDepth && t >= 12 && t <= 36) return { groups }
  }
  return {
    groups: [
      { depth: 1, width: 2, heights: [3, 2] }, // 5
      { depth: 2, width: 2, heights: [3, 2, 2, 2] }, // 9
      { depth: 1, width: 1, heights: [3] }, // 3
    ],
  }
}

export function render(params: Params) {
  return {
    body_en: 'Count. How many blocks are there in the picture?',
    body_id: 'Hitung. Ada berapa balok pada gambar?',
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(total(params)),
    hint_en: 'The stacks are solid (no hidden gaps). You can see the top of every stack — count each one down to the floor, then add the groups.',
    hint_id: 'Tumpukannya padat (tidak ada rongga). Kamu bisa melihat puncak tiap tumpukan — hitung tiap tumpukan sampai ke lantai, lalu jumlahkan semua kelompok.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
