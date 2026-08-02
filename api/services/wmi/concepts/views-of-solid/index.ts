import { z } from 'zod'
import type { ConceptLogic, Rendered, Rng, WmiChoice } from '../types.js'
import { buildViewsOfSolidBreakdown } from './breakdown.js'

// A pile of unit cubes, and the flat pictures you get by standing in front of
// it, walking round to its right, or looking straight down on it.
//
// The one fact this concept lives or dies on: a flat view is a SHADOW, not a
// count. Two stacks standing one behind the other make ONE column of squares as
// tall as the taller of them, so a short stack can hide completely behind a tall
// one — and a tall stack behind a short one still shows its full height.
//
// Every flat picture in this file — the answer AND every wrong option — comes
// out of `projectVoxels`, one function fed a voxel list and an axis. Nothing is
// authored by hand, so the figure and the answer cannot disagree.
//
// Not `block-count-3d` (which only counts cubes) and not `dice-net-fold` (which
// folds a net): this is the only concept that reasons about projections.

export const ASKS = ['which-view', 'cubes-per-layer', 'count-blocks'] as const
export type Ask = (typeof ASKS)[number]

export const VIEWS = ['front', 'side', 'top'] as const
export type View = (typeof VIEWS)[number]

export const CHOICE_LABELS = ['A', 'B', 'C', 'D'] as const
export const OPTION_COUNT = CHOICE_LABELS.length

export const MAX_HEIGHT = 3
export const MIN_CUBES = 5
export const MAX_CUBES = 12

// ── The solid ────────────────────────────────────────────────────────────────

/**
 * A gravity-filled pile on a `width` × `depth` floor: `heights[y * width + x]`
 * cubes stacked on floor square (x, y). x runs left→right, y runs front→back
 * (y = 0 is the row nearest the child), z runs up. Same axes as the `IsoCubes`
 * primitive the figure draws with.
 */
export interface Solid {
  width: number
  depth: number
  heights: number[]
}

export interface Voxel {
  x: number
  y: number
  z: number
}

/** Rows × columns of the flat picture. Row 0 is the TOP row as drawn. */
export interface Frame {
  rows: number
  cols: number
}

/** A flat view: `cells[r * cols + c]` is true where a square is drawn. */
export interface Flat extends Frame {
  cells: boolean[]
}

export function heightAt(solid: Solid, x: number, y: number): number {
  if (x < 0 || x >= solid.width || y < 0 || y >= solid.depth) return 0
  const h = solid.heights[y * solid.width + x]
  return Number.isFinite(h) ? (h as number) : 0
}

/** Every cube in the pile, front row first. Order is irrelevant to projection. */
export function solidVoxels(solid: Solid): Voxel[] {
  const cubes: Voxel[] = []
  for (let y = 0; y < solid.depth; y++) {
    for (let x = 0; x < solid.width; x++) {
      for (let z = 0; z < heightAt(solid, x, y); z++) cubes.push({ x, y, z })
    }
  }
  return cubes
}

export function cubeCount(solid: Solid): number {
  let total = 0
  for (let y = 0; y < solid.depth; y++) {
    for (let x = 0; x < solid.width; x++) total += heightAt(solid, x, y)
  }
  return total
}

export function maxHeightOf(solid: Solid): number {
  let max = 0
  for (let y = 0; y < solid.depth; y++) {
    for (let x = 0; x < solid.width; x++) max = Math.max(max, heightAt(solid, x, y))
  }
  return max
}

/**
 * READABILITY. In this isometric projection a cube at (x, y, z) is covered
 * *exactly* by the cube at (x + 1, y − 1, z + 1) — the one step nearer the
 * viewer — and by nothing else, because the drawn hexagons tile without
 * overlapping. So:
 *
 *   • the TOP cube of a stack (z = h − 1) is visible  ⟺  h[y−1][x+1] ≤ h[y][x]
 *   • an EMPTY floor square (the notch is visible)    ⟺  h[y−1][x+1] ≤ 1
 *
 * With every stack solid down to the floor (which the stem states), seeing every
 * stack top and every gap is enough to know the whole pile. A solid that fails
 * this test would hide a stack the child is asked to read, so it is rejected.
 */
