import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

type Cell = [number, number]
const cell = z.tuple([z.number().int(), z.number().int()])
const paramsSchema = z.object({
  target: z.array(cell),
  options: z.array(z.array(cell)).length(4),
  validIndex: z.number().int().min(0).max(3),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'same-figure-identify',
  name_en: 'Same shape, just turned',
  name_id: 'Bentuk sama, hanya diputar',
  grades: [2, 3] as const,
  description_id: 'Pilih bentuk yang sama (diputar, bukan dibalik).',
} as const

// An L-tetromino is chiral: its rotations are all "the same" shape, while its
// mirror image (a J) can never be reached by rotation — so the correct option
// is correct BY CONSTRUCTION, no folding/geometry check needed.
const BASE: Cell[] = [
  [0, 0],
  [0, 1],
  [0, 2],
  [1, 2],
]

function rot90(cells: Cell[]): Cell[] {
  return cells.map(([x, y]) => [y, -x] as Cell)
}
function reflect(cells: Cell[]): Cell[] {
  return cells.map(([x, y]) => [-x, y] as Cell)
}
export function normalize(cells: Cell[]): Cell[] {
  const minX = Math.min(...cells.map((c) => c[0]))
  const minY = Math.min(...cells.map((c) => c[1]))
  return cells
    .map(([x, y]) => [x - minX, y - minY] as Cell)
    .sort((a, b) => a[0] - b[0] || a[1] - b[1])
}
function rotN(cells: Cell[], n: number): Cell[] {
  let c = cells
  for (let i = 0; i < n; i++) c = rot90(c)
  return normalize(c)
}

export function generate(rng: Rng): Params {
  const target = normalize(BASE)
  const r = rng.pick([1, 2, 3] as const) // a real turn (not the identity)
  const correct = rotN(BASE, r)
  const reflected = reflect(BASE)
  const distRots = rng.shuffle([0, 1, 2, 3]).slice(0, 3)
  const distractors = distRots.map((d) => rotN(reflected, d))
  const all = [correct, ...distractors]
  const order = rng.shuffle([0, 1, 2, 3])
  const options = order.map((i) => all[i])
  const validIndex = order.indexOf(0)
  return { target, options, validIndex }
}

export function render(params: Params) {
  const labels = ['A', 'B', 'C', 'D'] as const
  const choices = labels.map((label) => ({ label, text: label }))
  return {
    body_en: 'The shape at the top can be turned, but not flipped over. Which shape below (A, B, C, or D) is the SAME shape?',
    body_id: 'Bentuk di atas boleh diputar, tetapi tidak boleh dibalik. Bentuk manakah di bawah (A, B, C, atau D) yang SAMA?',
    answer_type: 'multiple_choice' as const,
    choices_en: choices,
    choices_id: choices,
    answer: labels[params.validIndex],
    hint_en: 'A flipped (mirror) shape is different. Find the one you could rotate to match.',
    hint_id: 'Bentuk yang dibalik (cermin) itu berbeda. Cari yang bisa diputar agar cocok.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
