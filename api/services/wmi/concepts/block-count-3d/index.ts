import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

// Each group is a short LINE of stacks (1x1, 1x2 or 2x1) — never a 2x2 — so it
// keeps 3D depth while guaranteeing every block has a visible face. Max 4
// blocks per group, 2–4 groups.
const groupSchema = z
  .object({
    depth: z.number().int().min(1).max(2),
    width: z.number().int().min(1).max(2),
    heights: z.array(z.number().int().min(1).max(2)),
  })
  .refine((g) => g.heights.length === g.depth * g.width && !(g.depth === 2 && g.width === 2), {
    message: 'a group is a line (not 2x2)',
  })

const paramsSchema = z.object({ groups: z.array(groupSchema).min(2).max(4) })
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'block-count-3d',
  name_en: 'Count the stacked blocks',
  name_id: 'Hitung balok yang ditumpuk',
  grades: [1, 2, 3] as const,
  description_id: 'Hitung jumlah seluruh balok dari beberapa kelompok tumpukan.',
} as const

export function total(p: Params): number {
  return p.groups.reduce((s, g) => s + g.heights.reduce((a, b) => a + b, 0), 0)
}

function genGroup(rng: Rng) {
  const shapes: [number, number][] = [
    [1, 1],
    [1, 2],
    [2, 1],
  ]
  const [depth, width] = rng.pick(shapes)
  const n = depth * width
  const heights = [rng.int(1, 2)]
  for (let i = 1; i < n; i++) heights.push(rng.int(1, heights[i - 1])) // non-increasing along the line
  return { depth, width, heights }
}

export function generate(rng: Rng): Params {
  for (let attempt = 0; attempt < 40; attempt++) {
    const numGroups = rng.int(2, 4)
    const groups = Array.from({ length: numGroups }, () => genGroup(rng))
    const t = groups.reduce((s, g) => s + g.heights.reduce((a, b) => a + b, 0), 0)
    if (t >= 6 && t <= 14) return { groups }
  }
  return {
    groups: [
      { depth: 1, width: 2, heights: [2, 2] },
      { depth: 2, width: 1, heights: [2, 1] },
      { depth: 1, width: 1, heights: [2] },
    ],
  }
}

export function render(params: Params) {
  return {
    body_en: 'Count all the blocks in every group. How many blocks are there in total? (No hidden gaps.)',
    body_id: 'Hitung semua balok di setiap kelompok. Ada berapa balok seluruhnya? (Tidak ada rongga tersembunyi.)',
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(total(params)),
    hint_en: 'Count each group on its own, then add the groups together.',
    hint_id: 'Hitung tiap kelompok sendiri-sendiri, lalu jumlahkan semua kelompok.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
