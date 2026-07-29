import { z } from 'zod'
import type { ConceptLogic, Rng } from '../types.js'
import { buildBalanceSubstitutionBreakdown } from './breakdown.js'

// balance-substitution — read TWO level balance scales, then swap one group of
// shapes for the group that weighs the same.
//
// Everything is grounded in "kubus" (unit cubes, weight 1) so a 6-year-old can
// always fall back to counting. The hidden shape weights are never stated; the
// two shown scales alone pin them down (see `generate` for the solvability
// argument).

export const SHAPE_KINDS = ['circle', 'triangle', 'square', 'star'] as const
export type ShapeKind = (typeof SHAPE_KINDS)[number]

// One pan: how many shape-A glyphs, shape-B glyphs and unit cubes sit on it.
const sideSchema = z.object({
  a: z.number().int().min(0).max(3),
  b: z.number().int().min(0).max(3),
  unit: z.number().int().min(0).max(12),
})
const scaleSchema = z.object({ left: sideSchema, right: sideSchema })

const paramsSchema = z.object({
  shapeA: z.enum(SHAPE_KINDS),
  shapeB: z.enum(SHAPE_KINDS),
  // Hidden — never printed in the body, only used to build scales that truly balance.
  wA: z.number().int().min(1).max(6),
  wB: z.number().int().min(1).max(6),
  scales: z.tuple([scaleSchema, scaleSchema]),
  ask: z.enum(['value-of-one', 'balance-group']),
  askShape: z.enum(['A', 'B']),
  askCount: z.number().int().min(1).max(3),
})
export type Side = z.infer<typeof sideSchema>
export type ScaleData = z.infer<typeof scaleSchema>
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'balance-substitution',
  name_en: 'Swap equal groups on a balance',
  name_id: 'Timbangan tukar benda',
  grades: [1] as const,
  description_id:
    'Baca dua timbangan yang seimbang, lalu tukar sekelompok bentuk dengan bentuk lain yang sama berat.',
} as const

// ── naming ────────────────────────────────────────────────────────────────

export const SHAPE_ID: Record<ShapeKind, string> = {
  circle: 'lingkaran',
  triangle: 'segitiga',
  square: 'persegi',
  star: 'bintang',
}
const SHAPE_EN: Record<ShapeKind, string> = {
  circle: 'circle',
  triangle: 'triangle',
  square: 'square',
  star: 'star',
}
export const UNIT_ID = 'kubus'

export function shapeNameEn(kind: ShapeKind, count: number): string {
  return count === 1 ? SHAPE_EN[kind] : `${SHAPE_EN[kind]}s`
}
function cubesEn(count: number): string {
  return count === 1 ? '1 cube' : `${count} cubes`
}

export function sideItemCount(side: Side): number {
  return side.a + side.b + side.unit
}

export function sideWeight(side: Side, p: Params): number {
  return side.a * p.wA + side.b * p.wB + side.unit
}

export function describeSide(side: Side, p: Params, lang: 'en' | 'id'): string {
  const parts: string[] = []
  if (side.a > 0) {
    parts.push(lang === 'id' ? `${side.a} ${SHAPE_ID[p.shapeA]}` : `${side.a} ${shapeNameEn(p.shapeA, side.a)}`)
  }
  if (side.b > 0) {
    parts.push(lang === 'id' ? `${side.b} ${SHAPE_ID[p.shapeB]}` : `${side.b} ${shapeNameEn(p.shapeB, side.b)}`)
  }
  if (side.unit > 0) {
    parts.push(lang === 'id' ? `${side.unit} ${UNIT_ID}` : cubesEn(side.unit))
  }
  return parts.join(lang === 'id' ? ' dan ' : ' and ')
}