export function isReadable(solid: Solid): boolean {
  for (let y = 1; y < solid.depth; y++) {
    for (let x = 0; x < solid.width - 1; x++) {
      const here = heightAt(solid, x, y)
      if (heightAt(solid, x + 1, y - 1) > Math.max(here, 1)) return false
    }
  }
  return true
}

// ── The one projection ───────────────────────────────────────────────────────

/** Rows × cols the flat picture of `solid` needs, for each direction. */
export function viewFrame(solid: Solid, view: View): Frame {
  if (view === 'top') return { rows: solid.depth, cols: solid.width }
  const rows = Math.max(1, maxHeightOf(solid))
  return { rows, cols: view === 'front' ? solid.width : solid.depth }
}

/**
 * THE projection. Flattens a voxel list along one axis into a fixed frame.
 * Used for the true view, for every wrong option, and by the figure — so a
 * picture that disagrees with the answer is not expressible.
 *
 *   front — look along +y : column = x,  row from the bottom = z
 *   side  — look along −x : column = y,  row from the bottom = z   (front on the left)
 *   top   — look down     : column = x,  row from the bottom = y   (front row at the bottom)
 */
export function projectVoxels(cubes: readonly Voxel[], view: View, frame: Frame): Flat {
  const cells = new Array<boolean>(frame.rows * frame.cols).fill(false)
  for (const { x, y, z } of cubes) {
    const c = view === 'side' ? y : x
    const up = view === 'top' ? y : z
    const r = frame.rows - 1 - up
    if (r < 0 || r >= frame.rows || c < 0 || c >= frame.cols) continue
    cells[r * frame.cols + c] = true
  }
  return { rows: frame.rows, cols: frame.cols, cells }
}

/** True when every voxel lands inside `frame` (a taller pile needs a taller frame). */
export function fitsFrame(cubes: readonly Voxel[], view: View, frame: Frame): boolean {
  for (const { x, y, z } of cubes) {
    const c = view === 'side' ? y : x
    const up = view === 'top' ? y : z
    const r = frame.rows - 1 - up
    if (r < 0 || r >= frame.rows || c < 0 || c >= frame.cols) return false
  }
  return true
}

export function flatKey(flat: Flat): string {
  return `${flat.rows}x${flat.cols}:${flat.cells.map((on) => (on ? '1' : '0')).join('')}`
}

/**
 * How many squares each column of a flat view shows. Every view here comes from
 * a gravity-filled pile, so a column is filled from the bottom up with no gaps
 * and the count says everything about it.
 */
export function columnHeights(flat: Flat): number[] {
  const out: number[] = []
  for (let c = 0; c < flat.cols; c++) {
    let n = 0
    for (let r = 0; r < flat.rows; r++) if (flat.cells[r * flat.cols + c]) n += 1
    out.push(n)
  }
  return out
}

// ── Wrong options: perturb the pile, then check the shadow really moved ──────

/**
 * Wrong pictures, in a deterministic order. Each one is the view of a pile that
 * differs from the real pile by exactly ONE cube — added or taken away. A cube
 * that is hidden in this direction leaves the view unchanged, so those
 * perturbations are dropped: what survives is guaranteed to differ from the
 * truth, and duplicates are dropped too. That is what makes exactly one of the
 * four offered pictures correct.
 */
