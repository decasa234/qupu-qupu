import { z } from 'zod'
import type { ConceptLogic, Rendered, Rng } from '../types.js'
import { buildRectangleAreaDecomposeBreakdown } from './breakdown.js'

// A big rectangle sliced into smaller rectangles. Only SOME pieces print their
// area and only SOME edge parts print their length; one value is missing.
//
// The single fact this concept lives or dies on: neighbouring pieces SHARE their
// cuts, so a length learned anywhere on the picture is the same length
// everywhere that cut reaches. That turns two moves into a chain:
//   • area ÷ a side you already know  → the other side of that piece
//   • a printed edge length − the parts of it you already know → the last part
// Each move hands the next one the number it was missing, and the picture
// unzips. Nothing is ever guessed and nothing is ever announced.
//
// So the generator may never emit a figure that merely *has* a nice answer; it
// must emit one whose answer is FORCED by the printed numbers, and forced in at
// least two moves (one move is not a puzzle). `solve` below replays the two
// rules and reports which values it could pin down; `paramsSchema` refuses any
// params whose target it could not reach, or reached too easily, and
// `index.test.ts` re-checks uniqueness by brute force over every consistent
// assignment of side lengths — the independent oracle.
//
// Every printed number is load-bearing: `generate` prunes each label that the
// answer does not need, so there are no decoys on the page.
export const ASKS = ['area', 'side'] as const
export type Ask = (typeof ASKS)[number]

export const TARGET_SIDES = ['width', 'height', 'none'] as const
export type TargetSide = (typeof TARGET_SIDES)[number]

export const LAYOUTS = ['strip-3', 'tee-3', 'quad-4', 'ell-4', 'nested-6', 'pinwheel-5'] as const
export type Layout = (typeof LAYOUTS)[number]

/** Piece names in reading order. Shared verbatim with the figure and animation. */
export const NAMES = ['A', 'B', 'C', 'D', 'E', 'F'] as const

/** One sub-rectangle, as an INCLUSIVE span of grid columns and rows. */
export interface Piece {
  r0: number
  c0: number
  r1: number
  c1: number
}

/** A printed edge length: an inclusive span of columns (`w`) or rows (`h`). */
export interface SideLabel {
  axis: 'w' | 'h'
  from: number
  to: number
}

interface LayoutDef {
  rows: number
  cols: number
  /** Reading order: sorted by r0 then c0, so `NAMES[i]` names `pieces[i]`. */
  pieces: readonly Piece[]
}

/**
 * The cut patterns. Each one exactly tiles its rows × cols grid, and — checked
 * in the test — each column has some piece occupying exactly that column and
 * each row has some piece occupying exactly that row, which is what keeps the
 * figure's edge rails meaningful.
 */
export const LAYOUT_DEFS: Record<Layout, LayoutDef> = {
  'strip-3': {
    rows: 1,
    cols: 3,
    pieces: [
      { r0: 0, c0: 0, r1: 0, c1: 0 },
      { r0: 0, c0: 1, r1: 0, c1: 1 },
      { r0: 0, c0: 2, r1: 0, c1: 2 },
    ],
  },
  'tee-3': {
    rows: 2,
    cols: 2,
    pieces: [
      { r0: 0, c0: 0, r1: 0, c1: 1 },
      { r0: 1, c0: 0, r1: 1, c1: 0 },
      { r0: 1, c0: 1, r1: 1, c1: 1 },
    ],
  },
  'quad-4': {
    rows: 2,
    cols: 2,
    pieces: [
      { r0: 0, c0: 0, r1: 0, c1: 0 },
      { r0: 0, c0: 1, r1: 0, c1: 1 },
      { r0: 1, c0: 0, r1: 1, c1: 0 },
      { r0: 1, c0: 1, r1: 1, c1: 1 },
    ],
  },
  'ell-4': {
    rows: 2,
    cols: 3,
    pieces: [
      { r0: 0, c0: 0, r1: 1, c1: 0 },
      { r0: 0, c0: 1, r1: 0, c1: 2 },
      { r0: 1, c0: 1, r1: 1, c1: 1 },
      { r0: 1, c0: 2, r1: 1, c1: 2 },
    ],
  },
  'nested-6': {
    rows: 2,
    cols: 3,
    pieces: [
      { r0: 0, c0: 0, r1: 0, c1: 0 },
      { r0: 0, c0: 1, r1: 0, c1: 1 },
      { r0: 0, c0: 2, r1: 0, c1: 2 },
      { r0: 1, c0: 0, r1: 1, c1: 0 },
      { r0: 1, c0: 1, r1: 1, c1: 1 },
      { r0: 1, c0: 2, r1: 1, c1: 2 },
    ],
  },
  'pinwheel-5': {
    rows: 3,
    cols: 3,
    pieces: [
      { r0: 0, c0: 0, r1: 0, c1: 1 },
      { r0: 0, c0: 2, r1: 1, c1: 2 },
      { r0: 1, c0: 0, r1: 2, c1: 0 },
      { r0: 1, c0: 1, r1: 1, c1: 1 },
      { r0: 2, c0: 1, r1: 2, c1: 2 },
    ],
  },
}

