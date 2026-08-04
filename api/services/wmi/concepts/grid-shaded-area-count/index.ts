import { z } from 'zod'
import type { ConceptLogic, Rendered, Rng, WmiChoice } from '../types.js'
import { buildGridShadedAreaCountBreakdown } from './breakdown.js'

// Reading the area of an irregular shaded region straight off grid paper — the
// largest remaining GE-AREA family in the WMI corpus (2019-final-g3 #11,
// 2020-final-g3 #7, 2021-final-g3 #5, 2023-final-g3 #13), plus the "which of
// these shaded shapes is biggest / matches the example" variants that ride on
// exactly the same counting skill.
//
// THE rule this file exists to enforce: the area is COMPUTED from the region's
// vertex list, never authored. `shoelaceTwice()` is the only place an area is
// produced, and `analyseFigure()` re-derives the SAME number a second way — by
// clipping the polygon against every lattice cell and adding the pieces up. The
// schema refuses any figure where those two numbers disagree, so a shape whose
// drawing contradicts its stated answer cannot be stored at all.
//
// Half cells are the whole difficulty, so they are geometry too, not
// bookkeeping: a cell is a half exactly when the polygon clipped to that cell
// has half the cell's area. Every edge is axis-parallel or a true 45° lattice
// diagonal (square) / along one of the three lattice directions (triangle),
// which is what keeps every clip vertex on a lattice point and every cell
// worth exactly 0, ½ or 1 of a unit.

export const LATTICES = ['square', 'triangle'] as const
export type Lattice = (typeof LATTICES)[number]

export const ASKS = ['area', 'which-largest', 'which-equals-example'] as const
export type Ask = (typeof ASKS)[number]

/** cm² carried by one small cell of the grid. */
export const UNIT_VALUES = [1, 5, 6] as const

export const LABELS = ['A', 'B', 'C'] as const

export type Lang = 'en' | 'id'

/**
 * An integer lattice point.
 * - square lattice: `[x, y]` = `[column, row]`, y growing downwards.
 * - triangle lattice: `[a, b]` in the skewed basis `u = (1, 0)`,
 *   `v = (1/2, √3/2)` (b growing downwards on screen).
 */
export type Point = [number, number]

// ── pure geometry — the single source of every area in this file ──────────────

/**
 * Twice the signed area of a closed polygon, by the shoelace formula. Integer
 * in, integer out: no floating point anywhere on the path from a vertex list to
 * an answer.
 */
export function shoelaceTwice(poly: readonly Point[]): number {
  let s = 0
  for (let i = 0; i < poly.length; i++) {
    const [x1, y1] = poly[i]
    const [x2, y2] = poly[(i + 1) % poly.length]
    s += x1 * y2 - x2 * y1
  }
  return s
}

/**
 * |shoelace| of ONE cell of the lattice: a grid square is 2, a small triangle
 * of the skewed basis is 1. Dividing by this turns a shoelace into a count of
 * cells, which is what the child is actually counting.
 */
const CELL_TWICE: Record<Lattice, number> = { square: 2, triangle: 1 }

/**
 * The region's area measured in HALF cells — the unit both the whole cells and
 * the half cells fit into, so `2 × whole + halves` can be compared with it
 * exactly. Read straight off the vertex list.
 */
export function halvesOf(lattice: Lattice, poly: readonly Point[]): number {
  return (Math.abs(shoelaceTwice(poly)) * 2) / CELL_TWICE[lattice]
}

/** Integer division that is exact by construction; see the header note on 45° edges. */
function exactDiv(numerator: number, denominator: number): number {
  return Math.round(numerator / denominator)
}

/** The point where segment p1→p2 crosses the clip line, from the two side values. */
function crossPoint(p1: Point, p2: Point, d1: number, d2: number): Point {
  const den = d1 - d2
  return [
    exactDiv(p1[0] * den + d1 * (p2[0] - p1[0]), den),
    exactDiv(p1[1] * den + d1 * (p2[1] - p1[1]), den),
  ]
}

/**
 * Sutherland–Hodgman clip of `subject` against the convex polygon `clip`.
 * The result may be degenerate for a non-convex subject, but its shoelace area
 * is still exactly the area of the overlap — which is all this is used for.
 */
export function clipToConvex(subject: readonly Point[], clip: readonly Point[]): Point[] {
  const orient = shoelaceTwice(clip) >= 0 ? 1 : -1
  let out: Point[] = subject.map((p) => [p[0], p[1]] as Point)
  for (let e = 0; e < clip.length && out.length > 0; e++) {
    const a = clip[e]
    const b = clip[(e + 1) % clip.length]
    const ex = b[0] - a[0]
    const ey = b[1] - a[1]
    const side = (p: Point): number => orient * (ex * (p[1] - a[1]) - ey * (p[0] - a[0]))
    const input = out
    out = []
    for (let i = 0; i < input.length; i++) {
      const cur = input[i]
      const prev = input[(i + input.length - 1) % input.length]
      const dCur = side(cur)
      const dPrev = side(prev)
      if (dCur >= 0) {
        if (dPrev < 0) out.push(crossPoint(prev, cur, dPrev, dCur))
        out.push(cur)
      } else if (dPrev >= 0) {
        out.push(crossPoint(prev, cur, dPrev, dCur))
      }
    }
  }
  return out
}

