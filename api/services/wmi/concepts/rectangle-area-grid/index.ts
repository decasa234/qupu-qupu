import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const paramsSchema = z.object({
  w: z.number().int().min(2).max(10),
  h: z.number().int().min(2).max(9),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'rectangle-area-grid',
  name_en: 'Area of a rectangle on a grid',
  name_id: 'Luas persegi panjang pada kisi',
  grades: [2, 3] as const,
  description_id: 'Hitung jumlah persegi satuan (luas) pada sebuah kisi.',
} as const

export function area(p: Params): number {
  return p.w * p.h
}

export function generate(rng: Rng): Params {
  return { w: rng.int(3, 9), h: rng.int(2, 8) }
}

export function render(params: Params) {
  const { w, h } = params
  const total = area(params)
  return {
    body_en: `The grid below shows a rectangle made of 1 cm × 1 cm unit squares. Find: How many unit squares does the rectangle cover?`,
    body_id: `Kisi di bawah menunjukkan persegi panjang yang terdiri dari persegi satuan 1 cm × 1 cm. Cari: Berapa banyak persegi satuan yang menutupi persegi panjang itu?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(total),
    hint_en: `Multiply the number of columns by the number of rows to find the total squares.`,
    hint_id: `Kalikan jumlah kolom dengan jumlah baris untuk menemukan total persegi.`,
    hint_steps_en: [
      `Count the columns across the top: ${w} columns.`,
      `Count the rows down the side: ${h} rows.`,
      `Multiply: ${w} × ${h} = ${total} unit squares.`,
    ],
    hint_steps_id: [
      `Hitung kolom di bagian atas: ${w} kolom.`,
      `Hitung baris di bagian samping: ${h} baris.`,
      `Kalikan: ${w} × ${h} = ${total} persegi satuan.`,
    ],
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