const pieceSchema = z.object({
  r0: z.number().int().min(0).max(2),
  c0: z.number().int().min(0).max(2),
  r1: z.number().int().min(0).max(2),
  c1: z.number().int().min(0).max(2),
})

const sideLabelSchema = z.object({
  axis: z.enum(['w', 'h']),
  from: z.number().int().min(0).max(2),
  to: z.number().int().min(0).max(2),
})

const paramsSchema = z
  .object({
    layout: z.enum(LAYOUTS),
    rows: z.number().int().min(1).max(3),
    cols: z.number().int().min(1).max(3),
    /** TRUE width of each column, left to right. Printed only where labelled. */
    widths: z.array(z.number().int().min(1).max(20)),
    /** TRUE height of each row, top to bottom. */
    heights: z.array(z.number().int().min(1).max(20)),
    /** The cut pattern, in reading order. `NAMES[i]` names `pieces[i]`. */
    pieces: z.array(pieceSchema).min(3).max(6),
    /** Whether piece i prints its area inside itself. */
    areaShown: z.array(z.boolean()),
    /** Which edge lengths the paper prints. */
    sideLabels: z.array(sideLabelSchema).max(8),
    ask: z.enum(ASKS),
    /** Index into `pieces`. */
    target: z.number().int().min(0).max(5),
    /** Which side of the target is asked for; `'none'` when the ask is an area. */
    targetSide: z.enum(TARGET_SIDES),
  })
  .refine((v) => v.widths.length === v.cols && v.heights.length === v.rows, {
    message: 'one width per column and one height per row',
  })
  .refine(
    (v) =>
      v.rows === LAYOUT_DEFS[v.layout].rows &&
      v.cols === LAYOUT_DEFS[v.layout].cols &&
      v.pieces.length === LAYOUT_DEFS[v.layout].pieces.length,
    { message: 'the grid shape and piece count must match the named layout' },
  )
  .refine(
    (v) =>
      v.pieces.every(
        (q) => q.r0 <= q.r1 && q.c0 <= q.c1 && q.r1 < v.rows && q.c1 < v.cols && q.r0 >= 0 && q.c0 >= 0,
      ),
    { message: 'every piece must be a rectangle inside the grid' },
  )
  // THE geometry promise: the pieces are a jigsaw of the whole rectangle, with
  // no overlap and no gap. Everything the concept says about shared sides is
  // only true because of this.
  .refine((v) => tilesExactly(v.pieces, v.rows, v.cols), {
    message: 'the pieces must tile the whole rectangle exactly once',
  })
  .refine(
    (v) =>
      v.pieces.every(
        (q, i) => i === 0 || q.r0 > v.pieces[i - 1].r0 || (q.r0 === v.pieces[i - 1].r0 && q.c0 > v.pieces[i - 1].c0),
      ),
    { message: 'pieces must be stored in reading order so NAMES[i] names pieces[i]' },
  )
  .refine((v) => v.areaShown.length === v.pieces.length, { message: 'one area flag per piece' })
  .refine(
    (v) =>
      v.sideLabels.every(
        (l) => l.from <= l.to && l.to < (l.axis === 'w' ? v.cols : v.rows),
      ) &&
      new Set(v.sideLabels.map((l) => `${l.axis}${l.from}-${l.to}`)).size === v.sideLabels.length,
    { message: 'edge labels must be distinct spans inside the rectangle' },
  )
  .refine((v) => v.target < v.pieces.length, { message: 'the target must be one of the pieces' })
  .refine((v) => (v.ask === 'area' ? v.targetSide === 'none' && !v.areaShown[v.target] : v.targetSide !== 'none'), {
    message: 'an area ask hides the target area; a side ask names which side',
  })
  .refine(
    (v) =>
      v.ask === 'area' ||
      !v.sideLabels.some((l) =>
        v.targetSide === 'width'
          ? l.axis === 'w' && l.from === v.pieces[v.target].c0 && l.to === v.pieces[v.target].c1
          : l.axis === 'h' && l.from === v.pieces[v.target].r0 && l.to === v.pieces[v.target].r1,
      ),
    { message: 'the length the question asks for must not also be printed' },
  )
  // THE load-bearing rule. Everything above is shape; this is the promise that
  // the missing value is pinned down by the printed numbers alone, and that
  // reaching it takes real work rather than one glance.
  .refine((v) => !structurallySound(v) || solve(v).forced, {
    message: 'the printed numbers must force the answer',
  })
  .refine((v) => !structurallySound(v) || solve(v).neededSteps.length >= 2, {
    message: 'the answer must need at least two deductions',
  })
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'rectangle-area-decompose',
  name_en: 'Missing area in a rectangle jigsaw',
  name_id: 'Cari luas yang hilang dari potongan persegi panjang',
  grades: [3] as const,
  description_id:
    'Sebuah persegi panjang dipotong menjadi beberapa persegi panjang kecil. Hanya sebagian luas dan sebagian panjang sisi yang tercetak; anak mengejar sisi yang dipakai bersama untuk menemukan luas atau panjang yang hilang.',
} as const

