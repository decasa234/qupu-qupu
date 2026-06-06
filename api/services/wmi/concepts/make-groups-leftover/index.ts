import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const paramsSchema = z.object({ total: z.number().int().min(8).max(60), groupSize: z.number().int().min(3).max(9) })
export type Params = z.infer<typeof paramsSchema>
export const meta = { slug: 'make-groups-leftover', name_en: 'Make equal groups with leftovers', name_id: 'Membuat kelompok sama dan sisa', grades: [1, 2] as const, description_id: 'Bagi benda ke kelompok sama besar dan hitung sisanya.' } as const
export function generate(rng: Rng): Params { const groupSize = rng.int(3, 8); return { total: rng.int(10, 55), groupSize } }
export function answer(p: Params): number { return p.total % p.groupSize }
export function render(p: Params) { const groups = Math.floor(p.total / p.groupSize); const rem = answer(p); return { body_en: `${p.total} counters are put into groups of ${p.groupSize}.\nFind: How many counters are left over?`, body_id: `${p.total} benda dibagi ke kelompok berisi ${p.groupSize}.\nCari: Berapa benda yang tersisa?`, answer_type: 'fill_in' as const, choices_en: null, choices_id: null, answer: String(rem), hint_en: `Make ${groups} full groups of ${p.groupSize}.`, hint_id: `Buat ${groups} kelompok penuh berisi ${p.groupSize}.`, hint_steps_en: [`${groups} x ${p.groupSize} = ${groups * p.groupSize}.`, `${p.total} - ${groups * p.groupSize} = ${rem}.`], hint_steps_id: [`${groups} x ${p.groupSize} = ${groups * p.groupSize}.`, `${p.total} - ${groups * p.groupSize} = ${rem}.`] } }
export default { meta, paramsSchema, generate, render } satisfies ConceptLogic<Params>