export function distractorFlats(solid: Solid, view: View, frame: Frame, truth: Flat): Flat[] {
  const truthKey = flatKey(truth)
  const grown: Flat[] = []
  const shrunk: Flat[] = []

  for (let i = 0; i < solid.width * solid.depth; i++) {
    for (const delta of [1, -1]) {
      const heights = solid.heights.slice()
      const next = (Number.isFinite(heights[i]) ? heights[i] : 0) + delta
      if (!Number.isFinite(next) || next < 0 || next > MAX_HEIGHT) continue
      heights[i] = next
      const candidate: Solid = { width: solid.width, depth: solid.depth, heights }
      if (cubeCount(candidate) < 1) continue
      const cubes = solidVoxels(candidate)
      if (!fitsFrame(cubes, view, frame)) continue
      const flat = projectVoxels(cubes, view, frame)
      if (flatKey(flat) === truthKey) continue // that cube is hidden from here — no good
      ;(delta > 0 ? grown : shrunk).push(flat)
    }
  }

  // Interleave so the wrong pictures are not all "one square fuller".
  const out: Flat[] = []
  const seen = new Set<string>([truthKey])
  for (let i = 0; i < Math.max(grown.length, shrunk.length); i++) {
    for (const flat of [grown[i], shrunk[i]]) {
      if (!flat) continue
      const key = flatKey(flat)
      if (seen.has(key)) continue
      seen.add(key)
      out.push(flat)
    }
  }
  return out
}

/** The four offered pictures, with the true one parked at `answerSlot`. */
export function optionFlats(solid: Solid, view: View, answerSlot: number): Flat[] {
  const frame = viewFrame(solid, view)
  const truth = projectVoxels(solidVoxels(solid), view, frame)
  const wrong = distractorFlats(solid, view, frame, truth)
  if (wrong.length < OPTION_COUNT - 1) {
    throw new Error(`views-of-solid: only ${wrong.length} wrong ${view} views available`)
  }
  const slot = Math.max(0, Math.min(OPTION_COUNT - 1, answerSlot))
  const out: Flat[] = []
  let w = 0
  for (let i = 0; i < OPTION_COUNT; i++) out.push(i === slot ? truth : wrong[w++])
  return out
}

/** The first square where a wrong picture betrays itself, scanning top-left first. */
export interface Mismatch {
  r: number
  c: number
  optionFilled: boolean
  trueFilled: boolean
  optionHeight: number
  trueHeight: number
}

export function firstMismatch(truth: Flat, option: Flat): Mismatch | null {
  const truthCols = columnHeights(truth)
  const optionCols = columnHeights(option)
  for (let r = 0; r < truth.rows; r++) {
    for (let c = 0; c < truth.cols; c++) {
      const i = r * truth.cols + c
      if (truth.cells[i] === option.cells[i]) continue
      return {
        r,
        c,
        optionFilled: option.cells[i],
        trueFilled: truth.cells[i],
        optionHeight: optionCols[c],
        trueHeight: truthCols[c],
      }
    }
  }
  return null
}

// ── Params ───────────────────────────────────────────────────────────────────

/**
 * The minimum shape `solve` needs. Declared structurally rather than as
 * `Params`, because a schema refinement calls `solve`: taking `Params` there
 * would make `Params = z.infer<typeof paramsSchema>` reference itself.
 */
export interface SolvableSolid {
  width: number
  depth: number
  heights: number[]
  ask: Ask
  view: View
  layer: number
  answerSlot: number
}

const paramsSchema = z
  .object({
    width: z.number().int().min(2).max(4),
    depth: z.number().int().min(2).max(3),
    /** `heights[y * width + x]`, 0 means an empty floor square. */
    heights: z.array(z.number().int().min(0).max(MAX_HEIGHT)).min(4).max(12),
    ask: z.enum(ASKS),
    /** Which direction is asked about. Only `which-view` uses it. */
    view: z.enum(VIEWS),
    /** Which layer is counted, 1 = the floor. Only `cubes-per-layer` uses it. */
    layer: z.number().int().min(1).max(MAX_HEIGHT),
    /** Where the true picture sits among A–D. Only `which-view` uses it. */
    answerSlot: z.number().int().min(0).max(OPTION_COUNT - 1),
  })
  .refine((v) => v.heights.length === v.width * v.depth, {
    message: 'heights must hold exactly width × depth floor squares',
  })
  .refine(
    (v) => {
      const total = cubeCount(v)
      return total >= MIN_CUBES && total <= MAX_CUBES
    },
    { message: `the pile must hold ${MIN_CUBES}–${MAX_CUBES} cubes` },
  )
  .refine((v) => isReadable(v), {
    message: 'every stack top and every gap must be visible in the drawing',
  })
  .refine((v) => v.layer <= maxHeightOf(v), {
    message: 'the counted layer must exist',
  })
  .refine(
    (v) => {
      if (v.ask !== 'which-view') return true
      if (v.heights.length !== v.width * v.depth) return true // already reported above
      const frame = viewFrame(v, v.view)
      const truth = projectVoxels(solidVoxels(v), v.view, frame)
      return distractorFlats(v, v.view, frame, truth).length >= OPTION_COUNT - 1
    },
    { message: 'a picture question needs three genuinely different wrong views' },
  )
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'views-of-solid',
  name_en: 'A solid seen from several directions',
  name_id: 'Bangun dilihat dari beberapa arah',
  grades: [1, 2, 3] as const,
  description_id:
    'Membaca bentuk susunan kubus dari depan, samping, dan atas — dan sebaliknya, menghitung kubus dari gambar datarnya.',
} as const