/** True when the pieces cover every grid cell exactly once. */
export function tilesExactly(pieces: readonly Piece[], rows: number, cols: number): boolean {
  const seen = Array.from({ length: rows }, () => new Array<number>(cols).fill(0))
  for (const q of pieces) {
    if (q.r0 > q.r1 || q.c0 > q.c1) return false
    if (q.r0 < 0 || q.c0 < 0 || q.r1 >= rows || q.c1 >= cols) return false
    for (let r = q.r0; r <= q.r1; r++) for (let c = q.c0; c <= q.c1; c++) seen[r][c] += 1
  }
  return seen.every((row) => row.every((n) => n === 1))
}

// ── The forcing solver ───────────────────────────────────────────────────────

/**
 * The minimum shape `solve` needs. Declared structurally rather than as
 * `Params`, because a schema refinement calls `solve()`: taking `Params` there
 * would make `Params = z.infer<typeof paramsSchema>` reference itself. Same
 * trick `row-column-sum-grid` uses for its `SolvableGrid`.
 */
export interface SolvableRect {
  rows: number
  cols: number
  widths: number[]
  heights: number[]
  pieces: Piece[]
  areaShown: boolean[]
  sideLabels: SideLabel[]
  ask: Ask
  target: number
  targetSide: TargetSide
}

/** One move of the chain: a column width or a row height becomes known. */
export interface DeriveStep {
  /** `'segment'` = a printed edge length minus its known parts.
   *  `'area'`    = a printed area ÷ the piece's already-known other side. */
  rule: 'segment' | 'area'
  /** Which track the move pins down: `'w'` a column width, `'h'` a row height. */
  axis: 'w' | 'h'
  index: number
  value: number
  /** The span the move resolves, inclusive. */
  from: number
  to: number
  /** Total across that span — the printed length, or area ÷ the known side. */
  spanTotal: number
  /** The already-known parts of that span, excluding the one being pinned. */
  parts: { index: number; value: number }[]
  /** `'area'` only: the piece, its printed area, and its known other side. */
  pieceIndex: number
  area: number
  otherLen: number
  otherParts: { index: number; value: number }[]
}

export interface Solution {
  /** The chain, in the order a child can actually walk it. */
  steps: DeriveStep[]
  /** The sub-chain the answer leans on. Equal to `steps` for generated params. */
  neededSteps: DeriveStep[]
  /** `"w0"` / `"h2"` keys of every value the answer leans on, givens included. */
  neededKeys: string[]
  /** Column widths / row heights as far as the printed numbers pin them down. */
  knownWidths: (number | null)[]
  knownHeights: (number | null)[]
  /** True when the printed numbers pin down every value the answer needs. */
  forced: boolean
  /** True width and height of the target piece. */
  targetWidth: number
  targetHeight: number
  answer: string
}

function structurallySound(v: SolvableRect): boolean {
  if (v.rows < 1 || v.cols < 1) return false
  if (v.widths.length !== v.cols || v.heights.length !== v.rows) return false
  if (v.widths.some((x) => !Number.isFinite(x) || x <= 0)) return false
  if (v.heights.some((x) => !Number.isFinite(x) || x <= 0)) return false
  if (v.pieces.length === 0 || v.areaShown.length !== v.pieces.length) return false
  if (v.target < 0 || v.target >= v.pieces.length) return false
  if (
    v.pieces.some(
      (q) => q.r0 > q.r1 || q.c0 > q.c1 || q.r0 < 0 || q.c0 < 0 || q.r1 >= v.rows || q.c1 >= v.cols,
    )
  ) {
    return false
  }
  return v.sideLabels.every((l) => l.from >= 0 && l.from <= l.to && l.to < (l.axis === 'w' ? v.cols : v.rows))
}

const varKey = (axis: 'w' | 'h', index: number): string => `${axis}${index}`

