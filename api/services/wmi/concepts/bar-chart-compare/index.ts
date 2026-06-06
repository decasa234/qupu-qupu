import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const itemSchema = z.object({ emoji: z.string().min(1), value: z.number().int().min(1).max(9) })
const paramsSchema = z.object({
  items: z.array(itemSchema).length(3),
  iA: z.number().int().min(0).max(2),
  iB: z.number().int().min(0).max(2),
})
export type Params = z.infer<typeof paramsSchema>

const FRUITS = ['🍎', '🍊', '🍌', '🍇', '🍓', '🍐'] as const

export const meta = {
  slug: 'bar-chart-compare',
  name_en: 'Compare amounts on a bar chart',
  name_id: 'Bandingkan jumlah pada diagram batang',
  grades: [1, 2, 3] as const,
  description_id: 'Baca diagram batang dan bandingkan dua jumlah.',
} as const

export function difference(p: Params): number {
  return p.items[p.iA].value - p.items[p.iB].value
}

export function generate(rng: Rng): Params {
  const emojis = rng.shuffle(FRUITS).slice(0, 3)
  // distinct values so there is a clear most and least
  const values = rng.shuffle([2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3)
  const items = emojis.map((emoji, i) => ({ emoji, value: values[i] }))
  let iA = 0
  let iB = 0
  items.forEach((it, i) => {
    if (it.value > items[iA].value) iA = i
    if (it.value < items[iB].value) iB = i
  })
  return { items, iA, iB }
}

export function render(params: Params) {
  const a = params.items[params.iA].emoji
  const b = params.items[params.iB].emoji
  const vA = params.items[params.iA].value
  const vB = params.items[params.iB].value
  const diff = difference(params)
  return {
    body_en: `Look at the [[bar-chart|bar chart]] shown. Find: How many more ${a} are there than ${b}?`,
    body_id: `Perhatikan [[bar-chart|diagram batang]] yang ditunjukkan. Cari: Ada berapa lebih banyak ${a} daripada ${b}?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(diff),
    hint_en: `Read each bar's height from the chart, then subtract the shorter bar from the taller one.`,
    hint_id: `Baca tinggi tiap batang dari diagram, lalu kurangkan batang yang lebih pendek dari yang lebih tinggi.`,
    hint_steps_en: [
      `Read the ${a} bar: its height is ${vA}.`,
      `Read the ${b} bar: its height is ${vB}.`,
      `Subtract: ${vA} − ${vB} = ${diff}. There are ${diff} more ${a} than ${b}.`,
    ],
    hint_steps_id: [
      `Baca batang ${a}: tingginya adalah ${vA}.`,
      `Baca batang ${b}: tingginya adalah ${vB}.`,
      `Kurangkan: ${vA} − ${vB} = ${diff}. Ada ${diff} lebih banyak ${a} daripada ${b}.`,
    ],
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