// ── Solving ──────────────────────────────────────────────────────────────────

export interface Stack {
  x: number
  y: number
  height: number
}

export interface Solution {
  solid: Solid
  cubes: Voxel[]
  total: number
  maxHeight: number
  /** Every floor square with at least one cube, front row first. */
  stacks: Stack[]
  /** Cubes on each floor square laid out per depth row, front row first. */
  rows: number[][]
  rowTotals: number[]
  footprint: number
  frame: Frame
  truth: Flat
  /** Empty unless the ask is `which-view`. */
  options: Flat[]
  answerLabel: string
  /** Stacks that reach the counted layer, i.e. at least `layer` cubes tall. */
  layerStacks: Stack[]
  layerCount: number
  /** The miscount of taking only stacks exactly `layer` tall. */
  exactLayerCount: number
  answer: string
}

export function solve(params: SolvableSolid): Solution {
  const solid: Solid = { width: params.width, depth: params.depth, heights: params.heights }
  const cubes = solidVoxels(solid)
  const total = cubeCount(solid)
  const maxHeight = maxHeightOf(solid)

  const stacks: Stack[] = []
  const rows: number[][] = []
  for (let y = 0; y < solid.depth; y++) {
    const row: number[] = []
    for (let x = 0; x < solid.width; x++) {
      const height = heightAt(solid, x, y)
      row.push(height)
      if (height > 0) stacks.push({ x, y, height })
    }
    rows.push(row)
  }
  const rowTotals = rows.map((row) => row.reduce((a, b) => a + b, 0))

  const frame = viewFrame(solid, params.view)
  const truth = projectVoxels(cubes, params.view, frame)
  const options = params.ask === 'which-view' ? optionFlats(solid, params.view, params.answerSlot) : []
  const answerLabel = params.ask === 'which-view' ? CHOICE_LABELS[params.answerSlot] : ''

  const layerStacks = stacks.filter((s) => s.height >= params.layer)
  const layerCount = layerStacks.length
  const exactLayerCount = stacks.filter((s) => s.height === params.layer).length

  const answer =
    params.ask === 'which-view'
      ? answerLabel
      : params.ask === 'cubes-per-layer'
        ? String(layerCount)
        : String(total)

  return {
    solid,
    cubes,
    total,
    maxHeight,
    stacks,
    rows,
    rowTotals,
    footprint: solid.width * solid.depth,
    frame,
    truth,
    options,
    answerLabel,
    layerStacks,
    layerCount,
    exactLayerCount,
    answer,
  }
}

// ── Words ────────────────────────────────────────────────────────────────────

/** English needs "1 cube" but "4 cubes"; Indonesian needs neither. */
export const plural = (n: number, one: string, many: string): string => `${n} ${n === 1 ? one : many}`

export const VIEW_WORD_EN: Record<View, string> = { front: 'front', side: 'right side', top: 'top' }
export const VIEW_WORD_ID: Record<View, string> = { front: 'depan', side: 'samping kanan', top: 'atas' }

export function rowNames(depth: number, lang: 'en' | 'id'): string[] {
  if (depth >= 3) {
    return lang === 'id' ? ['depan', 'tengah', 'belakang'] : ['front', 'middle', 'back']
  }
  return lang === 'id' ? ['depan', 'belakang'] : ['front', 'back']
}