export function solve(p: SolvableRect): Solution {
  const known: Record<'w' | 'h', (number | null)[]> = {
    w: new Array<number | null>(p.cols).fill(null),
    h: new Array<number | null>(p.rows).fill(null),
  }
  const truth: Record<'w' | 'h', number[]> = { w: p.widths, h: p.heights }
  const spanSum = (axis: 'w' | 'h', from: number, to: number): number => {
    let total = 0
    for (let i = from; i <= to; i++) total += truth[axis][i]
    return total
  }
  // Two independent sources for every number: the printed labels the move
  // spends, and the true lengths the figure was built from. If they ever
  // disagree the concept is broken, and failing loudly beats narrating a
  // subtraction that lands somewhere other than the answer.
  const check = (axis: 'w' | 'h', index: number, value: number): void => {
    if (value !== truth[axis][index]) {
      throw new Error(
        `rectangle-area-decompose: a printed label forces ${axis}${index} = ${value} but the figure holds ${truth[axis][index]}`,
      )
    }
  }

  // A label printed on a single part is a given, not a deduction.
  for (const l of p.sideLabels) {
    if (l.from !== l.to) continue
    known[l.axis][l.from] = truth[l.axis][l.from]
  }

  const steps: DeriveStep[] = []

  /** A printed edge length whose span has exactly one part still unknown. */
  const trySegment = (l: SideLabel): DeriveStep | null => {
    if (l.from === l.to) return null
    const parts: { index: number; value: number }[] = []
    let blank = -1
    for (let i = l.from; i <= l.to; i++) {
      const at = known[l.axis][i]
      if (at === null) {
        if (blank >= 0) return null
        blank = i
      } else {
        parts.push({ index: i, value: at })
      }
    }
    if (blank < 0) return null
    const spanTotal = spanSum(l.axis, l.from, l.to)
    const value = parts.reduce((rest, k) => rest - k.value, spanTotal)
    check(l.axis, blank, value)
    return {
      rule: 'segment',
      axis: l.axis,
      index: blank,
      value,
      from: l.from,
      to: l.to,
      spanTotal,
      parts,
      pieceIndex: -1,
      area: 0,
      otherLen: 0,
      otherParts: [],
    }
  }

  /**
   * A printed area whose OTHER side is fully known: divide to get this side's
   * total, then subtract the parts of it you already have.
   */
  const tryArea = (i: number, axis: 'w' | 'h'): DeriveStep | null => {
    const q = p.pieces[i]
    const other: 'w' | 'h' = axis === 'w' ? 'h' : 'w'
    const from = axis === 'w' ? q.c0 : q.r0
    const to = axis === 'w' ? q.c1 : q.r1
    const ofrom = other === 'w' ? q.c0 : q.r0
    const oto = other === 'w' ? q.c1 : q.r1

    const otherParts: { index: number; value: number }[] = []
    for (let k = ofrom; k <= oto; k++) {
      const at = known[other][k]
      if (at === null) return null
      otherParts.push({ index: k, value: at })
    }
    const otherLen = otherParts.reduce((sum, k) => sum + k.value, 0)
    if (otherLen <= 0) return null

    const parts: { index: number; value: number }[] = []
    let blank = -1
    for (let k = from; k <= to; k++) {
      const at = known[axis][k]
      if (at === null) {
        if (blank >= 0) return null
        blank = k
      } else {
        parts.push({ index: k, value: at })
      }
    }
    if (blank < 0) return null

    const area = spanSum('w', q.c0, q.c1) * spanSum('h', q.r0, q.r1)
    if (area % otherLen !== 0) return null
    const spanTotal = area / otherLen
    const value = parts.reduce((rest, k) => rest - k.value, spanTotal)
    check(axis, blank, value)
    return {
      rule: 'area',
      axis,
      index: blank,
      value,
      from,
      to,
      spanTotal,
      parts,
      pieceIndex: i,
      area,
      otherLen,
      otherParts,
    }
  }

  let progressed = true
  while (progressed) {
    progressed = false
    let move: DeriveStep | null = null
    for (const l of p.sideLabels) {
      move = trySegment(l)
      if (move) break
    }
    if (!move) {
      for (let i = 0; i < p.pieces.length && !move; i++) {
        if (!p.areaShown[i]) continue
        move = tryArea(i, 'h') ?? tryArea(i, 'w')
      }
    }
    if (!move) break
    known[move.axis][move.index] = move.value
    steps.push(move)
    progressed = true
  }

  // What the question actually leans on.
  const t = p.pieces[p.target] ?? { r0: 0, c0: 0, r1: 0, c1: 0 }
  const targetVars: { axis: 'w' | 'h'; index: number }[] = []
  if (p.ask === 'area' || p.targetSide === 'width') {
    for (let c = t.c0; c <= t.c1; c++) targetVars.push({ axis: 'w', index: c })
  }
  if (p.ask === 'area' || p.targetSide === 'height') {
    for (let r = t.r0; r <= t.r1; r++) targetVars.push({ axis: 'h', index: r })
  }
  const forced = targetVars.every((v) => known[v.axis][v.index] !== null)

  // Walk the chain backwards: a move matters if the answer needs it, and a move
  // the answer needs drags in whichever earlier values it leaned on.
  const need = new Set(targetVars.map((v) => varKey(v.axis, v.index)))
  for (let i = steps.length - 1; i >= 0; i--) {
    const st = steps[i]
    if (!need.has(varKey(st.axis, st.index))) continue
    for (const part of st.parts) need.add(varKey(st.axis, part.index))
    const other: 'w' | 'h' = st.axis === 'w' ? 'h' : 'w'
    for (const part of st.otherParts) need.add(varKey(other, part.index))
  }
  const neededSteps = steps.filter((st) => need.has(varKey(st.axis, st.index)))

  const targetWidth = spanSum('w', t.c0, t.c1)
  const targetHeight = spanSum('h', t.r0, t.r1)
  const answer =
    p.ask === 'area'
      ? String(targetWidth * targetHeight)
      : p.targetSide === 'width'
        ? String(targetWidth)
        : String(targetHeight)

  return {
    steps,
    neededSteps,
    neededKeys: [...need],
    knownWidths: known.w,
    knownHeights: known.h,
    forced,
    targetWidth,
    targetHeight,
    answer,
  }
}