export interface LatticeCell {
  /** Corner list of the cell itself. */
  frame: Point[]
  /** Grid row, top first — the order the count walks in. */
  row: number
  /** Position within the row, left first. */
  col: number
  /** Triangle lattice only: true for an apex-up triangle. Always false on squares. */
  up: boolean
}

/** Every cell of the lattice that could possibly meet the polygon's bounding box. */
export function cellsAround(lattice: Lattice, poly: readonly Point[]): LatticeCell[] {
  const xs = poly.map((p) => p[0])
  const ys = poly.map((p) => p[1])
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const out: LatticeCell[] = []
  for (let b = minY; b < maxY; b++) {
    for (let a = minX; a < maxX; a++) {
      if (lattice === 'square') {
        out.push({
          frame: [[a, b], [a + 1, b], [a + 1, b + 1], [a, b + 1]],
          row: b,
          col: a,
          up: false,
        })
        continue
      }
      // Skewed basis: the parallelogram (a,b)…(a+1,b+1) splits into an
      // apex-down triangle on the left and an apex-up triangle on the right.
      out.push({ frame: [[a, b], [a + 1, b], [a, b + 1]], row: b, col: a * 2, up: false })
      out.push({
        frame: [[a + 1, b], [a, b + 1], [a + 1, b + 1]],
        row: b,
        col: a * 2 + 1,
        up: true,
      })
    }
  }
  return out
}

export interface ShadedCell extends LatticeCell {
  /** The shaded piece of this cell — the whole cell, or the half the edge leaves. */
  piece: Point[]
  /** True when the polygon covers exactly half of this cell. */
  half: boolean
}

/** The cells the region actually shades, in reading order (top row first, left first). */
export function shadedCells(lattice: Lattice, poly: readonly Point[]): ShadedCell[] {
  const cellTwice = CELL_TWICE[lattice]
  const out: ShadedCell[] = []
  for (const cell of cellsAround(lattice, poly)) {
    const piece = clipToConvex(poly, cell.frame)
    if (piece.length < 3) continue
    const covered = Math.abs(shoelaceTwice(piece))
    if (covered === 0) continue
    // Clipping can repeat a vertex where the polygon grazes a corner; the area is
    // unaffected but the drawn outline should be clean.
    if (covered === cellTwice) out.push({ ...cell, piece: cell.frame, half: false })
    else if (covered * 2 === cellTwice) out.push({ ...cell, piece: dedupe(piece), half: true })
    // Anything else means the figure breaks the 45°/lattice-direction rule; the
    // schema's reconciliation refinement below rejects it rather than guessing.
  }
  return out.sort((x, y) => x.row - y.row || x.col - y.col)
}

export interface FigureAnalysis {
  verts: Point[]
  cells: ShadedCell[]
  whole: ShadedCell[]
  halves: ShadedCell[]
  /** Whole cells grouped by row, top first — what the running total walks over. */
  wholeRows: { row: number; cells: ShadedCell[] }[]
  /** Cells of grid the region covers: `whole + halves / 2`. */
  units: number
  /** The area in cm²: `units × unitValue`. */
  value: number
  /** Widest column / lowest row reached — the frame the figure is drawn in. */
  cols: number
  rows: number
}

export function analyseFigure(lattice: Lattice, verts: Point[], unitValue: number): FigureAnalysis {
  const cells = shadedCells(lattice, verts)
  const whole = cells.filter((c) => !c.half)
  const halves = cells.filter((c) => c.half)
  const units = whole.length + halves.length / 2
  const perRow = new Map<number, ShadedCell[]>()
  for (const cell of whole) {
    const list = perRow.get(cell.row)
    if (list) list.push(cell)
    else perRow.set(cell.row, [cell])
  }
  return {
    verts,
    cells,
    whole,
    halves,
    wholeRows: [...perRow.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([row, group]) => ({ row, cells: group })),
    units,
    value: units * unitValue,
    cols: Math.max(...verts.map((p) => p[0])),
    rows: Math.max(...verts.map((p) => p[1])),
  }
}

/**
 * The cell-by-cell count and the whole-polygon shoelace must land on the same
 * number of half cells. They are computed by completely different routes, so
 * this is the guard that a drawn shape can never contradict its own answer.
 */
export function reconciles(lattice: Lattice, verts: Point[]): boolean {
  const cells = shadedCells(lattice, verts)
  const fromCells = cells.reduce((sum, c) => sum + (c.half ? 1 : 2), 0)
  return fromCells === halvesOf(lattice, verts) && fromCells > 0
}