/** Names the square a wrong picture gets wrong, in the language of that view. */
export function cellPhrase(view: View, m: Mismatch, s: Solution, lang: 'en' | 'id'): string {
  if (view === 'top') {
    const name = rowNames(s.solid.depth, lang)[s.solid.depth - 1 - m.r]
    return lang === 'id' ? `baris ${name} kolom ke-${m.c + 1}` : `the ${name} row, column ${m.c + 1}`
  }
  const level = s.frame.rows - m.r
  return lang === 'id' ? `kolom ke-${m.c + 1} tingkat ke-${level}` : `column ${m.c + 1}, level ${level}`
}

// ── Generation ───────────────────────────────────────────────────────────────

/** Hand-checked pile used when a draft run comes up empty. See index.test.ts. */
const FALLBACK: Params = {
  width: 3,
  depth: 2,
  heights: [2, 1, 3, 1, 3, 1],
  ask: 'which-view',
  view: 'front',
  layer: 2,
  answerSlot: 1,
}

function draft(rng: Rng): Params {
  const ask = rng.pick(ASKS)
  const depth = rng.int(2, 3)
  const width = depth === 3 ? rng.int(2, 3) : rng.int(2, 4)
  const heights: number[] = []
  for (let i = 0; i < width * depth; i++) heights.push(rng.int(0, MAX_HEIGHT))
  const view = rng.pick(VIEWS)
  // Never layer 1: "how many cubes touch the floor" is just the footprint, and
  // the whole point of the ask is that a TALLER stack also passes through the
  // layer being counted.
  const layer = rng.int(2, MAX_HEIGHT)
  const answerSlot = rng.int(0, OPTION_COUNT - 1)
  return { width, depth, heights, ask, view, layer, answerSlot }
}

/**
 * Quality filter on top of the schema. It throws out the shapes that are legal
 * but not worth asking: flat slabs with nothing to project, views that are one
 * solid block of squares, layer questions whose answer is the whole pile, and
 * front / side questions where no stack is ever hidden behind another (which is
 * the entire idea the concept teaches).
 */
function isWorthAsking(p: Params): boolean {
  if (!paramsSchema.safeParse(p).success) return false
  const s = solve(p)
  if (s.maxHeight < 2) return false
  if (s.stacks.length < 3) return false
  if (new Set(s.stacks.map((st) => st.height)).size < 2) return false

  if (p.ask === 'which-view') {
    const filled = s.truth.cells.filter(Boolean).length
    if (filled === s.truth.cells.length || filled < 2) return false
    if (p.view === 'top') {
      // A top view that is the whole rectangle teaches nothing.
      if (s.stacks.length === s.footprint) return false
    } else {
      // At least one column must be as tall as a stack standing BEHIND the
      // nearest one — otherwise reading the front row alone would have worked.
      const heights = columnHeights(s.truth)
      const nearest =
        p.view === 'front'
          ? Array.from({ length: s.solid.width }, (_, x) => heightAt(s.solid, x, 0))
          : Array.from({ length: s.solid.depth }, (_, y) => heightAt(s.solid, s.solid.width - 1, y))
      if (!heights.some((h, i) => h > nearest[i])) return false
    }
    return true
  }

  if (p.ask === 'cubes-per-layer') {
    if (p.layer < 2) return false
    if (s.layerCount < 2) return false
    if (s.layerCount >= s.total) return false
    // The tempting "count the stacks that are exactly this tall" must be wrong.
    return s.exactLayerCount !== s.layerCount
  }

  // count-blocks: the numbered plan must not be readable as "one cube per square".
  if (s.total === s.footprint) return false
  return s.stacks.length >= 4
}

export function generate(rng: Rng): Params {
  for (let attempt = 0; attempt < 200; attempt++) {
    const candidate = draft(rng)
    if (isWorthAsking(candidate)) return candidate
  }
  return FALLBACK
}

// ── Rendering ────────────────────────────────────────────────────────────────

