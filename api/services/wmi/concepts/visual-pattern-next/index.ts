import { z } from 'zod'
import type { ConceptLogic, Rng, WmiChoice } from '../types.js'

const paramsSchema = z.object({ cycle: z.array(z.enum(['circle', 'triangle', 'square', 'star'])).min(2).max(4), shown: z.number().int().min(5).max(8) })
export type Params = z.infer<typeof paramsSchema>
const ICON: Record<string, string> = { circle: '○', triangle: '△', square: '□', star: '☆' }
export const meta = { slug: 'visual-pattern-next', name_en: 'Continue the picture pattern', name_id: 'Lanjutkan pola gambar', grades: [1, 2] as const, description_id: 'Temukan gambar berikutnya dalam pola berulang.' } as const
export function generate(rng: Rng): Params { return { cycle: rng.shuffle(['circle', 'triangle', 'square', 'star'] as const).slice(0, rng.int(2, 4)), shown: rng.int(5, 7) } }
export function answer(p: Params): string { return p.cycle[p.shown % p.cycle.length] }
export function render(p: Params) { const labels = ['A', 'B', 'C', 'D'] as const; const opts = ['circle', 'triangle', 'square', 'star']; const choices: WmiChoice[] = opts.map((o, i) => ({ label: labels[i], text: ICON[o] })); const ans = answer(p); return { body_en: `${Array.from({ length: p.shown }, (_, i) => ICON[p.cycle[i % p.cycle.length]]).join(' ')} ?\nFind: Which picture comes next?`, body_id: `${Array.from({ length: p.shown }, (_, i) => ICON[p.cycle[i % p.cycle.length]]).join(' ')} ?\nCari: Gambar apa berikutnya?`, answer_type: 'multiple_choice' as const, choices_en: choices, choices_id: choices, answer: labels[opts.indexOf(ans)], hint_en: `The cycle is ${p.cycle.map((x) => ICON[x]).join(' ')}.`, hint_id: `Pola berulangnya ${p.cycle.map((x) => ICON[x]).join(' ')}.`, hint_steps_en: [`After ${p.shown} pictures, the next is ${ICON[ans]}.`], hint_steps_id: [`Setelah ${p.shown} gambar, berikutnya ${ICON[ans]}.`] } }
export default { meta, paramsSchema, generate, render } satisfies ConceptLogic<Params>