/** Edges must run along the lattice, or a cell could be cut somewhere other than in half. */
export function edgesAreLegal(lattice: Lattice, verts: Point[]): boolean {
  for (let i = 0; i < verts.length; i++) {
    const [x1, y1] = verts[i]
    const [x2, y2] = verts[(i + 1) % verts.length]
    const dx = x2 - x1
    const dy = y2 - y1
    if (dx === 0 && dy === 0) return false
    if (lattice === 'square') {
      if (dx !== 0 && dy !== 0 && Math.abs(dx) !== Math.abs(dy)) return false
    } else if (dx !== 0 && dy !== 0 && dx !== -dy) {
      return false
    }
  }
  return true
}

// ── params ───────────────────────────────────────────────────────────────────

// zod 4 infers z.tuple([a, b]) as `[a?, b?, ...unknown[]]`, which stops the
// inferred params satisfying `Point`. The runtime schema really does accept
// exactly two bounded integers — the cast only tells TypeScript so.
const pointSchema = z.tuple([
  z.number().int().min(0).max(12),
  z.number().int().min(0).max(12),
]) as unknown as z.ZodType<Point>

const figureSchema = z.object({ verts: z.array(pointSchema).min(3).max(14) })

/** How many figures each ask draws (including the example, when there is one). */
const FIGURE_COUNT: Record<Ask, number> = {
  area: 1,
  'which-largest': 3,
  'which-equals-example': 4,
}

const paramsSchema = z
  .object({
    lattice: z.enum(LATTICES),
    /** cm² one small cell of the grid stands for. */
    unitValue: z.number().int().min(1).max(6),
    ask: z.enum(ASKS),
    /**
     * The shaded regions, each as a closed vertex list on the lattice. For
     * `which-equals-example` the first figure is the example and the rest are
     * the options; otherwise every figure is an option (or the only shape).
     * THE source of every area in this concept.
     */
    figures: z.array(figureSchema).min(1).max(4),
  })
  .refine((v) => (UNIT_VALUES as readonly number[]).includes(v.unitValue), {
    message: 'a grid cell must stand for 1, 5 or 6 cm²',
  })
  .refine((v) => v.figures.length === FIGURE_COUNT[v.ask], {
    message: 'the number of figures must match the ask',
  })
  .refine((v) => v.figures.every((f) => edgesAreLegal(v.lattice, f.verts)), {
    message: 'every edge must run along the lattice or along a full 45° diagonal',
  })
  .refine(
    (v) =>
      v.figures.every(
        (f) => Math.min(...f.verts.map((p) => p[0])) === 0 && Math.min(...f.verts.map((p) => p[1])) === 0,
      ),
    { message: 'each figure must be normalised to the top-left of its own frame' },
  )
  // The guard the whole file exists for: the drawn cells and the shoelace agree.
  .refine((v) => v.figures.every((f) => reconciles(v.lattice, f.verts)), {
    message: 'the cells the figure shades must add up to its shoelace area',
  })
  // Two halves make one whole, so an even number of halves keeps every area a
  // whole number of grid cells — which is the only kind a grade-3 child pairs up.
  .refine(
    (v) =>
      v.figures.every((f) => shadedCells(v.lattice, f.verts).filter((c) => c.half).length % 2 === 0),
    { message: 'the halves must pair up: an odd half cell would leave half an answer' },
  )
  .refine((v) => v.ask !== 'which-largest' || hasUniqueMax(v.lattice, v.figures), {
    message: 'which-largest needs one figure strictly larger than all the others',
  })
  .refine((v) => v.ask !== 'which-equals-example' || matchCount(v.lattice, v.figures) === 1, {
    message: 'which-equals-example needs exactly one option equal to the example',
  })
export type Params = z.infer<typeof paramsSchema>

function areasOf(lattice: Lattice, figures: { verts: Point[] }[]): number[] {
  return figures.map((f) => halvesOf(lattice, f.verts))
}

function hasUniqueMax(lattice: Lattice, figures: { verts: Point[] }[]): boolean {
  const areas = areasOf(lattice, figures)
  const max = Math.max(...areas)
  return areas.filter((a) => a === max).length === 1
}

function matchCount(lattice: Lattice, figures: { verts: Point[] }[]): number {
  const areas = areasOf(lattice, figures)
  return areas.slice(1).filter((a) => a === areas[0]).length
}

export const meta = {
  slug: 'grid-shaded-area-count',
  name_en: 'Shaded area by counting grid squares',
  name_id: 'Hitung luas daerah berwarna pada petak',
  grades: [2, 3] as const,
  description_id:
    'Menghitung luas daerah berwarna pada kertas berpetak dengan mencacah kotak (atau segitiga) utuh lalu memasangkan potongan setengah, termasuk membandingkan luas beberapa bentuk pada petak yang sama.',
} as const