function listOf(parts: string[], lang: 'en' | 'id'): string {
  if (parts.length <= 1) return parts.join('')
  const join = lang === 'id' ? ' dan ' : ' and '
  return `${parts.slice(0, -1).join(', ')}${join}${parts[parts.length - 1]}`
}

/** "front row 2, 1, 3; back row 1, 3, 1" — the pile read straight off the drawing. */
export function stacksSentence(s: Solution, lang: 'en' | 'id'): string {
  const names = rowNames(s.solid.depth, lang)
  return s.rows
    .map((row, y) => (lang === 'id' ? `baris ${names[y]} ${row.join(', ')}` : `${names[y]} row ${row.join(', ')}`))
    .join('; ')
}

function whichViewSteps(p: Params, s: Solution, lang: 'en' | 'id'): string[] {
  const id = lang === 'id'
  const names = rowNames(s.solid.depth, lang)
  const heights = columnHeights(s.truth)
  const steps: string[] = []

  if (p.view === 'top') {
    steps.push(
      id
        ? 'Dilihat dari atas kamu hanya melihat lantainya: sebuah kotak terisi kalau ada kubus berdiri di situ, dan tinggi tumpukannya sama sekali tidak terlihat.'
        : 'Looking down you only see the floor: a square is filled when at least one cube stands on it, and how tall that stack is does not show at all.',
    )
    steps.push(
      id
        ? `Tinggi tumpukannya: ${stacksSentence(s, lang)}. Kotak yang ada isinya berarti: ${s.rows
            .map((row, y) => `baris ${names[y]} ${row.map((h) => (h > 0 ? 'terisi' : 'kosong')).join(', ')}`)
            .join('; ')}.`
        : `The stacks are: ${stacksSentence(s, lang)}. So the filled squares are: ${s.rows
            .map((row, y) => `${names[y]} row ${row.map((h) => (h > 0 ? 'filled' : 'empty')).join(', ')}`)
            .join('; ')}.`,
    )
  } else {
    const along = id
      ? p.view === 'front'
        ? 'satu kolom berdiri sejajar ke belakang'
        : 'satu baris berdiri sejajar ke samping'
      : p.view === 'front'
        ? 'one column stand one behind another'
        : 'one row stand one beside another'
    steps.push(
      id
        ? `Dilihat dari ${VIEW_WORD_ID[p.view]}, tumpukan dalam ${along}, jadi yang terlihat hanyalah tumpukan yang PALING TINGGI di situ — tumpukan pendek bersembunyi di balik tumpukan tinggi.`
        : `Seen from the ${VIEW_WORD_EN[p.view]}, the stacks in ${along}, so what shows is only the TALLEST stack there — a short stack hides behind a tall one.`,
    )
    const perColumn = heights.map((h, i) => {
      const stacksHere =
        p.view === 'front'
          ? Array.from({ length: s.solid.depth }, (_, y) => heightAt(s.solid, i, y))
          : Array.from({ length: s.solid.width }, (_, x) => heightAt(s.solid, x, i))
      return id
        ? `kolom ke-${i + 1} punya tinggi tumpukan ${stacksHere.join(' dan ')}, jadi terlihat ${h} kotak`
        : `column ${i + 1} has stack heights ${stacksHere.join(' and ')}, so it shows ${plural(h, 'square', 'squares')}`
    })
    steps.push(
      id ? `Jadi: ${perColumn.join('; ')}.` : `So: ${perColumn.join('; ')}.`,
    )
    steps.push(
      id
        ? `Gambar yang benar harus punya kolom setinggi ${heights.join(', ')} dari kiri ke kanan.`
        : `The right picture must have columns ${heights.join(', ')} squares tall, left to right.`,
    )
  }

  // Elimination — each wrong picture is crossed out by a square that is named.
  const crossed: string[] = []
  s.options.forEach((option, i) => {
    const label = CHOICE_LABELS[i]
    if (label === s.answerLabel) return
    const m = firstMismatch(s.truth, option)
    if (!m) return
    const where = cellPhrase(p.view, m, s, lang)
    if (p.view === 'top') {
      crossed.push(
        id
          ? `${label} membuat ${where} ${m.optionFilled ? 'terisi' : 'kosong'}, padahal di situ ${m.trueFilled ? 'ada kubus' : 'tidak ada kubus'}`
          : `${label} leaves ${where} ${m.optionFilled ? 'filled' : 'empty'}, but there ${m.trueFilled ? 'is a cube' : 'is no cube'} there`,
      )
    } else {
      crossed.push(
        id
          ? `${label} menunjukkan ${m.optionHeight} kotak di kolom ke-${m.c + 1}, padahal harus ${m.trueHeight}`
          : `${label} shows ${plural(m.optionHeight, 'square', 'squares')} in column ${m.c + 1}, but it must be ${m.trueHeight}`,
      )
    }
  })
  steps.push(
    id ? `Coret yang tidak cocok: ${crossed.join('; ')}.` : `Cross out what does not match: ${crossed.join('; ')}.`,
  )
  steps.push(
    id
      ? `Tinggal gambar ${s.answerLabel} yang cocok di setiap kotak. Jawabannya ${s.answerLabel}.`
      : `Only picture ${s.answerLabel} matches on every square. The answer is ${s.answerLabel}.`,
  )
  return steps
}

