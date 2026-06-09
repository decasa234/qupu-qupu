import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'
import { buildEquivalentFractionFillBreakdown } from './breakdown.js'

const paramsSchema = z.object({ num: z.number().int().min(1).max(5), den: z.number().int().min(2).max(9), m: z.number().int().min(2).max(8) })
export type Params = z.infer<typeof paramsSchema>
export const meta = { slug: 'equivalent-fraction-fill', name_en: 'Equivalent fraction fill', name_id: 'Isi pecahan senilai', grades: [2] as const, description_id: 'Kalikan pembilang dan penyebut dengan faktor yang sama.' } as const
export function generate(rng: Rng): Params { const den = rng.int(3, 9); return { num: rng.int(1, Math.min(den - 1, 5)), den, m: rng.int(2, 6) } }
export function answer(p: Params): number { return p.num * p.m }
export function render(p: Params) { const newDen = p.den * p.m; const ans = answer(p); return { body_en: `${p.num}/${p.den} = ?/${newDen}\nFind: What number is the question mark?`, body_id: `${p.num}/${p.den} = ?/${newDen}\nCari: Bilangan apa yang menjadi tanda tanya?`, answer_type: 'fill_in' as const, choices_en: null, choices_id: null, answer: String(ans), hint_en: `The denominator is multiplied by ${p.m}, so multiply the numerator by ${p.m}.`, hint_id: `Penyebut dikali ${p.m}, jadi pembilang juga dikali ${p.m}.`, hint_steps_en: [`${p.den} x ${p.m} = ${newDen}.`, `${p.num} x ${p.m} = ${ans}.`], hint_steps_id: [`${p.den} x ${p.m} = ${newDen}.`, `${p.num} x ${p.m} = ${ans}.`], breakdown: buildEquivalentFractionFillBreakdown(p) } }
export default { meta, paramsSchema, generate, render } satisfies ConceptLogic<Params>
