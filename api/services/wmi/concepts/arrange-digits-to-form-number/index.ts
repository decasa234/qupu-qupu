import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'
import { buildArrangeDigitsToFormNumberBreakdown } from './breakdown.js'

const paramsSchema = z.object({ digits: z.array(z.number().int().min(1).max(9)).length(3), rank: z.number().int().min(1).max(6) })
export type Params = z.infer<typeof paramsSchema>
export const meta = { slug: 'arrange-digits-to-form-number', name_en: 'Arrange digits to form a number', name_id: 'Susun angka menjadi bilangan', grades: [1, 2] as const, description_id: 'Susun angka menjadi bilangan dua angka, lalu urutkan.' } as const
export function numbers(p: Params): number[] { return p.digits.flatMap((a) => p.digits.filter((b) => b !== a).map((b) => a * 10 + b)).sort((a, b) => a - b) }
export function generate(rng: Rng): Params { return { digits: rng.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3), rank: rng.int(2, 5) } }
export function render(p: Params) { const list = numbers(p); const ans = list[p.rank - 1]; return { body_en: `Use digits ${p.digits.join(', ')} to make 2-digit numbers without repeating a digit.\nFind: What is the ${p.rank}${p.rank === 2 ? 'nd' : p.rank === 3 ? 'rd' : 'th'} smallest number?`, body_id: `Gunakan angka ${p.digits.join(', ')} untuk membuat bilangan 2 angka tanpa mengulang angka.\nCari: Bilangan terkecil ke-${p.rank} adalah berapa?`, answer_type: 'fill_in' as const, choices_en: null, choices_id: null, answer: String(ans), hint_en: 'List all possible numbers, sort them, then count to the asked rank.', hint_id: 'Daftar semua bilangan, urutkan, lalu hitung sampai urutan yang ditanya.', hint_steps_en: [`Sorted list: ${list.join(', ')}`, `Rank ${p.rank} is ${ans}.`], hint_steps_id: [`Urutan: ${list.join(', ')}`, `Urutan ke-${p.rank} adalah ${ans}.`], breakdown: buildArrangeDigitsToFormNumberBreakdown(p) } }
export default { meta, paramsSchema, generate, render } satisfies ConceptLogic<Params>
