import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const paramsSchema = z.object({ up: z.number().int().min(3).max(8), down: z.number().int().min(1).max(6), cycles: z.number().int().min(2).max(8) })
export type Params = z.infer<typeof paramsSchema>
export const meta = { slug: 'net-progress-cycles', name_en: 'Net progress cycles', name_id: 'Siklus maju-mundur', grades: [2] as const, description_id: 'Hitung kemajuan bersih dari gerakan naik-turun berulang.' } as const
export function generate(rng: Rng): Params { const up = rng.int(4, 8); return { up, down: rng.int(1, Math.min(6, up - 1)), cycles: rng.int(2, 6) } }
export function answer(p: Params): number { return (p.up - p.down) * p.cycles }
export function render(p: Params) { const net = p.up - p.down; const ans = answer(p); return { body_en: `A climber goes up ${p.up} steps, then down ${p.down} steps. This repeats ${p.cycles} times.\nFind: How many steps higher is the climber than the start?`, body_id: `Seorang anak naik ${p.up} anak tangga, lalu turun ${p.down} anak tangga. Ini diulang ${p.cycles} kali.\nCari: Berapa anak tangga lebih tinggi dari awal?`, answer_type: 'fill_in' as const, choices_en: null, choices_id: null, answer: String(ans), hint_en: `Each cycle gains ${p.up} - ${p.down} = ${net}.`, hint_id: `Setiap siklus bertambah ${p.up} - ${p.down} = ${net}.`, hint_steps_en: [`Net per cycle: ${net}.`, `${net} x ${p.cycles} = ${ans}.`], hint_steps_id: [`Bersih per siklus: ${net}.`, `${net} x ${p.cycles} = ${ans}.`] } }
export default { meta, paramsSchema, generate, render } satisfies ConceptLogic<Params>