// ── analysis of a whole question ─────────────────────────────────────────────

export interface Analysis {
  lattice: Lattice
  unitValue: number
  ask: Ask
  /** Every drawn figure, in the order the picture shows them. */
  figures: FigureAnalysis[]
  /** The example, for `which-equals-example`; null otherwise. */
  example: FigureAnalysis | null
  /** The figures the child chooses between, labelled A, B, C. Empty for `area`. */
  options: { label: string; figure: FigureAnalysis }[]
  /** The figure the answer is about. */
  target: FigureAnalysis
  /** The label of the winning option, or null when the answer is a number. */
  answerLabel: string | null
  /** Total half cells drawn anywhere in the picture — decides the "slanting edge" sentence. */
  anyHalves: boolean
  answer: string
}

export function analyse(params: Params): Analysis {
  const figures = params.figures.map((f) => analyseFigure(params.lattice, f.verts, params.unitValue))
  const example = params.ask === 'which-equals-example' ? figures[0] : null
  const optionFigures = params.ask === 'area' ? [] : params.ask === 'which-equals-example' ? figures.slice(1) : figures
  const options = optionFigures.map((figure, i) => ({ label: LABELS[i] ?? `#${i + 1}`, figure }))

  let target = figures[0]
  let answerLabel: string | null = null
  if (params.ask === 'which-largest') {
    const best = options.reduce((top, next) => (next.figure.units > top.figure.units ? next : top))
    target = best.figure
    answerLabel = best.label
  } else if (params.ask === 'which-equals-example' && example) {
    const hit = options.find((o) => o.figure.units === example.units) ?? options[0]
    target = hit.figure
    answerLabel = hit.label
  }

  return {
    lattice: params.lattice,
    unitValue: params.unitValue,
    ask: params.ask,
    figures,
    example,
    options,
    target,
    answerLabel,
    anyHalves: figures.some((f) => f.halves.length > 0),
    answer: answerLabel ?? String(target.value),
  }
}

/**
 * The one genuinely tempting wrong answer, or `null`. Ranked: treating every
 * touched cell as a whole one is the mistake this topic is built to punish, so
 * it wins whenever half cells are on the page.
 */
export function trapAnswer(a: Analysis): string | null {
  const touched = (f: FigureAnalysis): number => f.whole.length + f.halves.length
  if (a.ask === 'area') {
    if (a.target.halves.length > 0) return String(touched(a.target) * a.unitValue)
    if (a.unitValue > 1) return String(a.target.units)
    return null
  }
  if (a.ask === 'which-largest') {
    const byTouched = a.options.reduce((x, y) => (touched(y.figure) > touched(x.figure) ? y : x))
    return byTouched.label === a.answerLabel ? null : byTouched.label
  }
  if (a.example) {
    const wrong = a.options.find(
      (o) => o.label !== a.answerLabel && touched(o.figure) === touched(a.example as FigureAnalysis),
    )
    return wrong ? wrong.label : null
  }
  return null
}

// ── generation ───────────────────────────────────────────────────────────────

function dedupe(verts: Point[]): Point[] {
  const out: Point[] = []
  for (const p of verts) {
    const last = out[out.length - 1]
    if (last && last[0] === p[0] && last[1] === p[1]) continue
    out.push(p)
  }
  while (out.length > 1) {
    const first = out[0]
    const last = out[out.length - 1]
    if (first[0] === last[0] && first[1] === last[1]) out.pop()
    else break
  }
  return out
}

/**
 * A W×H rectangle with up to four corners sliced off by 45° cuts. A cut of leg
 * `k` slices exactly `k` cells in half, so the parity fix below (drop the
 * biggest leg by one when the total is odd) is what guarantees the halves pair
 * up. Corner order is top-left, top-right, bottom-right, bottom-left.
 */
function cutRectangle(rng: Rng, W: number, H: number): Point[] {
  const legs = [0, 0, 0, 0]
  const total = (): number => legs.reduce((s, v) => s + v, 0)
  const roomFor = (i: number): number => {
    if (i === 0) return Math.min(W - legs[1], H - legs[3])
    if (i === 1) return Math.min(W - legs[0], H - legs[2])
    if (i === 2) return Math.min(W - legs[3], H - legs[1])
    return Math.min(W - legs[2], H - legs[0])
  }
  for (const i of rng.shuffle([0, 1, 2, 3])) {
    legs[i] = rng.int(0, Math.max(0, Math.min(2, roomFor(i))))
  }
  if (total() % 2 === 1) {
    // Shrinking a cut only ever frees room, so this can never break a fit — and
    // an even number of cut cells is what lets the halves pair up.
    const biggest = legs.indexOf(Math.max(...legs))
    legs[biggest] -= 1
  }
  if (total() === 0) {
    // A plain rectangle has no halves to count, so give it one real cut.
    const room = Math.min(2, roomFor(0))
    if (room >= 2) legs[0] = 2
  }
  const [tl, tr, br, bl] = legs
  return dedupe([
    [tl, 0],
    [W - tr, 0],
    [W, tr],
    [W, H - br],
    [W - br, H],
    [bl, H],
    [0, H - bl],
    [0, tl],
  ])
}

