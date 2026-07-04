import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'
import { buildPaintedCubeBreakdown } from './breakdown.js'

const paramsSchema = z.object({
  n: z.number().int().min(3).max(5),
  k: z.number().int().min(0).max(3),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'painted-cube-faces-count',
  name_en: 'Painted cube: count small cubes',
  name_id: 'Kubus dicat: hitung kubus kecil',
  grades: [2, 3] as const,
  description_id: 'Sebuah kubus besar dicat lalu dipotong; hitung kubus kecil menurut jumlah sisi tercat.',
} as const

// A big n x n x n cube is painted on all 6 outer faces, then cut into n^3 unit
// cubes. Count how many unit cubes have exactly k painted faces.
export function countByFormula(n: number, k: number): number {
  switch (k) {
    case 3:
      return 8 // corners
    case 2:
      return 12 * (n - 2) // edges
    case 1:
      return 6 * (n - 2) ** 2 // face centers
    case 0:
      return (n - 2) ** 3 // interior
    default:
      return 0
  }
}

export function generate(rng: Rng): Params {
  const n = rng.int(3, 5)
  const k = rng.int(0, 3)
  return { n, k }
}

export function render(params: Params) {
  const { n, k } = params
  const total = n ** 3
  const answer = countByFormula(n, k)

  const locationName_en = ['inside', 'a face', 'an edge', 'a corner'][k]
  const locationName_id = ['di dalam', 'sebuah sisi', 'sebuah rusuk', 'sebuah sudut'][k]

  const formula_en = [
    `(${n} - 2)^3 = ${n - 2}^3 = ${answer}`,
    `6 * (${n} - 2)^2 = 6 * ${n - 2}^2 = ${answer}`,
    `12 * (${n} - 2) = 12 * ${n - 2} = ${answer}`,
    `8 (always 8 corners) = ${answer}`,
  ][k]
  const formula_id = [
    `(${n} - 2)^3 = ${n - 2}^3 = ${answer}`,
    `6 * (${n} - 2)^2 = 6 * ${n - 2}^2 = ${answer}`,
    `12 * (${n} - 2) = 12 * ${n - 2} = ${answer}`,
    `8 (selalu 8 sudut) = ${answer}`,
  ][k]

  const hint_steps_en = [
    `A unit cube's painted-face count matches how many of its 3 coordinates sit on the outer boundary.`,
    `${k} painted faces means the cube sits at ${locationName_en} of the big cube.`,
    `Count them: ${formula_en}.`,
  ]
  const hint_steps_id = [
    `Jumlah sisi tercat sebuah kubus kecil sama dengan berapa banyak dari 3 koordinatnya berada di batas luar.`,
    `${k} sisi tercat berarti kubus itu berada ${locationName_id} kubus besar.`,
    `Hitung: ${formula_id}.`,
  ]

  return {
    body_en: `A ${n}×${n}×${n} cube is painted on all its outside faces, then cut into ${total} small unit cubes.\n\nFind: How many small cubes have exactly ${k} painted ${k === 1 ? 'face' : 'faces'}?`,
    body_id: `Sebuah kubus ${n}×${n}×${n} dicat pada semua sisi luarnya, lalu dipotong menjadi ${total} kubus kecil satuan.\n\nCari: Berapa banyak kubus kecil yang memiliki tepat ${k} sisi tercat?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(answer),
    hint_en: 'Sort unit cubes by where they sit: corners (3 faces), edges (2 faces), face centers (1 face), interior (0 faces).',
    hint_id: 'Kelompokkan kubus kecil menurut posisinya: sudut (3 sisi), rusuk (2 sisi), tengah sisi (1 sisi), dalam (0 sisi).',
    hint_steps_en,
    hint_steps_id,
    breakdown: buildPaintedCubeBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