// "1 segitiga seimbang dengan 3 kubus" / "1 triangle balances 3 cubes"
export function scaleSentence(scale: ScaleData, p: Params, lang: 'en' | 'id'): string {
  const left = describeSide(scale.left, p, lang)
  const right = describeSide(scale.right, p, lang)
  if (lang === 'id') return `${left} seimbang dengan ${right}`
  return `${left} ${sideItemCount(scale.left) === 1 ? 'balances' : 'balance'} ${right}`
}

export function askedShapeKind(p: Params): ShapeKind {
  return p.askShape === 'A' ? p.shapeA : p.shapeB
}
export function otherShapeKind(p: Params): ShapeKind {
  return p.askShape === 'A' ? p.shapeB : p.shapeA
}

export function questionText(p: Params, lang: 'en' | 'id'): string {
  const asked = askedShapeKind(p)
  const other = otherShapeKind(p)
  if (p.ask === 'value-of-one') {
    return lang === 'id'
      ? `Berapa ${UNIT_ID} yang seimbang dengan 1 ${SHAPE_ID[asked]}?`
      : `How many cubes balance 1 ${shapeNameEn(asked, 1)}?`
  }
  return lang === 'id'
    ? `Berapa ${SHAPE_ID[other]} yang seimbang dengan ${p.askCount} ${SHAPE_ID[asked]}?`
    : `How many ${shapeNameEn(other, 2)} balance ${p.askCount} ${shapeNameEn(asked, p.askCount)}?`
}

// The answer, derived from the (hidden) weights. Every generated variant makes
// this an exact positive integer.
export function solve(p: Params): number {
  if (p.ask === 'value-of-one') return p.askShape === 'A' ? p.wA : p.wB
  const asked = p.askShape === 'A' ? p.wA : p.wB
  const other = p.askShape === 'A' ? p.wB : p.wA
  return (p.askCount * asked) / other
}

// ── generation ────────────────────────────────────────────────────────────

// value-of-one: scale 1 anchors shape A against cubes, scale 2 links A to B.
// `wOther = c * wAnchor / d` is always a whole number 1..6 and never equals
// wAnchor (c !== d), so the trap value stays distinct from the answer.
type Link = { wAnchor: number; c: number; d: number }
const VALUE_LINKS: readonly Link[] = [
  { wAnchor: 1, c: 2, d: 1 }, // other = 2
  { wAnchor: 1, c: 3, d: 1 }, // other = 3
  { wAnchor: 2, c: 2, d: 1 }, // other = 4
  { wAnchor: 2, c: 3, d: 1 }, // other = 6
  { wAnchor: 3, c: 2, d: 1 }, // other = 6
  { wAnchor: 2, c: 3, d: 2 }, // other = 3
  { wAnchor: 4, c: 3, d: 2 }, // other = 6
]

// balance-group: both scales anchor a shape against cubes; the heavy shape is
// exactly k times the light one, so the swap comes out whole.
type Ratio = { wLight: number; k: number }
const GROUP_RATIOS: readonly Ratio[] = [
  { wLight: 1, k: 2 },
  { wLight: 1, k: 3 },
  { wLight: 1, k: 4 },
  { wLight: 2, k: 2 },
  { wLight: 2, k: 3 },
  { wLight: 3, k: 2 },
]