/**
 * Adding the two sides instead of multiplying them — the one genuinely tempting
 * wrong answer this concept has, and the standard grade-3 area/perimeter slip.
 * `null` for the side ask (no such confusion) and for a 2-by-2 target, where
 * adding and multiplying agree.
 */
export function trapAnswer(p: SolvableRect, s: Solution): string | null {
  if (p.ask !== 'area') return null
  const sum = s.targetWidth + s.targetHeight
  return String(sum) === s.answer ? null : String(sum)
}

// ── Generation ───────────────────────────────────────────────────────────────

const LAYOUT_NAMES = LAYOUTS

function build(
  layout: Layout,
  widths: number[],
  heights: number[],
  areaShown: boolean[],
  sideLabels: SideLabel[],
  ask: Ask,
  target: number,
  targetSide: TargetSide,
): Params {
  const def = LAYOUT_DEFS[layout]
  return {
    layout,
    rows: def.rows,
    cols: def.cols,
    widths,
    heights,
    pieces: def.pieces.map((q) => ({ ...q })),
    areaShown,
    sideLabels,
    ask,
    target,
    targetSide,
  }
}

/**
 * Draws a figure, prints EVERYTHING, then removes every label the answer can do
 * without. Starting from the full superset guarantees the answer is forced to
 * begin with; greedy removal (in a shuffled order, so the surviving sets vary)
 * leaves a set in which each remaining number is necessary — no decoys, and the
 * child has to chase the chain rather than read a value off.
 */
function draft(rng: Rng): Params {
  const layout = rng.pick(LAYOUT_NAMES)
  const def = LAYOUT_DEFS[layout]
  // 2..8 keeps every printed area under 130 and every division under 17 — the
  // arithmetic a grade-3 olympiad question can fairly ask for.
  const widths = Array.from({ length: def.cols }, () => rng.int(2, 8))
  const heights = Array.from({ length: def.rows }, () => rng.int(2, 8))

  const ask = rng.pick(ASKS)
  const target = rng.int(0, def.pieces.length - 1)
  const targetSide: TargetSide = ask === 'side' ? (rng.int(0, 1) === 0 ? 'width' : 'height') : 'none'
  const t = def.pieces[target]

  const areaMask = def.pieces.map((_, i) => !(ask === 'area' && i === target))

  const pool: SideLabel[] = []
  for (let c = 0; c < def.cols; c++) pool.push({ axis: 'w', from: c, to: c })
  if (def.cols > 1) pool.push({ axis: 'w', from: 0, to: def.cols - 1 })
  for (let r = 0; r < def.rows; r++) pool.push({ axis: 'h', from: r, to: r })
  if (def.rows > 1) pool.push({ axis: 'h', from: 0, to: def.rows - 1 })
  // Never print the very length the question asks for.
  const banned: SideLabel | null =
    ask === 'side'
      ? targetSide === 'width'
        ? { axis: 'w', from: t.c0, to: t.c1 }
        : { axis: 'h', from: t.r0, to: t.r1 }
      : null
  const candidates = pool.filter(
    (l) => !(banned !== null && l.axis === banned.axis && l.from === banned.from && l.to === banned.to),
  )
  const sideMask = candidates.map(() => true)

  const shape = (): Params =>
    build(
      layout,
      widths,
      heights,
      [...areaMask],
      candidates.filter((_, i) => sideMask[i]),
      ask,
      target,
      targetSide,
    )

  const removals: { kind: 'area' | 'side'; at: number }[] = []
  areaMask.forEach((on, i) => {
    if (on) removals.push({ kind: 'area', at: i })
  })
  candidates.forEach((_, i) => removals.push({ kind: 'side', at: i }))

  for (const rem of rng.shuffle(removals)) {
    if (rem.kind === 'area') areaMask[rem.at] = false
    else sideMask[rem.at] = false
    if (!solve(shape()).forced) {
      if (rem.kind === 'area') areaMask[rem.at] = true
      else sideMask[rem.at] = true
    }
  }

  return shape()
}

/**
 * Quality filter, not a correctness rule — `paramsSchema` already refuses the
 * figures whose answer is not forced or falls out in one move. This rejects the
 * ones that are technically fine but pedagogically bad.
 */
