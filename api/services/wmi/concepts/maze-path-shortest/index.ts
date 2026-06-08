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
  const { cols, rows, walls } = params
  const steps = shortestSteps(cols, rows, walls as Cell[])
  const manhattan = (cols - 1) + (rows - 1)
  const extra = steps - manhattan   // 0 on an open grid; positive when walls force a detour
  return {
    body_en:
      `The grid shown is ${cols} columns wide and ${rows} rows tall. ` +
      `A dot marks the top-left corner; a flag marks the bottom-right corner. ` +
      `Black squares are walls you cannot enter. ` +
      `Find: What is the fewest number of steps to walk from the dot to the flag, moving only up, down, left, or right?`,
    body_id:
      `Kisi yang ditampilkan memiliki ${cols} kolom dan ${rows} baris. ` +
      `Titik menandai sudut kiri atas; bendera menandai sudut kanan bawah. ` +
      `Kotak hitam adalah dinding yang tidak boleh dimasuki. ` +
      `Cari: Berapa langkah paling sedikit untuk berjalan dari titik ke bendera, bergerak hanya ke atas, bawah, kiri, atau kanan?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(steps),
    hint_en: extra === 0
      ? 'On an open grid the shortest route goes straight across and straight down — no detours needed.'
      : 'Trace your finger along open squares; whenever a wall blocks the straight route, go one square around it.',
    hint_id: extra === 0
      ? 'Pada kisi terbuka, rute terpendek langsung ke kanan lalu ke bawah — tidak perlu memutar.'
      : 'Telusuri kotak-kotak kosong; setiap kali dinding menghalangi jalur lurus, putar satu kotak mengelilinginya.',
    hint_steps_en: [
      `The grid is ${cols} columns wide and ${rows} rows tall, so you must travel at least ${cols - 1} steps right and ${rows - 1} steps down.`,
      `Without any walls the minimum is ${cols - 1} + ${rows - 1} = ${manhattan} steps.`,
      ...(extra === 0
        ? [
            `No wall blocks the direct path in this grid, so the straight route of ${manhattan} steps works.`,
            `The shortest path is ${steps} steps.`,
          ]
        : [
            `Some walls block the direct path, so you must detour around them — adding ${extra} extra step${extra === 1 ? '' : 's'} (each detour around a single wall costs 2 extra steps but reuses the space gained elsewhere, netting ${extra} total).`,
            `Tracing the open squares step by step, the shortest path is ${steps} steps.`,
          ]),
    ],
    hint_steps_id: [
      `Kisi berukuran ${cols} kolom × ${rows} baris, sehingga kamu harus menempuh setidaknya ${cols - 1} langkah ke kanan dan ${rows - 1} langkah ke bawah.`,
      `Tanpa dinding, jarak minimum adalah ${cols - 1} + ${rows - 1} = ${manhattan} langkah.`,
      ...(extra === 0
        ? [
            `Tidak ada dinding yang menghalangi jalur langsung pada kisi ini, sehingga rute lurus ${manhattan} langkah bisa digunakan.`,
            `Jalur terpendeknya adalah ${steps} langkah.`,
          ]
        : [
            `Beberapa dinding menghalangi jalur langsung, sehingga kamu harus memutar — menambah ${extra} langkah ekstra.`,
            `Dengan menelusuri kotak-kotak kosong langkah demi langkah, jalur terpendeknya adalah ${steps} langkah.`,
          ]),
    ],
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
