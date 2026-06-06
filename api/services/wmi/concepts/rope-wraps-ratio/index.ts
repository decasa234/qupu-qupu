import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const paramsSchema = z.object({ aWraps: z.number().int().min(2).max(6), bWraps: z.number().int().min(4).max(12), bSecond: z.number().int().min(4).max(18) })
export type Params = z.infer<typeof paramsSchema>
export const meta = { slug: 'rope-wraps-ratio', name_en: 'Rope wrap ratio', name_id: 'Rasio lilitan tali', grades: [2] as const, description_id: 'Gunakan rasio lilitan tali pada dua tiang.' } as const
export function generate(rng: Rng): Params {
  // bWraps = aWraps*m and bSecond = bWraps*f, so answer = bSecond*aWraps/bWraps = f*aWraps
  // (always a whole number). Keep bWraps <= 9 and bSecond = bWraps*f <= 18 to respect the schema.
  const aWraps = rng.int(2, 4)
  const m = aWraps === 4 ? 2 : rng.int(2, 3)
  const bWraps = aWraps * m
  const f = rng.int(2, Math.max(2, Math.floor(18 / bWraps)))
  return { aWraps, bWraps, bSecond: bWraps * f }
}
export function answer(p: Params): number { return (p.bSecond * p.aWraps) / p.bWraps }
export function render(p: Params) {
  const ans = answer(p)
  const scale = p.bSecond / p.bWraps
  return {
    body_en: `Pillar B is thinner than pillar A, so the same rope wraps it more times. That rope wraps pillar A ${p.aWraps} times, or pillar B ${p.bWraps} times. A longer rope wraps pillar B ${p.bSecond} times.\nFind: How many times does the longer rope wrap pillar A?`,
    body_id: `Tiang B lebih kecil daripada tiang A, jadi tali yang sama melilitnya lebih banyak. Tali itu melilit tiang A ${p.aWraps} kali, atau tiang B ${p.bWraps} kali. Tali yang lebih panjang melilit tiang B ${p.bSecond} kali.\nCari: Berapa kali tali yang lebih panjang melilit tiang A?`,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(ans),
    hint_en: `The wraps on A and B always keep the ratio ${p.aWraps} to ${p.bWraps}: pillar A wraps are ${p.aWraps}/${p.bWraps} of pillar B wraps.`,
    hint_id: `Lilitan A dan B selalu berbanding ${p.aWraps} : ${p.bWraps}: lilitan tiang A adalah ${p.aWraps}/${p.bWraps} dari lilitan tiang B.`,
    hint_steps_en: [
      `Ratio A : B = ${p.aWraps} : ${p.bWraps}.`,
      `Pillar B went from ${p.bWraps} to ${p.bSecond}: ${p.bSecond} ÷ ${p.bWraps} = ${scale} times as many.`,
      `Pillar A grows the same way: ${p.aWraps} × ${scale} = ${ans}.`,
    ],
    hint_steps_id: [
      `Rasio A : B = ${p.aWraps} : ${p.bWraps}.`,
      `Tiang B naik dari ${p.bWraps} ke ${p.bSecond}: ${p.bSecond} ÷ ${p.bWraps} = ${scale} kali lipat.`,
      `Tiang A naik dengan cara yang sama: ${p.aWraps} × ${scale} = ${ans}.`,
    ],
  }
}
export default { meta, paramsSchema, generate, render } satisfies ConceptLogic<Params>