export function generate(rng: Rng): Params {
  const kinds = rng.shuffle(SHAPE_KINDS)
  const shapeA = kinds[0]
  const shapeB = kinds[1]
  const ask = rng.pick(['value-of-one', 'balance-group'] as const)

  if (ask === 'value-of-one') {
    const link = rng.pick(VALUE_LINKS)
    const wA = link.wAnchor
    const wB = (link.c * wA) / link.d
    // Scale 1 shows 1 or 2 copies of A. When the link already asks for a halving
    // (d === 2) keep the anchor at a single shape so there is only one sharing step.
    const a = link.d === 2 ? 1 : rng.pick([1, 1, 2] as const)
    const scales: [ScaleData, ScaleData] = [
      { left: { a, b: 0, unit: 0 }, right: { a: 0, b: 0, unit: a * wA } },
      { left: { a: link.c, b: 0, unit: 0 }, right: { a: 0, b: link.d, unit: 0 } },
    ]
    return { shapeA, shapeB, wA, wB, scales, ask, askShape: 'B', askCount: 1 }
  }

  const ratio = rng.pick(GROUP_RATIOS)
  const wB = ratio.wLight // B is the light shape
  const wA = ratio.k * wB // A is the heavy shape
  // At most ONE of the two scales may need a sharing step, and no pan holds
  // more than 8 cubes.
  const p = wA * 2 <= 8 ? rng.pick([1, 1, 2] as const) : 1
  const r = p === 2 || wB * 2 > 6 ? 1 : rng.pick([1, 1, 2] as const)
  const askCount = rng.pick([1, 2] as const)
  const scales: [ScaleData, ScaleData] = [
    { left: { a: p, b: 0, unit: 0 }, right: { a: 0, b: 0, unit: p * wA } },
    { left: { a: 0, b: r, unit: 0 }, right: { a: 0, b: 0, unit: r * wB } },
  ]
  return { shapeA, shapeB, wA, wB, scales, ask, askShape: 'A', askCount }
}

// ── render ────────────────────────────────────────────────────────────────

function repeatedSum(times: number, value: number): string {
  return Array.from({ length: times }, () => String(value)).join(' + ')
}

function valueOfOneSteps(p: Params): { id: string[]; en: string[] } {
  const [s1, s2] = p.scales
  const a = s1.left.a
  const cubes1 = s1.right.unit
  const c = s2.left.a
  const d = s2.right.b
  const linked = c * p.wA
  const idA = SHAPE_ID[p.shapeA]
  const idB = SHAPE_ID[p.shapeB]

  const id: string[] = []
  const en: string[] = []

  id.push(
    a === 1
      ? `Timbangan pertama: 1 ${idA} sama berat dengan ${cubes1} kubus.`
      : `Timbangan pertama: ${a} ${idA} = ${cubes1} kubus. Bagi dua: 1 ${idA} = ${p.wA} kubus.`,
  )
  en.push(
    a === 1
      ? `First scale: 1 ${shapeNameEn(p.shapeA, 1)} weighs the same as ${cubesEn(cubes1)}.`
      : `First scale: ${a} ${shapeNameEn(p.shapeA, a)} = ${cubesEn(cubes1)}. Split in two: 1 ${shapeNameEn(p.shapeA, 1)} = ${cubesEn(p.wA)}.`,
  )

  id.push(`Tukar ${idA} di timbangan kedua jadi kubus: ${repeatedSum(c, p.wA)} = ${linked} kubus.`)
  en.push(
    `Swap the ${shapeNameEn(p.shapeA, c)} on the second scale for cubes: ${repeatedSum(c, p.wA)} = ${linked} cubes.`,
  )

  id.push(
    d === 1
      ? `Timbangan kedua seimbang, jadi 1 ${idB} = ${linked} kubus.`
      : `${d} ${idB} = ${linked} kubus. Bagi dua: 1 ${idB} = ${p.wB} kubus.`,
  )
  en.push(
    d === 1
      ? `The second scale is level, so 1 ${shapeNameEn(p.shapeB, 1)} = ${cubesEn(linked)}.`
      : `${d} ${shapeNameEn(p.shapeB, d)} = ${cubesEn(linked)}. Split in two: 1 ${shapeNameEn(p.shapeB, 1)} = ${cubesEn(p.wB)}.`,
  )

  return { id, en }
}

