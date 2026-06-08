import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'
import { buildMissingAddendBreakdown } from './breakdown.js'

const paramsSchema = z.object({ a: z.number().int().min(5).max(60), b: z.number().int().min(3).max(40) })
export type Params = z.infer<typeof paramsSchema>
export const meta = { slug: 'missing-addend', name_en: 'Find the missing addend', name_id: 'Cari bilangan yang hilang', grades: [1, 2] as const, description_id: 'Gunakan operasi kebalikan untuk mencari bilangan yang hilang.' } as const
export function generate(rng: Rng): Params { return { a: rng.int(8, 50), b: rng.int(5, 35) } }
export function answer(p: Params): number { return p.a }
export function render(p: Params) { const sum = p.a + p.b; return { body_en: `? + ${p.b} = ${sum}\nFind: What number is the question mark?`, body_id: `? + ${p.b} = ${sum}\nCari: Bilangan apa yang menjadi tanda tanya?`, answer_type: 'fill_in' as const, choices_en: null, choices_id: null, answer: String(answer(p)), hint_en: `Undo +${p.b} by subtracting ${p.b}.`, hint_id: `Balikkan +${p.b} dengan mengurangi ${p.b}.`, hint_steps_en: [`? = ${sum} - ${p.b}`, `? = ${p.a}`], hint_steps_id: [`? = ${sum} - ${p.b}`, `? = ${p.a}`], breakdown: buildMissingAddendBreakdown(p) } }
export default { meta, paramsSchema, generate, render } satisfies ConceptLogic<Params>
