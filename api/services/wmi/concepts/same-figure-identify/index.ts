import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'
import { buildSameFigureIdentifyBreakdown } from './breakdown.js'

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
  grades: [1, 2, 3] as const,
  description_id: 'Pilih bentuk yang sama (diputar, bukan dibalik).',
} as const

// Each base shape is chiral with no rotational symmetry: its 4 rotations are
// all "the same" shape, while its mirror image is never reachable by rotation —
// so the correct option is correct BY CONSTRUCTION (the test enforces both the
// chirality and that all 4 options are distinct).
const SHAPES: Cell[][] = [
  [[0, 0], [0, 1], [0, 2], [1, 2]], // L-tetromino
  [[0, 0], [0, 1], [0, 2], [0, 3], [1, 3]], // L-pentomino
  [[0, 0], [0, 1], [1, 1], [1, 2], [1, 3]], // N-pentomino
  [[1, 0], [1, 1], [1, 2], [1, 3], [0, 1]], // Y-pentomino
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
  const base = rng.pick(SHAPES)
  const target = normalize(base)
  const r = rng.pick([1, 2, 3] as const) // a real turn (not the identity)
  const correct = rotN(base, r)
  const reflected = reflect(base)
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
    body_en: 'The figure shown can be [[rotation|rotated]] to any angle, but must NOT be [[reflection|flipped]] (mirrored). Find: Which option — A, B, C, or D — is the SAME figure as the one shown?',
    body_id: 'Bangun yang ditampilkan boleh di[[rotation|putar]] ke sudut mana pun, tetapi TIDAK boleh di[[reflection|balik]] (dicerminkan). Cari: Pilihan manakah — A, B, C, atau D — yang merupakan bangun SAMA dengan yang ditampilkan?',
    answer_type: 'multiple_choice' as const,
    choices_en: choices,
    choices_id: choices,
    answer: labels[params.validIndex],
    hint_en: 'Pick one distinguishing "arm" of the figure and track which way it points — a flipped option will have that arm on the opposite side no matter how you rotate it.',
    hint_id: 'Pilih satu "lengan" khas pada bangun dan perhatikan ke arah mana ia menunjuk — pilihan yang dibalik akan memiliki lengan itu di sisi yang berlawanan, tidak peduli bagaimana kamu memutarnya.',
    hint_steps_en: [
      'Count the squares (or segments) in the figure — every option must have the same count; eliminate any that differ.',
      'Pick the longest arm of the figure and note which side it bends toward (left or right).',
      'Try rotating each option in your mind: if the bend stays on the same side after turning, the overall shape matches; if it flips to the other side, that option is a mirror image and is wrong.',
      `Only one option survives both checks — that is option ${labels[params.validIndex]}.`,
    ],
    hint_steps_id: [
      'Hitung kotak (atau segmen) pada bangun — setiap pilihan harus memiliki jumlah yang sama; eliminasi pilihan yang berbeda.',
      'Pilih lengan terpanjang bangun dan catat ke sisi mana ia menekuk (kiri atau kanan).',
      'Coba putar setiap pilihan dalam pikiranmu: jika tekukan tetap berada di sisi yang sama setelah diputar, bentuk tersebut cocok; jika tekukan berpindah ke sisi lain, pilihan itu adalah bayangan cermin dan salah.',
      `Hanya satu pilihan yang lolos kedua pemeriksaan — itulah pilihan ${labels[params.validIndex]}.`,
    ],
    breakdown: buildSameFigureIdentifyBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