function balanceGroupSteps(p: Params): { id: string[]; en: string[] } {
  const [s1, s2] = p.scales
  const heavyCount = s1.left.a
  const cubes1 = s1.right.unit
  const lightCount = s2.left.b
  const cubes2 = s2.right.unit
  const total = p.askCount * p.wA
  const answer = solve(p)
  const idA = SHAPE_ID[p.shapeA]
  const idB = SHAPE_ID[p.shapeB]

  const id: string[] = []
  const en: string[] = []

  id.push(
    heavyCount === 1
      ? `Timbangan pertama: 1 ${idA} = ${cubes1} kubus.`
      : `Timbangan pertama: ${heavyCount} ${idA} = ${cubes1} kubus. Bagi dua: 1 ${idA} = ${p.wA} kubus.`,
  )
  en.push(
    heavyCount === 1
      ? `First scale: 1 ${shapeNameEn(p.shapeA, 1)} = ${cubesEn(cubes1)}.`
      : `First scale: ${heavyCount} ${shapeNameEn(p.shapeA, heavyCount)} = ${cubesEn(cubes1)}. Split in two: 1 ${shapeNameEn(p.shapeA, 1)} = ${cubesEn(p.wA)}.`,
  )

  id.push(
    lightCount === 1
      ? `Timbangan kedua: 1 ${idB} = ${cubes2} kubus.`
      : `Timbangan kedua: ${lightCount} ${idB} = ${cubes2} kubus. Bagi dua: 1 ${idB} = ${p.wB} kubus.`,
  )
  en.push(
    lightCount === 1
      ? `Second scale: 1 ${shapeNameEn(p.shapeB, 1)} = ${cubesEn(cubes2)}.`
      : `Second scale: ${lightCount} ${shapeNameEn(p.shapeB, lightCount)} = ${cubesEn(cubes2)}. Split in two: 1 ${shapeNameEn(p.shapeB, 1)} = ${cubesEn(p.wB)}.`,
  )

  if (p.wB === 1) {
    id.push(
      `${p.askCount} ${idA} = ${total} kubus. Satu ${idB} = 1 kubus, jadi perlu ${answer} ${idB}.`,
    )
    en.push(
      `${p.askCount} ${shapeNameEn(p.shapeA, p.askCount)} = ${total} cubes. One ${shapeNameEn(p.shapeB, 1)} = 1 cube, so you need ${answer} ${shapeNameEn(p.shapeB, answer)}.`,
    )
  } else {
    id.push(
      `${p.askCount} ${idA} = ${total} kubus. Isi pakai ${idB}: ${repeatedSum(answer, p.wB)} = ${total}. Jadi ${answer} ${idB}.`,
    )
    en.push(
      `${p.askCount} ${shapeNameEn(p.shapeA, p.askCount)} = ${total} cubes. Fill it with ${shapeNameEn(p.shapeB, 2)}: ${repeatedSum(answer, p.wB)} = ${total}. So ${answer} ${shapeNameEn(p.shapeB, answer)}.`,
    )
  }

  return { id, en }
}

export function render(params: Params) {
  const [s1, s2] = params.scales
  const answer = solve(params)
  const steps = params.ask === 'value-of-one' ? valueOfOneSteps(params) : balanceGroupSteps(params)

  const body_id = `Ada dua timbangan yang seimbang. Pada timbangan pertama, ${scaleSentence(s1, params, 'id')}. Pada timbangan kedua, ${scaleSentence(s2, params, 'id')}.\nCari: ${questionText(params, 'id')}`
  const body_en = `Two balance scales are level. On the first scale, ${scaleSentence(s1, params, 'en')}. On the second scale, ${scaleSentence(s2, params, 'en')}.\nFind: ${questionText(params, 'en')}`

  return {
    body_en,
    body_id,
    answer_type: 'fill_in' as const,
    choices_en: null,
    choices_id: null,
    answer: String(answer),
    hint_en: 'Turn every shape into cubes first. A level scale means both sides weigh exactly the same.',
    hint_id: 'Ubah dulu setiap bentuk jadi kubus. Timbangan yang seimbang berarti kedua sisi sama berat.',
    hint_steps_en: steps.en,
    hint_steps_id: steps.id,
    breakdown: buildBalanceSubstitutionBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
