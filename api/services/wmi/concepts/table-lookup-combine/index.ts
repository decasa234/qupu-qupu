import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'

const paramsSchema = z.object({ apples: z.number().int().min(5).max(30), oranges: z.number().int().min(5).max(30), mode: z.enum(['sum', 'diff']) })
export type Params = z.infer<typeof paramsSchema>
export const meta = { slug: 'table-lookup-combine', name_en: 'Table lookup and combine', name_id: 'Baca tabel lalu gabungkan', grades: [1, 2] as const, description_id: 'Baca dua nilai dari tabel, lalu jumlahkan atau kurangkan.' } as const
export function generate(rng: Rng): Params { const apples = rng.int(8, 30); const oranges = rng.int(5, apples); return { apples, oranges, mode: rng.pick(['sum', 'diff'] as const) } }
export function answer(p: Params): number { return p.mode === 'sum' ? p.apples + p.oranges : p.apples - p.oranges }
export function render(p: Params) { const ans = answer(p); const ask = p.mode === 'sum' ? 'How many apples and oranges are there altogether?' : 'How many more apples than oranges are there?'; return { body_en: `Table: apples = ${p.apples}, oranges = ${p.oranges}.\nFind: ${ask}`, body_id: `Tabel: apel = ${p.apples}, jeruk = ${p.oranges}.\nCari: ${p.mode === 'sum' ? 'Berapa jumlah apel dan jeruk?' : 'Berapa selisih apel dan jeruk?'}`, answer_type: 'fill_in' as const, choices_en: null, choices_id: null, answer: String(ans), hint_en: p.mode === 'sum' ? 'Add the two table values.' : 'Subtract the smaller table value from the larger one.', hint_id: p.mode === 'sum' ? 'Jumlahkan dua nilai tabel.' : 'Kurangkan nilai yang lebih kecil dari yang lebih besar.', hint_steps_en: [`${p.apples} ${p.mode === 'sum' ? '+' : '-'} ${p.oranges} = ${ans}.`], hint_steps_id: [`${p.apples} ${p.mode === 'sum' ? '+' : '-'} ${p.oranges} = ${ans}.`] } }
export default { meta, paramsSchema, generate, render } satisfies ConceptLogic<Params>