function layerSteps(p: Params, s: Solution, lang: 'en' | 'id'): string[] {
  const id = lang === 'id'
  const names = rowNames(s.solid.depth, lang)
  const reaching = s.layerStacks.map((st) =>
    id
      ? `baris ${names[st.y]} kolom ke-${st.x + 1} (tinggi ${st.height})`
      : `${names[st.y]} row column ${st.x + 1} (${st.height} tall)`,
  )
  return id
    ? [
        `Setiap tumpukan padat dari lantai ke atas, jadi tumpukan setinggi ${p.layer} kubus mengisi tingkat 1 sampai ${p.layer}. Sebuah tumpukan baru sampai ke tingkat ke-${p.layer} kalau tingginya PALING SEDIKIT ${p.layer} kubus.`,
        `Baca tinggi tiap tumpukan dari gambar: ${stacksSentence(s, lang)}.`,
        `Yang tingginya paling sedikit ${p.layer}: ${listOf(reaching, lang)} — ada ${s.layerCount} tumpukan.`,
        `Tiap tumpukan itu menyumbang tepat satu kubus di tingkat ke-${p.layer}, jadi tingkat ke-${p.layer} berisi ${s.layerCount} kubus.`,
      ]
    : [
        `Every stack is solid from the floor up, so a stack ${p.layer} cubes tall fills layers 1 to ${p.layer}. A stack only reaches layer ${p.layer} if it is AT LEAST ${p.layer} cubes tall.`,
        `Read the height of every stack off the picture: ${stacksSentence(s, lang)}.`,
        `Stacks at least ${p.layer} tall: ${listOf(reaching, lang)} — that is ${s.layerCount} of them.`,
        `Each of those puts exactly one cube in layer ${p.layer}, so layer ${p.layer} holds ${s.layerCount} cubes.`,
      ]
}

function countSteps(s: Solution, lang: 'en' | 'id'): string[] {
  const id = lang === 'id'
  const names = rowNames(s.solid.depth, lang)
  const perRow = s.rows.map((row, y) =>
    id
      ? `baris ${names[y]}: ${row.join(' + ')} = ${s.rowTotals[y]}`
      : `${names[y]} row: ${row.join(' + ')} = ${s.rowTotals[y]}`,
  )
  return id
    ? [
        `Angka di sebuah kotak bukan satu kubus — angka itu memberi tahu berapa kubus ditumpuk di kotak itu. Jadi yang dijumlahkan adalah angkanya, bukan kotaknya.`,
        `Jumlahkan tiap baris: ${perRow.join('; ')}.`,
        `Jumlahkan hasil barisnya: ${s.rowTotals.join(' + ')} = ${s.total} kubus.`,
      ]
    : [
        `A number in a square is not one cube — it tells how many cubes are stacked on that square. So you add the numbers, not the squares.`,
        `Add each row: ${perRow.join('; ')}.`,
        `Add the row totals: ${s.rowTotals.join(' + ')} = ${s.total} cubes.`,
      ]
}

