import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

type Cell = [number, number]
const cell = z.tuple([z.number().int(), z.number().int()])
const paramsSchema = z.object({
  nets: z.array(z.array(cell)).length(4),
  validIndex: z.number().int().min(0).max(3),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'dice-net-fold',
  name_en: 'Which net folds into a cube',
  name_id: 'Jaring-jaring mana yang membentuk kubus',
  grades: [2, 3] as const,
  description_id: 'Pilih jaring-jaring yang dapat dilipat menjadi sebuah kubus.',
} as const

// 1-4-1 nets (a row of four + one square above + one below) always fold to a
// cube, regardless of which columns the tabs sit on.
const VALID: Cell[][] = [
  [[0, 1], [1, 1], [2, 1], [3, 1], [1, 0], [2, 2]],
  [[0, 1], [1, 1], [2, 1], [3, 1], [0, 0], [3, 2]],
  [[0, 1], [1, 1], [2, 1], [3, 1], [2, 0], [0, 2]],
]
// Each invalid net either is 1×6 / 2×3 or contains a 2×2 block — none fold.
const INVALID: Cell[][] = [
  [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]], // 2×3 rectangle
  [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0]], // 1×6 line
  [[0, 0], [1, 0], [0, 1], [1, 1], [2, 1], [3, 1]], // 2×2 block + tail
  [[0, 1], [1, 0], [1, 1], [2, 1], [1, 2], [2, 2]], // contains a 2×2 block
]

export function generate(rng: Rng): Params {
  const valid = rng.pick(VALID)
  const invalid = rng.shuffle(INVALID).slice(0, 3)
  const all = [valid, ...invalid]
  const order = rng.shuffle([0, 1, 2, 3])
  const nets = order.map((i) => all[i])
  const validIndex = order.indexOf(0)
  return { nets, validIndex }
}

export function render(params: Params) {
  const labels = ['A', 'B', 'C', 'D'] as const
  const choices = labels.map((label) => ({ label, text: label }))
  return {
    body_en: `Four flat shapes made of 6 squares are shown as nets A, B, C, and D.\n\nFind: Which net can be folded along its edges to form a closed cube?`,
    body_id: `Empat bangun datar yang terdiri dari 6 persegi ditunjukkan sebagai jaring A, B, C, dan D.\n\nCari: Jaring manakah yang dapat dilipat sepanjang sisinya membentuk kubus tertutup?`,
    answer_type: 'multiple_choice' as const,
    choices_en: choices,
    choices_id: choices,
    answer: labels[params.validIndex],
    hint_en: 'Look for the net that has no 2×2 square block anywhere in it — a valid cube net always folds without any face overlapping another.',
    hint_id: 'Carilah jaring yang tidak memiliki blok 2×2 di mana pun — jaring kubus yang benar selalu terlipat tanpa ada bidang yang saling menumpuk.',
    hint_steps_en: [
      'Count the squares in each net: every cube net must have exactly 6 squares.',
      'Scan each net for a 2×2 block (four squares forming a small square). Any net containing a 2×2 block cannot fold into a cube — two faces would overlap.',
      'Also reject any net that is a straight 1×6 strip or a 2×3 rectangle — these cannot wrap around all six faces of a cube.',
      'The one net with no 2×2 block and no rectangular strip shape is the valid net; that is the correct answer.',
    ],
    hint_steps_id: [
      'Hitung persegi di setiap jaring: setiap jaring kubus harus memiliki tepat 6 persegi.',
      'Periksa setiap jaring apakah terdapat blok 2×2 (empat persegi yang membentuk kotak kecil). Jaring yang mengandung blok 2×2 tidak dapat dilipat menjadi kubus — dua bidang akan saling menumpuk.',
      'Tolak juga jaring yang berbentuk strip lurus 1×6 atau persegi panjang 2×3 — bentuk-bentuk ini tidak dapat menutup semua enam sisi kubus.',
      'Satu-satunya jaring yang tidak memiliki blok 2×2 dan bukan strip persegi panjang adalah jaring yang benar; itulah jawaban yang tepat.',
    ],
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