/** A block of flats with a 45° gable: the roof slices exactly `W` cells in half. */
function house(W: number, H: number): Point[] {
  const roof = W / 2
  return dedupe([
    [0, roof],
    [roof, 0],
    [W, roof],
    [W, H],
    [0, H],
  ])
}

/** An L with its outer and inner corners sliced by equal 45° cuts (so `2k` halves). */
function ell(W: number, H: number, w1: number, h1: number, k: number): Point[] {
  return dedupe([
    [k, 0],
    [w1, 0],
    [w1, h1],
    [W, h1],
    [W, H - k],
    [W - k, H],
    [0, H],
    [0, k],
  ])
}

/** Big up-triangle of side n: n² small triangles. */
function triTriangle(n: number): Point[] {
  return [
    [0, 0],
    [n, 0],
    [0, n],
  ]
}

/** Rhombus w×h of the skewed basis: 2wh small triangles. */
function triRhombus(w: number, h: number): Point[] {
  return [
    [0, 0],
    [w, 0],
    [w, h],
    [0, h],
  ]
}

/** The band of a side-n triangle between rows 0 and m: n² − (n−m)² small triangles. */
function triTrapezoid(n: number, m: number): Point[] {
  return [
    [0, 0],
    [n, 0],
    [n - m, m],
    [0, m],
  ]
}

function drawShape(rng: Rng, lattice: Lattice, roomy: boolean): Point[] {
  if (lattice === 'triangle') {
    const kind = rng.pick(['triangle', 'rhombus', 'trapezoid'] as const)
    if (kind === 'triangle') return triTriangle(rng.int(2, roomy ? 4 : 3))
    if (kind === 'rhombus') return triRhombus(rng.int(1, roomy ? 3 : 2), rng.int(1, roomy ? 3 : 2))
    const n = rng.int(2, roomy ? 4 : 3)
    return triTrapezoid(n, rng.int(1, n - 1))
  }
  const W = rng.int(3, roomy ? 5 : 4)
  const H = rng.int(roomy ? 3 : 2, roomy ? 4 : 3)
  const kind = rng.pick(['cut-rectangle', 'house', 'ell'] as const)
  if (kind === 'house') {
    const even = W % 2 === 0 ? W : W - 1
    const roof = even / 2
    return house(even, Math.max(H, roof + 1))
  }
  if (kind === 'ell') {
    const w1 = rng.int(1, W - 1)
    const h1 = rng.int(1, H - 1)
    // H - h1 - 1, not H - h1: a cut that reached the inner corner would merge two
    // vertices and leave an edge that is neither axis-parallel nor 45°.
    const room = Math.min(w1 - 1, h1, H - h1 - 1, W - 1)
    if (room >= 1) return ell(W, H, w1, h1, rng.int(1, Math.min(2, room)))
  }
  return cutRectangle(rng, W, H)
}

function draft(rng: Rng): Params {
  const lattice = rng.pick(LATTICES)
  const ask = rng.pick(ASKS)
  const unitValue = rng.pick(UNIT_VALUES)

  if (ask === 'area') {
    return { lattice, unitValue, ask, figures: [{ verts: drawShape(rng, lattice, true) }] }
  }

  if (ask === 'which-largest') {
    const picks: Point[][] = []
    const seen = new Set<number>()
    for (let i = 0; i < 80 && picks.length < 3; i++) {
      const verts = drawShape(rng, lattice, false)
      const size = halvesOf(lattice, verts)
      if (seen.has(size)) continue
      seen.add(size)
      picks.push(verts)
    }
    return { lattice, unitValue, ask, figures: picks.map((verts) => ({ verts })) }
  }

  const example = drawShape(rng, lattice, false)
  const target = halvesOf(lattice, example)
  let match: Point[] | null = null
  const others: Point[][] = []
  for (let i = 0; i < 160 && (match === null || others.length < 2); i++) {
    const verts = drawShape(rng, lattice, false)
    const size = halvesOf(lattice, verts)
    if (size === target) {
      if (match === null && JSON.stringify(verts) !== JSON.stringify(example)) match = verts
    } else if (others.length < 2 && !others.some((o) => halvesOf(lattice, o) === size)) {
      others.push(verts)
    }
  }
  const options = match === null ? others : rng.shuffle([match, ...others])
  return {
    lattice,
    unitValue,
    ask,
    figures: [{ verts: example }, ...options.map((verts) => ({ verts }))],
  }
}

