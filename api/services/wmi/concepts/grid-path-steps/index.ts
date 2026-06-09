import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'
import { buildGridPathStepsBreakdown } from './breakdown.js'

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
  const { sx, sy, ex, ey } = params
  const hSteps = Math.abs(ex - sx)
  const vSteps = Math.abs(ey - sy)
  const total = steps(params)

  const hDir = ex > sx ? 'right' : 'left'
  const vDir = ey > sy ? 'down' : 'up'
  const hDirId = ex > sx ? 'kanan' : 'kiri'
  const vDirId = ey > sy ? 'bawah' : 'atas'

  // Build the steps description depending on which distances are non-zero
  let stepDescEn: string
  let stepDescId: string
  if (hSteps === 0) {
    stepDescEn = `Move ${vSteps} step${vSteps !== 1 ? 's' : ''} ${vDir}: ${vSteps}.`
    stepDescId = `Gerak ${vSteps} langkah ke ${vDirId}: ${vSteps}.`
  } else if (vSteps === 0) {
    stepDescEn = `Move ${hSteps} step${hSteps !== 1 ? 's' : ''} ${hDir}: ${hSteps}.`
    stepDescId = `Gerak ${hSteps} langkah ke ${hDirId}: ${hSteps}.`
  } else {
    stepDescEn = `Move ${hSteps} step${hSteps !== 1 ? 's' : ''} ${hDir} and ${vSteps} step${vSteps !== 1 ? 's' : ''} ${vDir}: ${hSteps} + ${vSteps}.`
    stepDescId = `Gerak ${hSteps} langkah ke ${hDirId} dan ${vSteps} langkah ke ${vDirId}: ${hSteps} + ${vSteps}.`
  }

  return {
    body_en: `The grid shows a dot (start) and a flag (end). Find: What is the fewest steps to walk from the dot to the flag, moving only up, down, left, or right?`,
    body_id: `Kisi menunjukkan sebuah titik (mulai) dan sebuah bendera (akhir). Cari: Berapa langkah paling sedikit untuk berjalan dari titik ke bendera, hanya bergerak atas, bawah, kiri, atau kanan?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(total),
    hint_en: `Count how many steps sideways and how many steps up or down you need, then add them together.`,
    hint_id: `Hitung berapa langkah ke samping dan berapa langkah ke atas atau bawah yang dibutuhkan, lalu jumlahkan keduanya.`,
    hint_steps_en: [
      `Count the horizontal distance: how many columns apart are the dot and the flag? That is ${hSteps} step${hSteps !== 1 ? 's' : ''} ${hDir === 'right' ? 'across' : 'back'}.`,
      `Count the vertical distance: how many rows apart are the dot and the flag? That is ${vSteps} step${vSteps !== 1 ? 's' : ''} ${vDir}.`,
      `${stepDescEn} Add them: ${hSteps} + ${vSteps} = ${total} steps.`,
    ],
    hint_steps_id: [
      `Hitung jarak mendatar: berapa kolom jaraknya antara titik dan bendera? Itu ${hSteps} langkah ke ${hDirId}.`,
      `Hitung jarak tegak: berapa baris jaraknya antara titik dan bendera? Itu ${vSteps} langkah ke ${vDirId}.`,
      `${stepDescId} Jumlahkan: ${hSteps} + ${vSteps} = ${total} langkah.`,
    ],
    breakdown: buildGridPathStepsBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
