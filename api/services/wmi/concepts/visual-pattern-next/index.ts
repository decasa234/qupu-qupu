import { z } from 'zod'
import type { ConceptLogic, Rng, WmiChoice } from '../types.js'
import { buildVisualPatternNextBreakdown } from './breakdown.js'

// ── Shape / colour constants ───────────────────────────────────────────────────

const SHAPES = ['circle', 'triangle', 'square', 'star'] as const
type Shape = (typeof SHAPES)[number]
const ICON: Record<Shape, string> = { circle: '○', triangle: '△', square: '□', star: '☆' }

const COLOURS = ['red', 'blue', 'green', 'yellow'] as const

// ── Mode schemas ───────────────────────────────────────────────────────────────

/**
 * simple: 2–3 distinct shapes, shown 5–7.
 * The easy floor kept for G1 accessibility (~40 % of generated instances).
 */
const simpleSchema = z.object({
  mode: z.literal('simple'),
  cycle: z.array(z.enum(SHAPES)).min(2).max(3),
  shown: z.number().int().min(5).max(7),
})

/**
 * long-cycle: 3–4 distinct shapes, shown 7–10.
 * Longer sequences make index-tracking harder (~35 % of instances).
 */
const longCycleSchema = z.object({
  mode: z.literal('long-cycle'),
  cycle: z.array(z.enum(SHAPES)).min(3).max(4),
  shown: z.number().int().min(7).max(10),
})

/** A single position in a two-attribute cycle. */
const attrItemSchema = z.object({
  shape: z.enum(SHAPES),
  colour: z.enum(COLOURS),
})

/**
 * two-attr: cycle of 2–3 (shape, colour) pairs, shown 6–9.
 * Tracking two attributes simultaneously is meaningfully harder (~25 % of
 * instances). Colour is expressed as a short text prefix on the icon, e.g.
 * "red ○", "blue △" — no illustration needed.
 */
const twoAttrSchema = z.object({
  mode: z.literal('two-attr'),
  cycle: z.array(attrItemSchema).min(2).max(3),
  shown: z.number().int().min(6).max(9),
})

export const paramsSchema = z.discriminatedUnion('mode', [
  simpleSchema,
  longCycleSchema,
  twoAttrSchema,
])

export type Params = z.infer<typeof paramsSchema>
export type AttrItem = z.infer<typeof attrItemSchema>

// ── Meta ──────────────────────────────────────────────────────────────────────

export const meta = {
  slug: 'visual-pattern-next',
  name_en: 'Continue the picture pattern',
  name_id: 'Lanjutkan pola gambar',
  grades: [1, 2] as const,
  description_id: 'Temukan gambar berikutnya dalam pola berulang.',
} as const

// ── Generator ─────────────────────────────────────────────────────────────────

/**
 * Mix of modes:
 * - 40 % simple      (gentle — G1 accessible)
 * - 35 % long-cycle  (longer shown sequence — forces careful counting)
 * - 25 % two-attr    (shape + colour — track two attributes simultaneously)
 */
export function generate(rng: Rng): Params {
  const roll = rng.int(1, 20)

  if (roll <= 8) {
    // simple: 2–3 distinct shapes
    const shuffled = rng.shuffle(SHAPES)
    const len = rng.int(2, 3)
    return { mode: 'simple', cycle: shuffled.slice(0, len), shown: rng.int(5, 7) }
  }

  if (roll <= 15) {
    // long-cycle: 3–4 distinct shapes
    const shuffled = rng.shuffle(SHAPES)
    const len = rng.int(3, 4)
    return { mode: 'long-cycle', cycle: shuffled.slice(0, len), shown: rng.int(7, 10) }
  }

  // two-attr: 2–3 (shape, colour) pairs — choose distinct shapes and vary colours
  const shuffledShapes = rng.shuffle(SHAPES)
  const shuffledColours = rng.shuffle(COLOURS)
  const len = rng.int(2, 3)
  const cycle: AttrItem[] = []
  for (let i = 0; i < len; i++) {
    cycle.push({ shape: shuffledShapes[i], colour: shuffledColours[i % shuffledColours.length] })
  }
  return { mode: 'two-attr', cycle, shown: rng.int(6, 9) }
}

// ── Backward-compat answer() helper (simple / long-cycle projection) ──────────

/**
 * Returns the shape slug of the next item in the cycle.
 * Works for the old flat `{cycle: string[], shown: number}` shape used in
 * new-g1-g2-concepts.test.ts, as well as the new simple/long-cycle modes.
 *
 * For two-attr params, this returns the shape slug only — use `render()` to
 * get the full labelled answer for that mode.
 */
export function answer(p: { cycle: readonly string[] | readonly AttrItem[]; shown: number }): string {
  const item = p.cycle[p.shown % p.cycle.length]
  if (typeof item === 'string') return item
  return item.shape
}

// ── Render helpers ─────────────────────────────────────────────────────────────

/** Format a two-attr item as display text, e.g. "red ○". */
function attrLabel(item: AttrItem): string {
  return `${item.colour} ${ICON[item.shape]}`
}

/** Build the sequence row (space-joined icons) for simple/long-cycle. */
function shapeRow(cycle: readonly string[], shown: number): string {
  return Array.from({ length: shown }, (_, i) => ICON[cycle[i % cycle.length] as Shape]).join(' ')
}