function isWorthAsking(p: Params): boolean {
  const s = solve(p)
  if (!s.forced) return false
  // One move is a reading exercise, not a puzzle.
  if (s.neededSteps.length < 2) return false
  // No decoys. Every printed number must be one the answer actually spends,
  // or it sits on the figure unexplained and the child reads past it.
  for (let i = 0; i < p.areaShown.length; i++) {
    if (p.areaShown[i] && !s.neededSteps.some((st) => st.pieceIndex === i)) return false
  }
  for (const l of p.sideLabels) {
    if (l.from === l.to) {
      if (!s.neededKeys.includes(varKey(l.axis, l.from))) return false
    } else if (
      !s.neededSteps.some((st) => st.rule === 'segment' && st.axis === l.axis && st.from === l.from && st.to === l.to)
    ) {
      return false
    }
  }
  // Grade-3 sized arithmetic all the way through.
  if (Number(s.answer) > 200) return false
  return s.neededSteps.every((st) => st.spanTotal <= 200 && st.value >= 1)
}

export function generate(rng: Rng): Params {
  let first: Params | null = null
  for (let attempt = 0; attempt < 200; attempt++) {
    const candidate = draft(rng)
    const s = solve(candidate)
    if (!s.forced || s.neededSteps.length < 2) continue
    if (first === null) first = candidate
    if (isWorthAsking(candidate)) return candidate
  }
  if (first !== null) return first
  // Every draft missed (vanishingly unlikely). Fall back to a figure that is
  // forced by construction: A's area and the first top part give the first left
  // part, B's area then gives the second top part, C's area the second left
  // part, and D is what is left over.
  return build(
    'quad-4',
    [3, 5],
    [4, 6],
    [true, true, true, false],
    [{ axis: 'w', from: 0, to: 0 }],
    'area',
    3,
    'none',
  )
}

// ── Rendering ────────────────────────────────────────────────────────────────

