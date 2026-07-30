import { z } from 'zod'
import type { ConceptLogic, Rng, WmiChoice } from '../types.js'
import { buildSymbolBreakdown } from './breakdown.js'

// L9 `solve-symbol-equations` — two picture equations. The first holds only
// stars, so it pins one star's value; substituting that value into the second
// equation unlocks the circle.
//
// The equations are DRAWN, not typed: the in-card illustration
// (src/components/wmi/concepts/solve-symbol-equations/index.tsx) renders them as
// large coloured SVG shapes. The stem states the very same two equations in
// words so a screen-reader user — and any surface that fails to load the figure
// — can still solve it. No bare ★ / ● glyphs appear anywhere in the text.
const paramsSchema = z.object({
  /** What one star is worth. */
  s: z.number().int().min(2).max(9),
  /** What one circle is worth — the answer. */
  c: z.number().int().min(2).max(12),
  /** How many stars are in the first equation. */
  n: z.number().int().min(2).max(4),
  /** Direction of the off-by-one distractor (see `distractorValues`). */
  slip: z.union([z.literal(-1), z.literal(1)]),
  /** Which equation's total becomes the "answered the total" distractor. */
  totalKind: z.enum(['first', 'second']),
})
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'solve-symbol-equations',
  name_en: 'Solve for the symbol values',
  name_id: 'Cari nilai lambang',
  grades: [1, 2, 3] as const,
  description_id:
    'Gunakan persamaan pertama untuk mencari satu lambang, lalu masukkan nilainya ke persamaan kedua untuk mencari lambang lainnya.',
} as const

export const LABELS = ['A', 'B', 'C', 'D'] as const

/** The two totals the child reads off the picture. */
export function equationTotals(p: Params): { total1: number; total2: number } {
  return { total1: p.n * p.s, total2: p.s + p.c }
}

/**
 * The three wrong options, each one a REAL mistake a child makes on this exact
 * question type:
 *
 *   • `other-symbol`  — solved the first equation and stopped, handing back the
 *     STAR's value instead of the circle's. The classic error here: the first
 *     equation is the easy one, so its answer feels like the answer.
 *   • `off-by-one`    — mis-solved the first equation by one (a star read as
 *     s+1 or s−1), then substituted; the subtraction then lands one off in the
 *     opposite direction.
 *   • `equation-total`— gave a TOTAL printed on the page (the number after an
 *     "=") instead of what one symbol is worth: either the second equation's
 *     total (never subtracted at all) or the first equation's total.
 *
 * `slip` / `totalKind` are read defensively so a pooled row saved before these
 * params existed still renders a coherent (if stale) problem instead of NaN.
 */
export function distractorValues(p: Params): {
  otherSymbol: number
  offByOne: number
  equationTotal: number
} {
  const slip = p.slip === 1 ? 1 : -1
  const { total1, total2 } = equationTotals(p)
  return {
    otherSymbol: p.s,
    offByOne: p.c + slip,
    equationTotal: p.totalKind === 'first' ? total1 : total2,
  }
}

/** The four option values, ascending. */
export function optionValues(p: Params): number[] {
  const d = distractorValues(p)
  return [p.c, d.otherSymbol, d.offByOne, d.equationTotal].sort((a, b) => a - b)
}

export function answerLabel(p: Params): string {
  const i = optionValues(p).indexOf(p.c)
  return LABELS[i < 0 ? 0 : i]
}

/** Four options that are all distinct and none of them negative. */
function choicesUsable(p: Params): boolean {
  const vals = optionValues(p)
  return new Set(vals).size === 4 && vals.every((v) => v >= 0)
}

// Every number the explainer says BEFORE the last beat comes from this list, so
// none of them may coincide with the answer — otherwise a beat that only quotes
// a given would look like it leaked the answer early.
function answerIsUnique(s: number, c: number, n: number): boolean {
  return c !== s && c !== n && c !== n * s
}

/** Every distractor recipe that yields four usable options for this maths. */
function usableRecipes(s: number, c: number, n: number): Params[] {
  const out: Params[] = []
  for (const slip of [-1, 1] as const) {
    for (const totalKind of ['first', 'second'] as const) {
      const candidate: Params = { s, c, n, slip, totalKind }
      if (choicesUsable(candidate)) out.push(candidate)
    }
  }
  return out
}