/** Pedagogy filter, not correctness — `paramsSchema` already rejects broken figures. */
function isWorthAsking(p: Params): boolean {
  const a = analyse(p)
  // Every area on the page has to be a number a grade-3 child can hold.
  for (const f of a.figures) {
    if (f.units < 2) return false
    if (f.value > 120) return false
    if (f.cols > 6 || f.rows > 5) return false
  }
  if (a.ask === 'area') {
    // A plain rectangle of whole cells is a multiplication drill, not this.
    if (p.lattice === 'square' && a.target.halves.length < 2) return false
    if (a.target.whole.length < 3) return false
    if (a.target.wholeRows.length < 2) return false
    if (a.target.units < 4) return false
    return true
  }
  // A comparison is only worth making when the pictures are close enough that
  // the child has to count rather than eyeball.
  const units = a.options.map((o) => o.figure.units)
  const spread = Math.max(...units) - Math.min(...units)
  if (spread > 6) return false
  if (a.ask === 'which-largest') {
    const sorted = [...units].sort((x, y) => y - x)
    return sorted[0] - sorted[1] <= 3
  }
  return a.example !== null && a.example.units >= 3
}

export function generate(rng: Rng): Params {
  let first: Params | null = null
  for (let attempt = 0; attempt < 400; attempt++) {
    const candidate = draft(rng)
    if (!paramsSchema.safeParse(candidate).success) continue
    if (first === null) first = candidate
    if (isWorthAsking(candidate)) return candidate
  }
  if (first !== null) return first
  // Every draft missed (vanishingly unlikely). A 4×3 rectangle with one corner
  // sliced by a leg-2 cut is correct by construction: 12 − 2 = 10 cells.
  return {
    lattice: 'square',
    unitValue: 1,
    ask: 'area',
    figures: [{ verts: [[2, 0], [4, 0], [4, 3], [0, 3], [0, 2]] }],
  }
}

// ── rendering ────────────────────────────────────────────────────────────────

/** "square"/"kotak" or "triangle"/"segitiga" — the name of one cell of the grid. */
export function cellNoun(lattice: Lattice, lang: Lang): string {
  if (lang === 'id') return lattice === 'square' ? 'kotak' : 'segitiga'
  return lattice === 'square' ? 'square' : 'triangle'
}

/** "square grid paper" / "kertas berpetak kotak". Exported so the breakdown can quote it. */
export function paperNoun(lattice: Lattice, lang: Lang): string {
  if (lang === 'id') return lattice === 'square' ? 'kertas berpetak kotak' : 'kertas berpetak segitiga'
  return lattice === 'square' ? 'square grid paper' : 'triangle grid paper'
}

/** The clause naming what is drawn. Exported so the breakdown can quote it exactly. */
export function sceneClause(ask: Ask, lattice: Lattice, lang: Lang): string {
  const paper = paperNoun(lattice, lang)
  if (lang === 'id') {
    if (ask === 'which-largest') return `3 bentuk berwarna, A, B, dan C, pada ${paper} yang sama`
    if (ask === 'which-equals-example') {
      return `satu bentuk contoh berwarna dan 3 bentuk berwarna lain, A, B, dan C, pada ${paper} yang sama`
    }
    return `sebuah bentuk berwarna pada ${paper}`
  }
  if (ask === 'which-largest') return `3 shaded shapes, A, B and C, drawn on the same ${paper}`
  if (ask === 'which-equals-example') {
    return `one shaded example shape and 3 more shaded shapes, A, B and C, drawn on the same ${paper}`
  }
  return `a shaded shape drawn on ${paper}`
}

/** "Each small square of the grid stands for 5 cm²" — the unit sentence, without its full stop. */
export function unitClause(lattice: Lattice, unitValue: number, lang: Lang): string {
  if (lang === 'id') {
    return `Setiap ${cellNoun(lattice, 'id')} kecil pada petak bernilai ${unitValue} cm²`
  }
  return `Each small ${cellNoun(lattice, 'en')} of the grid stands for ${unitValue} cm²`
}

/** The half-cell warning, or null when nothing on the page is cut in half. */
export function slantClause(anyHalves: boolean, lattice: Lattice, lang: Lang): string | null {
  if (!anyHalves) return null
  const noun = cellNoun(lattice, lang)
  return lang === 'id'
    ? `Ada sisi miring yang memotong beberapa ${noun} itu tepat menjadi dua bagian sama besar`
    : `A slanting edge cuts some of those ${noun}s exactly in half`
}

/** The question sentence, ending in "?". Exported so the breakdown can quote it. */
export function askClause(ask: Ask, lang: Lang): string {
  if (lang === 'id') {
    if (ask === 'which-largest') return 'Bentuk berwarna mana yang luasnya paling besar?'
    if (ask === 'which-equals-example') return 'Bentuk mana yang luasnya tepat sama dengan bentuk contoh?'
    return 'Berapa luas bentuk berwarna itu?'
  }
  if (ask === 'which-largest') return 'Which shaded shape has the largest area?'
  if (ask === 'which-equals-example') return 'Which shape has exactly the same area as the example?'
  return 'What is the area of the shaded shape?'
}