/** "A", "A and B", "A, B and C" — an English list. */
export function listEn(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

/** "A", "A dan B", "A, B, dan C". */
export function listId(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  if (items.length === 2) return `${items[0]} dan ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, dan ${items[items.length - 1]}`
}

const COUNT_EN = ['', 'one', 'two', 'three', 'four', 'five', 'six'] as const
const COUNT_ID = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam'] as const
const ORD_EN = ['first', 'second', 'third'] as const
const ORD_ID = ['pertama', 'kedua', 'ketiga'] as const

/**
 * What a child calls one column width or one row height. The figure draws a
 * tick rail above the rectangle and another down its left side, so "the second
 * part of the top edge" is a thing that can be pointed at even when its length
 * is not printed. Exported so the animation names the same pieces the same way.
 */
export function partName(axis: 'w' | 'h', index: number, count: number, lang: 'en' | 'id'): string {
  if (count <= 1) {
    if (axis === 'w') return lang === 'id' ? 'sisi atas' : 'the top edge'
    return lang === 'id' ? 'sisi kiri' : 'the left edge'
  }
  if (axis === 'w') {
    return lang === 'id' ? `bagian ${ORD_ID[index]} sisi atas` : `the ${ORD_EN[index]} part of the top edge`
  }
  return lang === 'id' ? `bagian ${ORD_ID[index]} sisi kiri` : `the ${ORD_EN[index]} part of the left edge`
}

/** The same, for a run of parts — including the whole edge. */
export function spanName(
  axis: 'w' | 'h',
  from: number,
  to: number,
  count: number,
  lang: 'en' | 'id',
): string {
  if (from === to) return partName(axis, from, count, lang)
  if (from === 0 && to === count - 1) {
    if (axis === 'w') {
      return lang === 'id' ? 'seluruh lebar persegi panjang besar' : 'the whole width of the big rectangle'
    }
    return lang === 'id' ? 'seluruh tinggi persegi panjang besar' : 'the whole height of the big rectangle'
  }
  const names: string[] = []
  for (let i = from; i <= to; i++) names.push(partName(axis, i, count, lang))
  return lang === 'id' ? listId(names) : listEn(names)
}

/** The question sentence, ending in "?". Exported so the breakdown can quote it. */
export function askClause(ask: Ask, targetSide: TargetSide, name: string, lang: 'en' | 'id'): string {
  if (ask === 'area') {
    return lang === 'id' ? `Berapa luas ${name} dalam cm²?` : `What is the area of ${name}, in cm²?`
  }
  if (targetSide === 'width') {
    return lang === 'id' ? `Berapa lebar ${name} dalam cm?` : `How wide is ${name}, in cm?`
  }
  return lang === 'id' ? `Berapa tinggi ${name} dalam cm?` : `How tall is ${name}, in cm?`
}

/**
 * How a side is built out of edge parts: just the part's name when the side is
 * one part, and the parts plus their sum when it spans several. The caller
 * always appends `= <length> cm`, so this never repeats the unit.
 */
function sideDetail(p: Params, axis: 'w' | 'h', from: number, to: number, lang: 'en' | 'id'): string {
  const count = axis === 'w' ? p.cols : p.rows
  const track = axis === 'w' ? p.widths : p.heights
  if (from === to) return partName(axis, from, count, lang)
  const names: string[] = []
  const values: number[] = []
  for (let i = from; i <= to; i++) {
    names.push(partName(axis, i, count, lang))
    values.push(track[i])
  }
  const joined = lang === 'id' ? listId(names) : listEn(names)
  return `${joined} = ${values.join(' + ')}`
}

/** One line of the chain, spelled out so the number is derived and not asserted. */
function stepLine(p: Params, st: DeriveStep, lang: 'en' | 'id'): string {
  const count = st.axis === 'w' ? p.cols : p.rows
  const mine = partName(st.axis, st.index, count, lang)

  if (st.rule === 'segment') {
    const whole = spanName(st.axis, st.from, st.to, count, lang)
    const pieces: string[] = []
    for (let i = st.from; i <= st.to; i++) pieces.push(partName(st.axis, i, count, lang))
    const listing = lang === 'id' ? listId(pieces) : listEn(pieces)
    const knownList = st.parts.map((k) => `${partName(st.axis, k.index, count, lang)} = ${k.value} cm`)
    const knownJoined = lang === 'id' ? listId(knownList) : listEn(knownList)
    const subtraction = `${st.spanTotal} − ${st.parts.map((k) => k.value).join(' − ')} = ${st.value}`
    if (lang === 'id') {
      return `${cap(whole)} tertulis ${st.spanTotal} cm, dan panjang itu tersusun dari ${listing}. Kita sudah punya ${knownJoined}, jadi ${mine} = ${subtraction} cm.`
    }
    return `${cap(whole)} is printed as ${st.spanTotal} cm, and that length is made of ${listing}. We already have ${knownJoined}, so ${mine} = ${subtraction} cm.`
  }

  const other: 'w' | 'h' = st.axis === 'w' ? 'h' : 'w'
  const name = NAMES[st.pieceIndex] ?? '?'
  const q = p.pieces[st.pieceIndex]
  const ofrom = other === 'w' ? q.c0 : q.r0
  const oto = other === 'w' ? q.c1 : q.r1
  const detail = sideDetail(p, other, ofrom, oto, lang)
  const acrossNames: string[] = []
  for (let i = st.from; i <= st.to; i++) acrossNames.push(partName(st.axis, i, count, lang))
  const across = lang === 'id' ? listId(acrossNames) : listEn(acrossNames)
  const knownList = st.parts.map((k) => `${partName(st.axis, k.index, count, lang)} = ${k.value} cm`)
  const knownJoined = lang === 'id' ? listId(knownList) : listEn(knownList)

  if (lang === 'id') {
    const sisiTahu = other === 'w' ? 'lebar' : 'tinggi'
    const sisiCari = st.axis === 'w' ? 'lebar' : 'tinggi'
    const head = `${name} mencetak luasnya, ${st.area} cm², dan ${sisiTahu} ${name} sudah kita tahu: ${detail} = ${st.otherLen} cm.`
    const divide = `Luas = lebar × tinggi, jadi ${sisiCari} ${name} = ${st.area} ÷ ${st.otherLen} = ${st.spanTotal} cm.`
    if (st.parts.length === 0) return `${head} ${divide} Sisi itu tepat ${mine}, jadi ${mine} = ${st.value} cm.`
    return `${head} ${divide} ${cap(sisiCari)} itu tersusun dari ${across}, dan ${knownJoined}, jadi ${mine} = ${st.spanTotal} − ${st.parts.map((k) => k.value).join(' − ')} = ${st.value} cm.`
  }
  const knownWord = other === 'w' ? 'wide' : 'tall'
  const wantedWord = st.axis === 'w' ? 'wide' : 'tall'
  const head = `${name} prints its area, ${st.area} cm², and we already know how ${knownWord} ${name} is: ${detail} = ${st.otherLen} cm.`
  const divide = `Area = width × height, so ${name} is ${st.area} ÷ ${st.otherLen} = ${st.spanTotal} cm ${wantedWord}.`
  if (st.parts.length === 0) return `${head} ${divide} That side is exactly ${mine}, so ${mine} = ${st.value} cm.`
  return `${head} ${divide} That side is made of ${across}, and ${knownJoined}, so ${mine} = ${st.spanTotal} − ${st.parts.map((k) => k.value).join(' − ')} = ${st.value} cm.`
}

const cap = (s: string): string => (s.length === 0 ? s : `${s.charAt(0).toUpperCase()}${s.slice(1)}`)

export function render(params: Params): Rendered {
  const s = solve(params)
  const breakdown = buildRectangleAreaDecomposeBreakdown(params)
  const n = params.pieces.length
  const names = params.pieces.map((_, i) => NAMES[i])
  const targetName = NAMES[params.target]
  const ask_en = askClause(params.ask, params.targetSide, targetName, 'en')
  const ask_id = askClause(params.ask, params.targetSide, targetName, 'id')

  // The `Find:` / `Cari:` markers are stripped before display; every breakdown
  // phrase is built against the stripped text, never across the marker.
  const body_en = [
    `A big rectangle is cut into ${COUNT_EN[n]} smaller rectangles: ${listEn(names)}.`,
    `The pieces fit together with no gaps, so the sides they share have the same length.`,
    `Some areas are printed inside the pieces and some side lengths are printed along the edges; lengths are in cm and areas in cm².`,
    `The drawing is not to scale.`,
    `Find: ${ask_en}`,
  ].join(' ')
  const body_id = [
    `Sebuah persegi panjang besar dipotong menjadi ${COUNT_ID[n]} persegi panjang kecil: ${listId(names)}.`,
    `Potongan-potongan itu pas tanpa celah, jadi sisi yang mereka pakai bersama sama panjang.`,
    `Beberapa luas tercetak di dalam potongan dan beberapa panjang sisi tercetak di tepinya; panjang dalam cm dan luas dalam cm².`,
    `Gambar tidak sesuai skala.`,
    `Cari: ${ask_id}`,
  ].join(' ')

  // ── hint_steps: the chain, applied to THIS figure, one move at a time. Every
  // move names the number it spends and why that number is usable now, so the
  // value is deduced rather than announced.
  const steps_en: string[] = [
    `Two moves crack this kind of picture. If a piece prints its area and you already know one of its sides, divide: area ÷ that side gives the other side. If an edge length is printed and you know all but one of the parts along it, subtract to get the last part. Neighbouring pieces share their cuts, so a length learned in one place is the same length everywhere that cut reaches.`,
  ]
  const steps_id: string[] = [
    `Ada dua langkah untuk gambar seperti ini. Kalau sebuah potongan mencetak luasnya dan salah satu sisinya sudah kita tahu, bagilah: luas ÷ sisi itu memberi sisi yang lain. Kalau panjang sebuah tepi tercetak dan semua bagiannya kecuali satu sudah kita tahu, kurangi untuk mendapat bagian terakhir. Potongan yang bersebelahan memakai garis potong yang sama, jadi panjang yang ditemukan di satu tempat berlaku di sepanjang garis itu.`,
  ]

  for (const st of s.neededSteps) {
    steps_en.push(stepLine(params, st, 'en'))
    steps_id.push(stepLine(params, st, 'id'))
  }

  const t = params.pieces[params.target]
  const wDetail_en = sideDetail(params, 'w', t.c0, t.c1, 'en')
  const wDetail_id = sideDetail(params, 'w', t.c0, t.c1, 'id')
  const hDetail_en = sideDetail(params, 'h', t.r0, t.r1, 'en')
  const hDetail_id = sideDetail(params, 'h', t.r0, t.r1, 'id')

  if (params.ask === 'area') {
    steps_en.push(
      `Now ${targetName} is ${s.targetWidth} cm wide (${wDetail_en}) and ${s.targetHeight} cm tall (${hDetail_en}). Area is width × height, not width + height, so ${targetName} covers ${s.targetWidth} × ${s.targetHeight} = ${s.answer} cm².`,
    )
    steps_id.push(
      `Sekarang ${targetName} lebarnya ${s.targetWidth} cm (${wDetail_id}) dan tingginya ${s.targetHeight} cm (${hDetail_id}). Luas adalah lebar × tinggi, bukan lebar + tinggi, jadi ${targetName} seluas ${s.targetWidth} × ${s.targetHeight} = ${s.answer} cm².`,
    )
  } else if (params.targetSide === 'width') {
    steps_en.push(`${targetName}'s width is ${wDetail_en}, so ${targetName} is ${s.answer} cm wide.`)
    steps_id.push(`Lebar ${targetName} adalah ${wDetail_id}, jadi ${targetName} lebarnya ${s.answer} cm.`)
  } else {
    steps_en.push(`${targetName}'s height is ${hDetail_en}, so ${targetName} is ${s.answer} cm tall.`)
    steps_id.push(`Tinggi ${targetName} adalah ${hDetail_id}, jadi ${targetName} tingginya ${s.answer} cm.`)
  }

  return {
    body_en,
    body_id,
    answer_type: 'fill_in',
    choices_en: null,
    choices_id: null,
    answer: s.answer,
    hint_en:
      'Start where a printed area sits next to a side you already know: divide and that piece hands you its other side. Every cut is shared, so each length you win opens the next piece.',
    hint_id:
      'Mulai dari luas yang tercetak di sebelah sisi yang sudah kamu tahu: bagi, dan potongan itu memberikan sisi satunya. Setiap garis potong dipakai bersama, jadi setiap panjang yang kamu dapat membuka potongan berikutnya.',
    hint_steps_en: steps_en,
    hint_steps_id: steps_id,
    breakdown,
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