/** Build the sequence row for two-attr mode. */
function attrRow(cycle: readonly AttrItem[], shown: number): string {
  return Array.from({ length: shown }, (_, i) => attrLabel(cycle[i % cycle.length])).join('  ')
}

// ── Render ────────────────────────────────────────────────────────────────────

export function render(params: Params) {
  const labels = ['A', 'B', 'C', 'D'] as const

  if (params.mode === 'simple' || params.mode === 'long-cycle') {
    // Fixed four-choice layout: A=circle, B=triangle, C=square, D=star
    const choices: WmiChoice[] = SHAPES.map((s, i) => ({ label: labels[i], text: ICON[s] }))
    const ans = params.cycle[params.shown % params.cycle.length] as Shape
    const ansLabel = labels[SHAPES.indexOf(ans)]
    const row = shapeRow(params.cycle, params.shown)
    const cycleIcons = params.cycle.map((s) => ICON[s as Shape]).join(' ')

    const isLong = params.mode === 'long-cycle'
    const hintEN = isLong
      ? `The cycle is ${cycleIcons}. Count through the positions to find #${params.shown + 1}.`
      : `The cycle is ${cycleIcons}.`
    const hintID = isLong
      ? `Pola berulangnya ${cycleIcons}. Hitung posisi untuk menemukan posisi ke-${params.shown + 1}.`
      : `Pola berulangnya ${cycleIcons}.`

    return {
      body_en: `${row} ?\nFind: Which picture comes next?`,
      body_id: `${row} ?\nCari: Gambar apa berikutnya?`,
      answer_type: 'multiple_choice' as const,
      choices_en: choices,
      choices_id: choices,
      answer: ansLabel,
      hint_en: hintEN,
      hint_id: hintID,
      hint_steps_en: [
        `The repeating cycle is: ${cycleIcons}.`,
        `There are ${params.shown} pictures shown, so the next (position ${params.shown + 1}) is at cycle index ${params.shown % params.cycle.length}.`,
        `Cycle index ${params.shown % params.cycle.length} → ${ICON[ans]}.`,
      ],
      hint_steps_id: [
        `Pola yang berulang: ${cycleIcons}.`,
        `Ada ${params.shown} gambar ditampilkan, jadi gambar ke-${params.shown + 1} ada di indeks siklus ${params.shown % params.cycle.length}.`,
        `Indeks siklus ${params.shown % params.cycle.length} → ${ICON[ans]}.`,
      ],
      breakdown: buildVisualPatternNextBreakdown(params),
    }
  }

  // ── two-attr mode ────────────────────────────────────────────────────────────
  const cycle = params.cycle
  const correctItem = cycle[params.shown % cycle.length]
  const correctText = attrLabel(correctItem)

  // Build choices: start from cycle items (deduplicated by text), then add a
  // "same shape, wrong colour" distractor if we still need entries.
  const seen = new Set<string>()
  const choiceTexts: string[] = []

  // Correct answer first
  choiceTexts.push(correctText)
  seen.add(correctText)

  // Other cycle items
  for (const item of cycle) {
    const t = attrLabel(item)
    if (!seen.has(t)) {
      choiceTexts.push(t)
      seen.add(t)
    }
  }

  // Fill to 4 with distractors: same shape as correct, different colour
  for (const col of COLOURS) {
    if (choiceTexts.length >= 4) break
    const t = `${col} ${ICON[correctItem.shape]}`
    if (!seen.has(t)) {
      choiceTexts.push(t)
      seen.add(t)
    }
  }

  // Fill any remaining slots with other shape+colour combos
  for (const sh of SHAPES) {
    for (const col of COLOURS) {
      if (choiceTexts.length >= 4) break
      const t = `${col} ${ICON[sh]}`
      if (!seen.has(t)) {
        choiceTexts.push(t)
        seen.add(t)
      }
    }
    if (choiceTexts.length >= 4) break
  }

  const choices: WmiChoice[] = labels.map((label, i) => ({ label, text: choiceTexts[i] }))
  // Correct is always first → always label 'A'
  const ansLabel = 'A'

  const row = attrRow(cycle, params.shown)
  const cycleText = cycle.map(attrLabel).join('  →  ')

  return {
    body_en: `${row}  ?\nFind: Which picture-and-colour comes next?`,
    body_id: `${row}  ?\nCari: Gambar dan warna apa berikutnya?`,
    answer_type: 'multiple_choice' as const,
    choices_en: choices,
    choices_id: choices,
    answer: ansLabel,
    hint_en: `Track both shape AND colour. The cycle is: ${cycleText}.`,
    hint_id: `Perhatikan bentuk DAN warna sekaligus. Pola siklusnya: ${cycleText}.`,
    hint_steps_en: [
      `The cycle has ${cycle.length} steps: ${cycleText}.`,
      `Position ${params.shown + 1} falls at cycle index ${params.shown % cycle.length}.`,
      `Cycle index ${params.shown % cycle.length} = ${correctText}.`,
    ],
    hint_steps_id: [
      `Siklusnya punya ${cycle.length} langkah: ${cycleText}.`,
      `Posisi ke-${params.shown + 1} jatuh di indeks siklus ${params.shown % cycle.length}.`,
      `Indeks siklus ${params.shown % cycle.length} = ${correctText}.`,
    ],
    breakdown: buildVisualPatternNextBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
