import { z } from 'zod'
import type { ConceptLogic, Rng, WmiChoice } from '../types.js'

const paramsSchema = z.object({ shape: z.enum(['▲', '▶']), transform: z.enum(['turn', 'flip']) })
export type Params = z.infer<typeof paramsSchema>
const turn: Record<string, string> = { '▲': '▶', '▶': '▼', '■': '■' }
const flip: Record<string, string> = { '▲': '▼', '▶': '◀', '■': '■' }
export const meta = { slug: 'shape-transformation-rule', name_en: 'Apply the shape rule', name_id: 'Terapkan aturan bentuk', grades: [1, 2] as const, description_id: 'Terapkan aturan putar atau balik pada bentuk.' } as const
export function generate(rng: Rng): Params { return { shape: rng.pick(['▲', '▶'] as const), transform: rng.pick(['turn', 'flip'] as const) } }
export function answer(p: Params): string { return (p.transform === 'turn' ? turn : flip)[p.shape] }
export function render(p: Params) { const labels = ['A', 'B', 'C', 'D'] as const; const opts = ['▲', '▶', '▼', '◀']; const choices: WmiChoice[] = opts.map((o, i) => ({ label: labels[i], text: o })); const ans = answer(p); return { body_en: `Rule: ${p.transform === 'turn' ? 'turn one step clockwise' : 'flip to the opposite direction'}.\nApply the rule to ${p.shape}.`, body_id: `Aturan: ${p.transform === 'turn' ? 'putar satu langkah searah jarum jam' : 'balik ke arah berlawanan'}.\nTerapkan pada ${p.shape}.`, answer_type: 'multiple_choice' as const, choices_en: choices, choices_id: choices, answer: labels[opts.indexOf(ans)], hint_en: `${p.shape} becomes ${ans}.`, hint_id: `${p.shape} menjadi ${ans}.`, hint_steps_en: [`Apply the same rule: ${p.shape} -> ${ans}.`], hint_steps_id: [`Terapkan aturan yang sama: ${p.shape} -> ${ans}.`] } }
export default { meta, paramsSchema, generate, render } satisfies ConceptLogic<Params>
