import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

type Cell = [number, number]
const cell = z.tuple([z.number().int(), z.number().int()])
const paramsSchema = z.object({
  cols: z.number().int().min(4).max(6),
  rows: z.number().int().min(4).max(6),
  walls: z.array(cell),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'maze-path-shortest',
  name_en: 'Shortest path through a maze',
  name_id: 'Jalur terpendek melewati labirin',
  grades: [2, 3] as const,
  description_id: 'Cari langkah paling sedikit dari titik ke bendera, menghindari dinding.',
} as const

// Breadth-first search from the top-left corner to the bottom-right corner,
// moving 4-directionally and avoiding wall cells. Returns Infinity if blocked.
export function shortestSteps(cols: number, rows: number, walls: Cell[]): number {
  const blocked = new Set(walls.map(([x, y]) => `${x},${y}`))
  const target = `${cols - 1},${rows - 1}`
  const dist = new Map<string, number>([['0,0', 0]])
  const queue: Cell[] = [[0, 0]]
  let head = 0
  while (head < queue.length) {
    const [x, y] = queue[head++]
    const d = dist.get(`${x},${y}`) as number
    if (`${x},${y}` === target) return d
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
      const nx = x + dx
      const ny = y + dy
      const k = `${nx},${ny}`
      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows || blocked.has(k) || dist.has(k)) continue
      dist.set(k, d + 1)
      queue.push([nx, ny])
    }
  }
  return Infinity
}

export function generate(rng: Rng): Params {
  const cols = rng.int(4, 6)
  const rows = rng.int(4, 6)
  let walls: Cell[] = []
  for (let attempt = 0; attempt < 16; attempt++) {
    walls = []
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if ((x === 0 && y === 0) || (x === cols - 1 && y === rows - 1)) continue
        if (rng.int(0, 99) < 28) walls.push([x, y])
      }
    }
    if (Number.isFinite(shortestSteps(cols, rows, walls))) break
  }
  if (!Number.isFinite(shortestSteps(cols, rows, walls))) walls = [] // fall back to an open grid
  return { cols, rows, walls }
}

export function render(params: Params) {
  const steps = shortestSteps(params.cols, params.rows, params.walls as Cell[])
  return {
    body_en: 'Find the fewest steps from the dot to the flag. Move up, down, left, or right — you cannot pass through a black square.',
    body_id: 'Cari langkah paling sedikit dari titik ke bendera. Bergerak atas, bawah, kiri, atau kanan — tidak bisa melewati kotak hitam.',
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(steps),
    hint_en: 'Trace open squares around the walls; count one step per square you move into.',
    hint_id: 'Telusuri kotak kosong mengelilingi dinding; hitung satu langkah tiap kotak yang dimasuki.',
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