export function generate(rng: Rng): Params {
  // Aim at a slot FIRST, then look for maths that puts the answer there. Left to
  // itself the shape of the distractors pins the answer near the middle — the
  // second equation's total is always the largest option, so a naive draw would
  // make D the sum every single time and never the answer. Aiming spreads the
  // correct choice roughly evenly across A–D.
  const target = rng.pick(LABELS)
  let fallback: Params | null = null

  for (let attempt = 0; attempt < 60; attempt++) {
    const s = rng.int(2, 9)
    const c = rng.int(2, 12)
    const n = rng.int(2, 4)
    if (!answerIsUnique(s, c, n)) continue

    const recipes = usableRecipes(s, c, n)
    if (recipes.length === 0) continue
    if (fallback === null) fallback = recipes[0]

    const onTarget = recipes.filter((r) => answerLabel(r) === target)
    if (onTarget.length > 0) return rng.pick(onTarget)
  }
  // Only reached if 60 draws never landed on the target slot.
  return fallback ?? { s: 4, c: 7, n: 3, slip: -1, totalKind: 'second' }
}

// Shape words. The stem never prints ★ / ● — the figure draws them big and in
// colour, and the words are what a screen reader gets.
const STAR = { en_1: 'star', en_p: 'stars', id: 'bintang' } as const
const CIRCLE = { en_1: 'circle', id: 'lingkaran' } as const

export function render(params: Params) {
  const { s, c, n } = params
  const { total1, total2 } = equationTotals(params)
  const label = answerLabel(params)

  const choices: WmiChoice[] = optionValues(params).map((v, i) => ({
    label: LABELS[i],
    text: String(v),
  }))

  // Three lines: share the first total evenly → carry that value across →
  // subtract to land the circle. Each line follows from the one before it.
  const hint_steps_en = [
    `Every ${STAR.en_1} is worth the same, so share the total: ${total1} ÷ ${n} = ${s}. One ${STAR.en_1} = ${s}.`,
    `A ${STAR.en_1} is worth ${s} everywhere, so put ${s} into the second equation: ${s} + ${CIRCLE.en_1} = ${total2}.`,
    `What is left over is the ${CIRCLE.en_1}: ${total2} − ${s} = ${c}. Answer ${label}.`,
  ]
  const hint_steps_id = [
    `Setiap ${STAR.id} nilainya sama, jadi bagi rata: ${total1} ÷ ${n} = ${s}. Satu ${STAR.id} = ${s}.`,
    `Nilai ${STAR.id} sama di mana pun, jadi tulis ${s} di persamaan kedua: ${s} + ${CIRCLE.id} = ${total2}.`,
    `Sisanya milik ${CIRCLE.id}: ${total2} − ${s} = ${c}. Jawabannya ${label}.`,
  ]

  return {
    body_en: `Every ${STAR.en_1} is worth the same, and every ${CIRCLE.en_1} is worth the same.\n\n${n} ${STAR.en_p} add up to ${total1}. One ${STAR.en_1} and one ${CIRCLE.en_1} add up to ${total2}.\n\nFind: What is the value of one ${CIRCLE.en_1}?`,
    body_id: `Setiap ${STAR.id} bernilai sama, dan setiap ${CIRCLE.id} bernilai sama.\n\n${n} ${STAR.id} berjumlah ${total1}. Satu ${STAR.id} dan satu ${CIRCLE.id} berjumlah ${total2}.\n\nCari: Berapa nilai satu ${CIRCLE.id}?`,
    answer_type: 'multiple_choice' as const,
    choices_en: choices,
    choices_id: choices,
    answer: label,
    hint_en: `Use the equation that has only ${STAR.en_p} to find one ${STAR.en_1}, then put that number into the second equation.`,
    hint_id: `Pakai persamaan yang isinya ${STAR.id} saja untuk mencari satu ${STAR.id}, lalu masukkan angkanya ke persamaan kedua.`,
    hint_steps_en,
    hint_steps_id,
    breakdown: buildSymbolBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