function listId(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  if (items.length === 2) return `${items[0]} dan ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, dan ${items[items.length - 1]}`
}

function listEn(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  if (items.length === 2) return `${items[0]} and ${items[1]}`
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

/**
 * "row 1 has 3, that makes 3; row 2 has 2, that makes 5" — the running total a
 * child can follow with a finger. Built from the grouped cell list, so the words
 * cannot say a different number from the picture.
 */
export function runningCount(rows: { row: number; cells: ShadedCell[] }[], lang: Lang): string {
  let total = 0
  const parts = rows.map(({ row, cells }) => {
    total += cells.length
    return lang === 'id'
      ? `baris ${row + 1} ada ${cells.length}, jadi ${total}`
      : `row ${row + 1} has ${cells.length}, that makes ${total}`
  })
  return lang === 'id' ? listId(parts) : listEn(parts)
}

/** "A is 5 whole and 2 halves, so 5 + 1 = 6" — one figure's count, fully derived. */
export function tallyClause(
  name: string,
  f: FigureAnalysis,
  lattice: Lattice,
  lang: Lang,
): string {
  const noun = cellNoun(lattice, lang)
  if (f.halves.length === 0) {
    return lang === 'id'
      ? `${name} ada ${f.whole.length} ${noun} utuh dan tidak ada potongan setengah, jadi ${f.units}`
      : `${name} has ${f.whole.length} whole ${noun}s and no halves, so ${f.units}`
  }
  const pairs = f.halves.length / 2
  return lang === 'id'
    ? `${name} ada ${f.whole.length} ${noun} utuh dan ${f.halves.length} potongan setengah, dan ${f.halves.length} setengah = ${pairs} utuh, jadi ${f.whole.length} + ${pairs} = ${f.units}`
    : `${name} has ${f.whole.length} whole ${noun}s and ${f.halves.length} halves, and ${f.halves.length} halves = ${pairs} whole, so ${f.whole.length} + ${pairs} = ${f.units}`
}

function methodStep(a: Analysis, lang: Lang): string {
  const noun = cellNoun(a.lattice, lang)
  if (!a.anyHalves) {
    return lang === 'id'
      ? `Setiap ${noun} yang berwarna diwarnai penuh sampai ke tepinya, jadi tiap ${noun} bernilai satu ${noun} utuh. Tinggal dicacah.`
      : `Every shaded ${noun} is painted right out to its edges, so each one counts as one whole ${noun}. It is a counting job.`
  }
  return lang === 'id'
    ? `Pisahkan dulu jadi dua tumpukan: ${noun} yang diwarnai penuh sampai ke tepinya bernilai satu utuh, dan ${noun} yang dipotong sisi miring dari sudut ke sudut bernilai setengah.`
    : `Sort the shaded cells into two piles first: a ${noun} painted right out to its edges is a whole one, and a ${noun} the slanting edge cuts corner to corner is a half.`
}

function areaSteps(a: Analysis, lang: Lang): string[] {
  const noun = cellNoun(a.lattice, lang)
  const f = a.target
  const steps = [methodStep(a, lang)]

  steps.push(
    lang === 'id'
      ? `Cacah ${noun} yang utuh baris demi baris dari atas sambil mengingat jumlahnya: ${runningCount(f.wholeRows, 'id')}. Jadi ada ${f.whole.length} ${noun} utuh.`
      : `Count the whole ${noun}s row by row from the top, keeping the total in your head: ${runningCount(f.wholeRows, 'en')}. That is ${f.whole.length} whole ${noun}s.`,
  )

  if (f.halves.length > 0) {
    const pairs = f.halves.length / 2
    steps.push(
      lang === 'id'
        ? `Sekarang pasangkan potongan setengahnya. Ada ${f.halves.length} potongan, dan 2 setengah menjadi 1 ${noun} utuh, jadi ${f.halves.length} setengah = ${pairs} utuh. ${f.whole.length} + ${pairs} = ${f.units} ${noun}.`
        : `Now pair up the halves. There are ${f.halves.length} of them, and 2 halves make 1 whole ${noun}, so ${f.halves.length} halves = ${pairs} whole. ${f.whole.length} + ${pairs} = ${f.units} ${noun}s.`,
    )
  }

  steps.push(
    a.unitValue === 1
      ? lang === 'id'
        ? `Satu ${noun} bernilai 1 cm², jadi luasnya ${f.units} cm².`
        : `One ${noun} stands for 1 cm², so the area is ${f.units} cm².`
      : lang === 'id'
        ? `Satu ${noun} bernilai ${a.unitValue} cm², jadi luasnya ${f.units} × ${a.unitValue} = ${f.value} cm².`
        : `One ${noun} stands for ${a.unitValue} cm², so the area is ${f.units} × ${a.unitValue} = ${f.value} cm².`,
  )
  return steps
}

function compareSteps(a: Analysis, lang: Lang): string[] {
  const noun = cellNoun(a.lattice, lang)
  const steps = [methodStep(a, lang)]

  if (a.ask === 'which-equals-example' && a.example) {
    steps.push(
      lang === 'id'
        ? `Mulai dari bentuk contoh: ${tallyClause('bentuk contoh', a.example, a.lattice, 'id')} ${noun}.`
        : `Start with the example: ${tallyClause('the example', a.example, a.lattice, 'en')} ${noun}s.`,
    )
  }

  // Semicolons, not a comma list: each tally already carries commas of its own.
  const tallies = a.options.map((o) => tallyClause(o.label, o.figure, a.lattice, lang)).join('; ')
  steps.push(
    lang === 'id'
      ? `Cacah tiap bentuk dengan cara yang sama: ${tallies}.`
      : `Count each shape the same way: ${tallies}.`,
  )

  const counts = a.options.map((o) => String(o.figure.units))
  if (a.ask === 'which-largest') {
    steps.push(
      lang === 'id'
        ? `Bandingkan ${listId(counts)}: yang terbesar ${a.target.units}, jadi jawabannya ${a.answerLabel}. Luasnya ${a.target.units} × ${a.unitValue} = ${a.target.value} cm².`
        : `Compare ${listEn(counts)}: the biggest is ${a.target.units}, so the answer is ${a.answerLabel}. Its area is ${a.target.units} × ${a.unitValue} = ${a.target.value} cm².`,
    )
  } else {
    steps.push(
      lang === 'id'
        ? `Bentuk contoh ${a.example?.units}, sedangkan pilihannya ${listId(counts)}. Hanya ${a.answerLabel} yang tepat ${a.target.units}, jadi jawabannya ${a.answerLabel}.`
        : `The example is ${a.example?.units}, and the options are ${listEn(counts)}. Only ${a.answerLabel} lands on ${a.target.units}, so the answer is ${a.answerLabel}.`,
    )
  }
  return steps
}

export function render(params: Params): Rendered {
  const a = analyse(params)
  const breakdown = buildGridShadedAreaCountBreakdown(params)

  const slant_en = slantClause(a.anyHalves, params.lattice, 'en')
  const slant_id = slantClause(a.anyHalves, params.lattice, 'id')

  // The `Find:` / `Cari:` markers are stripped before display; every breakdown
  // phrase is built against the stripped text and never spans a marker.
  const body_en = [
    `The picture shows ${sceneClause(params.ask, params.lattice, 'en')}.`,
    `${unitClause(params.lattice, params.unitValue, 'en')}.`,
    ...(slant_en ? [`${slant_en}.`] : []),
    `Find: ${askClause(params.ask, 'en')}`,
  ].join(' ')
  const body_id = [
    `Gambar menunjukkan ${sceneClause(params.ask, params.lattice, 'id')}.`,
    `${unitClause(params.lattice, params.unitValue, 'id')}.`,
    ...(slant_id ? [`${slant_id}.`] : []),
    `Cari: ${askClause(params.ask, 'id')}`,
  ].join(' ')

  const multi = params.ask !== 'area'
  const choices_en: WmiChoice[] | null = multi
    ? a.options.map((o) => ({ label: o.label, text: `Shape ${o.label}` }))
    : null
  const choices_id: WmiChoice[] | null = multi
    ? a.options.map((o) => ({ label: o.label, text: `Bentuk ${o.label}` }))
    : null

  const steps_en = multi ? compareSteps(a, 'en') : areaSteps(a, 'en')
  const steps_id = multi ? compareSteps(a, 'id') : areaSteps(a, 'id')

  const noun_en = cellNoun(params.lattice, 'en')
  const noun_id = cellNoun(params.lattice, 'id')
  const hint_en = a.anyHalves
    ? `Count the whole ${noun_en}s first, then pair the half ones up — two halves make one whole.`
    : `Count the shaded ${noun_en}s row by row, then turn ${noun_en}s into cm².`
  const hint_id = a.anyHalves
    ? `Cacah dulu ${noun_id} yang utuh, lalu pasangkan yang setengah — dua setengah menjadi satu utuh.`
    : `Cacah ${noun_id} berwarna baris demi baris, lalu ubah ${noun_id} menjadi cm².`

  return {
    body_en,
    body_id,
    answer_type: multi ? 'multiple_choice' : 'fill_in',
    choices_en,
    choices_id,
    answer: a.answer,
    hint_en,
    hint_id,
    hint_steps_en: steps_en,
    hint_steps_id: steps_id,
    breakdown,
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