export function render(params: Params): Rendered {
  const s = solve(params)
  const { ask, view, layer } = params
  const topNote_en = ' In the top view the bottom edge of the picture is the front.'
  const topNote_id = ' Pada tampak atas, sisi bawah gambar adalah bagian depan.'

  let body_en: string
  let body_id: string
  let choices: WmiChoice[] | null = null

  if (ask === 'which-view') {
    body_en =
      `A solid is built from ${plural(s.total, 'unit cube', 'unit cubes')}. Every stack sits on the floor with no gaps.` +
      `${view === 'top' ? topNote_en : ''} ` +
      `Find: Which picture shows the solid seen from the ${VIEW_WORD_EN[view]}?`
    body_id =
      `Sebuah bangun disusun dari ${s.total} kubus satuan. Setiap tumpukan berdiri dari lantai tanpa rongga.` +
      `${view === 'top' ? topNote_id : ''} ` +
      `Cari: Gambar manakah yang menunjukkan bangun itu dilihat dari ${VIEW_WORD_ID[view]}?`
    choices = CHOICE_LABELS.map((label) => ({ label, text: label }))
  } else if (ask === 'cubes-per-layer') {
    body_en =
      `A solid is built from unit cubes. Every stack sits on the floor with no gaps, and the layers are counted from the floor up. ` +
      `Find: How many cubes are in layer ${layer} of the solid?`
    body_id =
      `Sebuah bangun disusun dari kubus satuan. Setiap tumpukan berdiri dari lantai tanpa rongga, dan tingkat dihitung dari lantai ke atas. ` +
      `Cari: Ada berapa kubus di tingkat ke-${layer} bangun itu?`
  } else {
    body_en =
      `The picture is the top view of a solid built from cubes, and the bottom edge of the picture is the front. ` +
      `The number in each square tells how many cubes are stacked on that square. ` +
      `Find: How many cubes are there altogether?`
    body_id =
      `Gambar itu adalah tampak atas sebuah bangun dari kubus, dan sisi bawah gambar adalah bagian depan. ` +
      `Angka di setiap kotak memberi tahu berapa kubus ditumpuk di kotak itu. ` +
      `Cari: Ada berapa kubus seluruhnya?`
  }

  const steps_en =
    ask === 'which-view'
      ? whichViewSteps(params, s, 'en')
      : ask === 'cubes-per-layer'
        ? layerSteps(params, s, 'en')
        : countSteps(s, 'en')
  const steps_id =
    ask === 'which-view'
      ? whichViewSteps(params, s, 'id')
      : ask === 'cubes-per-layer'
        ? layerSteps(params, s, 'id')
        : countSteps(s, 'id')

  const hint_en =
    ask === 'which-view'
      ? `A flat view is a shadow, not a count: each column of the picture is as tall as the TALLEST stack lined up behind it.`
      : ask === 'cubes-per-layer'
        ? `Every stack is solid down to the floor, so a stack lands in layer ${layer} exactly when it is at least ${layer} cubes tall.`
        : `The numbers are cubes, the squares are only floor. Add the numbers row by row.`
  const hint_id =
    ask === 'which-view'
      ? `Gambar datar itu bayangan, bukan hitungan: tiap kolom gambar setinggi tumpukan PALING TINGGI yang berjajar di belakangnya.`
      : ask === 'cubes-per-layer'
        ? `Setiap tumpukan padat sampai ke lantai, jadi sebuah tumpukan mengisi tingkat ke-${layer} tepat kalau tingginya paling sedikit ${layer} kubus.`
        : `Angkanya kubus, kotaknya hanya lantai. Jumlahkan angkanya baris demi baris.`

  return {
    body_en,
    body_id,
    answer_type: ask === 'which-view' ? 'multiple_choice' : 'fill_in',
    choices_en: choices,
    choices_id: choices,
    answer: s.answer,
    hint_en,
    hint_id,
    hint_steps_en: steps_en,
    hint_steps_id: steps_id,
    breakdown: buildViewsOfSolidBreakdown(params),
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
