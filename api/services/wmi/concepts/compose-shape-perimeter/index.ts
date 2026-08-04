import { z } from 'zod'
import type { ConceptLogic, Rendered, Rng } from '../types.js'
import { buildComposeShapePerimeterBreakdown } from './breakdown.js'

// Push several IDENTICAL pieces together into one bigger shape, then work back
// to a side length, the outline, or the surface — the WMI grade-3 GE-AREA
// staple (2019-final-g3 #4, 2020-semifinal-g3 #8, 2023-final-g3 #19,
// 2025-final-g3 #4).
//
// THE rule this file exists to enforce: the perimeter is COUNTED off the
// assembled cell list by `boundaryEdges` below — every cell edge that faces
// empty space, and nothing else. It is never authored. That is not a style
// preference: joining two pieces HIDES two edges, and a child who has not seen
// that will happily answer `n × (one piece's perimeter)`. If a field held the
// perimeter, that field could quietly hold the trap instead and the drawing
// would not object. There is no such field.
//
// Two structural guarantees keep the counting narratable as well as correct.
// `hasSolidRows` + `hasSolidCols` make every row and every column of the shape
// one unbroken run, so exactly two edges of each column face up/down and exactly
// two edges of each row face left/right. The hints therefore say
// "2 × (columns)" and "2 × (rows)" and mean the very edges the scan counted —
// `index.test.ts` re-derives both numbers independently and demands they agree.

export const PIECES = ['square', 'rectangle'] as const
export type Piece = (typeof PIECES)[number]

export const ARRANGEMENTS = ['row', 'rectangle', 'ell', 'staircase'] as const
export type Arrangement = (typeof ARRANGEMENTS)[number]

/** Which measurement the stem hands the child. */
export const GIVENS = ['piece-side', 'piece-perimeter', 'piece-area', 'shape-perimeter'] as const
export type Given = (typeof GIVENS)[number]

export const ASKS = ['side', 'perimeter', 'area'] as const
export type Ask = (typeof ASKS)[number]

export type Lang = 'en' | 'id'

/** One PIECE of the layout as [row, col]; row 0 = top, col 0 = left — Polyomino's frame. */
export type Cell = [number, number]

const key = (cell: Cell): string => `${cell[0]},${cell[1]}`
const byReadingOrder = (a: Cell, b: Cell): number => a[0] - b[0] || a[1] - b[1]

// ── pure geometry, shared by the schema, the generator, render and the test ──

export function spanOf(cells: readonly Cell[]): { rows: number; cols: number } {
  if (cells.length === 0) return { rows: 0, cols: 0 }
  let maxR = 0
  let maxC = 0
  for (const [r, c] of cells) {
    if (r > maxR) maxR = r
    if (c > maxC) maxC = c
  }
  // Callers only ever pass normalised layouts (min row and min col are 0),
  // which `paramsSchema` enforces, so the span is the largest index + 1.
  return { rows: maxR + 1, cols: maxC + 1 }
}

/** True when every piece touches another one edge-to-edge — one single shape. */
export function isConnected(cells: readonly Cell[]): boolean {
  if (cells.length === 0) return false
  const all = new Set(cells.map(key))
  const seen = new Set<string>([key(cells[0])])
  const queue: Cell[] = [cells[0]]
  while (queue.length > 0) {
    const [r, c] = queue.pop() as Cell
    for (const next of [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]] as Cell[]) {
      const k = key(next)
      if (!all.has(k) || seen.has(k)) continue
      seen.add(k)
      queue.push(next)
    }
  }
  return seen.size === all.size
}

function runsAreSolid(groups: Map<number, number[]>): boolean {
  for (const line of groups.values()) {
    const sorted = [...line].sort((a, b) => a - b)
    if (sorted[sorted.length - 1] - sorted[0] + 1 !== sorted.length) return false
  }
  return true
}

function byRow(cells: readonly Cell[]): Map<number, number[]> {
  const out = new Map<number, number[]>()
  for (const [r, c] of cells) out.set(r, [...(out.get(r) ?? []), c])
  return out
}

function byCol(cells: readonly Cell[]): Map<number, number[]> {
  const out = new Map<number, number[]>()
  for (const [r, c] of cells) out.set(c, [...(out.get(c) ?? []), r])
  return out
}

/** No row of the shape has a gap — so exactly two edges of each row face sideways. */
export function hasSolidRows(cells: readonly Cell[]): boolean {
  return runsAreSolid(byRow(cells))
}

/** No column has a gap — so exactly two edges of each column face up and down. */
export function hasSolidCols(cells: readonly Cell[]): boolean {
  return runsAreSolid(byCol(cells))
}

/** The pieces grouped by row, top row first. */
export function groupRows(cells: readonly Cell[]): { row: number; cells: Cell[] }[] {
  const perRow = new Map<number, Cell[]>()
  for (const cell of cells) {
    const list = perRow.get(cell[0])
    if (list) list.push(cell)
    else perRow.set(cell[0], [cell])
  }
  return [...perRow.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([row, group]) => ({ row, cells: [...group].sort(byReadingOrder) }))
}

/**
 * THE count. Every edge of every piece that faces empty space, split by
 * direction: `horizontal` edges run left-right (they are one piece WIDE),
 * `vertical` edges run up-down (they are one piece TALL). An edge shared with a
 * neighbouring piece faces a piece, not empty space, so it is never counted —
 * which is exactly the two-edges-per-join that the trap forgets.
 */
export function boundaryEdges(cells: readonly Cell[]): { horizontal: number; vertical: number } {
  const all = new Set(cells.map(key))
  let horizontal = 0
  let vertical = 0
  for (const [r, c] of cells) {
    if (!all.has(key([r - 1, c]))) horizontal += 1
    if (!all.has(key([r + 1, c]))) horizontal += 1
    if (!all.has(key([r, c - 1]))) vertical += 1
    if (!all.has(key([r, c + 1]))) vertical += 1
  }
  return { horizontal, vertical }
}

/** How many places two pieces touch. Each one buries two edges. */
export function joinCount(cells: readonly Cell[]): number {
  const all = new Set(cells.map(key))
  let joins = 0
  for (const [r, c] of cells) {
    if (all.has(key([r + 1, c]))) joins += 1
    if (all.has(key([r, c + 1]))) joins += 1
  }
  return joins
}

// ── params ───────────────────────────────────────────────────────────────────

// zod 4 infers z.tuple([a, b]) as `[a?, b?, ...unknown[]]`, losing the
// fixed-length guarantee, so the inferred params stop satisfying `Cell`. The
// runtime schema really does accept exactly two bounded integers and nothing
// else — this only tells TypeScript what zod already enforces.
const cellSchema = z.tuple([
  z.number().int().min(0).max(8),
  z.number().int().min(0).max(8),
]) as unknown as z.ZodType<Cell>

/** The shape `analyse` needs. Declared structurally so a refinement may call it. */
export interface Shape {
  piece: Piece
  pieceW: number
  pieceH: number
  cells: Cell[]
  given: Given
  ask: Ask
}

export const PIECE_COUNTS = [3, 4, 6, 9] as const

/** Which row lengths mark a shape as a staircase, an L, a block or a plain row. */
export function classifyLayout(cells: readonly Cell[]): Arrangement | null {
  const { rows, cols } = spanOf(cells)
  if (rows === 1 && cols === cells.length) return 'row'
  if (rows >= 2 && cols >= 2 && rows * cols === cells.length) return 'rectangle'

  const rowLens = [...byRow(cells).values()].map((line) => line.length).sort((a, b) => a - b)
  const colLens = [...byCol(cells).values()].map((line) => line.length).sort((a, b) => a - b)
  // A staircase climbs one step at a time in BOTH directions: its row lengths
  // and its column lengths are both 1, 2, 3, …
  const ladder = (lens: number[]) => lens.every((n, i) => n === i + 1)
  if (rowLens.length >= 3 && ladder(rowLens) && ladder(colLens)) return 'staircase'
  // An L is one long arm crossed by one long arm: exactly one row and exactly
  // one column hold more than a single piece.
  const fatRows = rowLens.filter((n) => n > 1).length
  const fatCols = colLens.filter((n) => n > 1).length
  if (fatRows === 1 && fatCols === 1) return 'ell'
  return null
}

const paramsSchema = z
  .object({
    piece: z.enum(PIECES),
    /** Width of one piece, in cm. Equal to `pieceH` for a square piece. */
    pieceW: z.number().int().min(2).max(6),
    /** Height of one piece, in cm. */
    pieceH: z.number().int().min(2).max(6),
    /**
     * The finished shape, as the grid of PIECES it is built from. Normalised so
     * the top row is 0 and the left column is 0. THE source of the perimeter.
     */
    cells: z.array(cellSchema).min(3).max(9),
    arrangement: z.enum(ARRANGEMENTS),
    given: z.enum(GIVENS),
    ask: z.enum(ASKS),
  })
  .refine((v) => new Set(v.cells.map(key)).size === v.cells.length, {
    message: 'the layout may not put two pieces in the same place',
  })
  .refine((v) => v.cells.some(([r]) => r === 0) && v.cells.some(([, c]) => c === 0), {
    message: 'the layout must be normalised: a piece in row 0 and a piece in column 0',
  })
  .refine((v) => (PIECE_COUNTS as readonly number[]).includes(v.cells.length), {
    message: 'use 3, 4, 6 or 9 pieces',
  })
  .refine((v) => isConnected(v.cells), { message: 'the pieces must make one joined-up shape' })
  // Solid rows and solid columns are what make "two edges per row, two per
  // column" true, which is what makes the count narratable to a child. They also
  // rule out holes, so "the outline" is one closed loop.
  .refine((v) => hasSolidRows(v.cells), { message: 'no row of the shape may have a gap' })
  .refine((v) => hasSolidCols(v.cells), { message: 'no column of the shape may have a gap' })
  .refine((v) => classifyLayout(v.cells) === v.arrangement, {
    message: 'the named arrangement must be the shape actually laid out',
  })
  .refine((v) => (v.piece === 'square' ? v.pieceW === v.pieceH : v.pieceW !== v.pieceH), {
    message: 'a square piece has equal sides; a rectangular piece does not',
  })
  // A rectangle is not pinned down by its perimeter, by its area, or by the
  // outline of the finished shape — only by naming both of its sides. So every
  // other `given` needs the square piece, or the child would be guessing.
  .refine((v) => v.given === 'piece-side' || v.piece === 'square', {
    message: 'only a square piece can be described by one number',
  })
  // "How long is one side?" is a question with one answer only for a square, and
  // it is only worth asking when the child must unpick the finished outline.
  .refine((v) => v.ask !== 'side' || (v.piece === 'square' && v.given === 'shape-perimeter'), {
    message: 'the side ask needs a square piece and the finished outline as the given',
  })
  // The given may not simply BE the answer, nor make it a one-step restatement.
  .refine((v) => !(v.given === 'shape-perimeter' && v.ask === 'perimeter'), {
    message: 'the outline cannot be both the given and the answer',
  })
  .refine((v) => !(v.given === 'piece-area' && v.ask === 'area'), {
    message: 'piece area into shape area is a single multiplication, not this concept',
  })
  .refine((v) => !(v.given === 'piece-side' && v.ask === 'side'), {
    message: 'the piece side cannot be both the given and the answer',
  })
  .refine((v) => !(v.given === 'piece-perimeter' && v.ask === 'side'), {
    message: 'one piece alone settles that; the finished shape never enters it',
  })
  // Every number a child reads or works out has to be a whole number of cm.
  .refine(
    (v) => {
      const a = analyse(v)
      return [
        a.piecePerimeter,
        a.pieceArea,
        a.shapePerimeter,
        a.shapeArea,
        a.givenValue,
        a.answerValue,
      ].every((n) => Number.isInteger(n) && n > 0)
    },
    { message: 'every stated and derived measurement must be a whole number of centimetres' },
  )
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'compose-shape-perimeter',
  name_en: 'Perimeter of a shape built from identical pieces',
  name_id: 'Susun bangun lalu cari kelilingnya',
  grades: [2, 3] as const,
  description_id:
    'Menyusun beberapa keping yang sama besar menjadi satu bangun, lalu mencari panjang sisi keping, keliling bangun jadinya, atau luasnya — dengan memahami bahwa setiap dua keping yang dirapatkan menyembunyikan dua sisi.',
} as const

// ── the single place the numbers are produced ────────────────────────────────

export interface Analysis {
  cells: Cell[]
  /** How many pieces make the shape. */
  count: number
  /** Shape width and height, measured in PIECES. */
  width: number
  height: number
  /** `cells` grouped by row, top first — the order the hints walk. */
  rows: { row: number; cells: Cell[] }[]
  /** Boundary edges one piece WIDE (top and bottom edges). Counted, never authored. */
  horizontalEdges: number
  /** Boundary edges one piece TALL (left and right edges). */
  verticalEdges: number
  /** Every boundary edge, whichever way it runs. */
  outlineEdges: number
  /** Places two pieces touch. */
  joins: number
  /** Edges buried by those joins — two per join. */
  hiddenEdges: number
  pieceW: number
  pieceH: number
  piecePerimeter: number
  pieceArea: number
  shapePerimeter: number
  shapeArea: number
  /** The number the stem states. */
  givenValue: number
  answerValue: number
  answer: string
  unit: 'cm' | 'cm²'
}

export function analyse(shape: Shape): Analysis {
  const cells = [...shape.cells].sort(byReadingOrder)
  const { rows: height, cols: width } = spanOf(cells)
  const { horizontal, vertical } = boundaryEdges(cells)
  const joins = joinCount(cells)
  const count = cells.length

  const piecePerimeter = 2 * (shape.pieceW + shape.pieceH)
  const pieceArea = shape.pieceW * shape.pieceH
  const shapePerimeter = horizontal * shape.pieceW + vertical * shape.pieceH
  const shapeArea = count * pieceArea

  const givenValue =
    shape.given === 'piece-side'
      ? shape.pieceW
      : shape.given === 'piece-perimeter'
        ? piecePerimeter
        : shape.given === 'piece-area'
          ? pieceArea
          : shapePerimeter

  const answerValue =
    shape.ask === 'side' ? shape.pieceW : shape.ask === 'perimeter' ? shapePerimeter : shapeArea

  return {
    cells,
    count,
    width,
    height,
    rows: groupRows(cells),
    horizontalEdges: horizontal,
    verticalEdges: vertical,
    outlineEdges: horizontal + vertical,
    joins,
    hiddenEdges: 2 * joins,
    pieceW: shape.pieceW,
    pieceH: shape.pieceH,
    piecePerimeter,
    pieceArea,
    shapePerimeter,
    shapeArea,
    givenValue,
    answerValue,
    answer: String(answerValue),
    unit: shape.ask === 'area' ? 'cm²' : 'cm',
  }
}

/**
 * The one genuinely tempting wrong answer, or `null`. All three forms are the
 * SAME mistake — believing each piece keeps its whole outline after it is pushed
 * against its neighbours — read forwards for a perimeter, sideways for an area,
 * and backwards for a side.
 */
export function trapAnswer(shape: Shape, a: Analysis): string | null {
  if (shape.ask === 'perimeter') {
    const wrong = a.count * a.piecePerimeter
    return wrong === a.answerValue ? null : String(wrong)
  }
  if (shape.ask === 'area') {
    const wrong = a.count * a.piecePerimeter
    return wrong === a.answerValue ? null : String(wrong)
  }
  // ask === 'side': the child shares the string out as `count` whole squares.
  const wrong = a.shapePerimeter / (4 * a.count)
  if (!Number.isInteger(wrong) || wrong <= 0 || wrong === a.answerValue) return null
  return String(wrong)
}

// ── generation ───────────────────────────────────────────────────────────────

function rectangleFactors(count: number): [number, number][] {
  const out: [number, number][] = []
  for (let r = 2; r <= count; r++) {
    if (count % r !== 0) continue
    const c = count / r
    if (c >= 2) out.push([r, c])
  }
  return out
}

function buildLayout(rng: Rng, arrangement: Arrangement, count: number): Cell[] | null {
  if (arrangement === 'row') {
    return Array.from({ length: count }, (_, c) => [0, c] as Cell)
  }
  if (arrangement === 'rectangle') {
    const options = rectangleFactors(count)
    if (options.length === 0) return null
    const [rows, cols] = rng.pick(options)
    const cells: Cell[] = []
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) cells.push([r, c])
    return cells
  }
  if (arrangement === 'ell') {
    // A vertical arm of `arm` pieces down column 0, then the rest running right
    // along the bottom row. Both arms stay solid, so the outline is countable.
    const arm = rng.int(2, count - 1)
    const foot = count - arm
    const cells: Cell[] = []
    for (let r = 0; r < arm; r++) cells.push([r, 0])
    for (let c = 1; c <= foot; c++) cells.push([arm - 1, c])
    return cells
  }
  // staircase — 1 + 2 + 3 + … pieces, so only triangular counts qualify. Three
  // pieces would look exactly like an L, so a staircase starts at three steps.
  let steps = 0
  let used = 0
  while (used < count) {
    steps += 1
    used += steps
  }
  if (used !== count || steps < 3) return null
  const cells: Cell[] = []
  for (let r = 0; r < steps; r++) for (let c = 0; c <= r; c++) cells.push([r, c])
  return cells
}

/** Mirror the layout so L shapes and staircases face all four ways. */
function flip(rng: Rng, cells: Cell[]): Cell[] {
  const { rows, cols } = spanOf(cells)
  const flipR = rng.int(0, 1) === 1
  const flipC = rng.int(0, 1) === 1
  return cells
    .map(([r, c]) => [flipR ? rows - 1 - r : r, flipC ? cols - 1 - c : c] as Cell)
    .sort(byReadingOrder)
}

function draft(rng: Rng): Params | null {
  const piece = rng.pick(PIECES)
  const pieceW = piece === 'square' ? rng.int(2, 6) : rng.int(2, 5)
  const pieceH =
    piece === 'square' ? pieceW : rng.pick([2, 3, 4, 5].filter((n) => n !== pieceW))

  const given: Given =
    piece === 'square'
      ? rng.pick(['piece-side', 'piece-perimeter', 'piece-area', 'shape-perimeter'] as const)
      : 'piece-side'

  const ask: Ask =
    given === 'piece-area'
      ? 'perimeter'
      : given === 'shape-perimeter'
        ? rng.pick(['side', 'area'] as const)
        : rng.pick(['perimeter', 'area'] as const)

  const count = rng.pick(PIECE_COUNTS)
  const arrangement = rng.pick(ARRANGEMENTS)
  const base = buildLayout(rng, arrangement, count)
  if (base === null) return null
  const cells = flip(rng, base)
  if (classifyLayout(cells) !== arrangement) return null

  return { piece, pieceW, pieceH, cells, arrangement, given, ask }
}

/** Pedagogy filter, not correctness — `paramsSchema` already rejects broken params. */
function isWorthAsking(p: Params): boolean {
  const a = analyse(p)
  // At least two joins, or nothing has been "put together".
  if (a.joins < 2) return false
  // Numbers a grade-3 child can hold and a page can hold.
  if (a.shapePerimeter > 120) return false
  if (a.shapeArea > 240) return false
  if (a.width * p.pieceW > 24 || a.height * p.pieceH > 20) return false
  // A one-piece-tall row of squares makes "2 × 1 rows" a strange thing to say
  // when the ask is the side; keep that ask on shapes with real depth.
  if (p.ask === 'side' && (a.width < 2 || a.height < 2)) return false
  return true
}

export function generate(rng: Rng): Params {
  let first: Params | null = null
  for (let attempt = 0; attempt < 400; attempt++) {
    const candidate = draft(rng)
    if (candidate === null) continue
    if (!paramsSchema.safeParse(candidate).success) continue
    if (first === null) first = candidate
    if (isWorthAsking(candidate)) return candidate
  }
  if (first !== null) return first
  // Every draft missed (vanishingly unlikely). Four 3 cm squares in a 2-by-2
  // block is correct by construction.
  return {
    piece: 'square',
    pieceW: 3,
    pieceH: 3,
    cells: [
      [0, 0], [0, 1],
      [1, 0], [1, 1],
    ],
    arrangement: 'rectangle',
    given: 'piece-side',
    ask: 'perimeter',
  }
}

// ── rendering ────────────────────────────────────────────────────────────────

/** "4 identical square pieces" — exported so the breakdown can quote it exactly. */
export function piecesPhrase(params: Params, lang: Lang): string {
  const n = params.cells.length
  if (lang === 'id') {
    return params.piece === 'square'
      ? `${n} keping persegi yang sama besar`
      : `${n} keping persegi panjang yang sama besar`
  }
  return params.piece === 'square'
    ? `${n} identical square pieces`
    : `${n} identical rectangular pieces`
}

/** The fact the whole concept turns on. Exported so the breakdown can quote it. */
export function joinPhrase(lang: Lang): string {
  return lang === 'id'
    ? 'dirapatkan sisi demi sisi, tanpa celah dan tanpa tumpang tindih'
    : 'pushed together edge to edge, with no gaps and no overlaps'
}

export function arrangementSentence(params: Params, a: Analysis, lang: Lang): string {
  if (params.arrangement === 'row') {
    return lang === 'id'
      ? 'Keping-keping itu disusun dalam satu baris lurus.'
      : 'The pieces are laid out in one straight row.'
  }
  if (params.arrangement === 'rectangle') {
    return lang === 'id'
      ? `Keping-keping itu disusun menjadi blok setinggi ${a.height} baris dan selebar ${a.width} keping.`
      : `The pieces are laid out in a block ${a.height} rows deep and ${a.width} pieces wide.`
  }
  if (params.arrangement === 'ell') {
    return lang === 'id'
      ? 'Keping-keping itu disusun membentuk huruf L.'
      : 'The pieces are laid out in an L shape.'
  }
  return lang === 'id'
    ? 'Keping-keping itu disusun bertingkat seperti tangga.'
    : 'The pieces are laid out in steps, like a staircase.'
}

/** The exact span of the given sentence the breakdown highlights. */
export function givenPhrase(params: Params, a: Analysis, lang: Lang): string {
  if (params.given === 'piece-side') {
    if (params.piece === 'square') {
      return lang === 'id' ? `sisi ${a.pieceW} cm` : `sides of ${a.pieceW} cm`
    }
    return lang === 'id'
      ? `lebar ${a.pieceW} cm dan tinggi ${a.pieceH} cm`
      : `${a.pieceW} cm wide and ${a.pieceH} cm tall`
  }
  if (params.given === 'piece-perimeter') {
    return lang === 'id'
      ? `Keliling satu keping adalah ${a.piecePerimeter} cm`
      : `The perimeter of one piece is ${a.piecePerimeter} cm`
  }
  if (params.given === 'piece-area') {
    return lang === 'id'
      ? `Luas satu keping adalah ${a.pieceArea} cm²`
      : `The area of one piece is ${a.pieceArea} cm²`
  }
  return lang === 'id'
    ? `tali sepanjang ${a.shapePerimeter} cm melingkari tepi luar bentuk yang sudah jadi tepat satu kali`
    : `A string ${a.shapePerimeter} cm long goes exactly once round the outside`
}

export function givenSentence(params: Params, a: Analysis, lang: Lang): string {
  const phrase = givenPhrase(params, a, lang)
  if (params.given === 'piece-side') {
    if (params.piece === 'square') {
      return lang === 'id'
        ? `Setiap keping berbentuk persegi dengan ${phrase}.`
        : `Each piece is a square with ${phrase}.`
    }
    return lang === 'id'
      ? `Setiap keping berbentuk persegi panjang dengan ${phrase}.`
      : `Each piece is a rectangle ${phrase}.`
  }
  if (params.given === 'shape-perimeter') {
    return lang === 'id'
      ? `Seutas ${phrase}, tanpa sisa sedikit pun.`
      : `${phrase} of the finished shape, with none left over.`
  }
  return `${phrase}.`
}

/** The question sentence, ending in "?". Exported so the breakdown can quote it. */
export function askClause(ask: Ask, lang: Lang): string {
  if (ask === 'side') {
    return lang === 'id'
      ? 'Berapa panjang satu sisi satu keping?'
      : 'How long is one side of one piece?'
  }
  if (ask === 'perimeter') {
    return lang === 'id'
      ? 'Berapa keliling bentuk yang sudah jadi?'
      : 'What is the perimeter of the finished shape?'
  }
  return lang === 'id'
    ? 'Berapa luas bentuk yang sudah jadi?'
    : 'What is the area of the finished shape?'
}

function listId(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  if (items.length === 2) return `${items[0]} dan ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, dan ${items[items.length - 1]}`
}

function listEn(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

/** "row 1 has 1 piece, row 2 has 3 pieces" — read straight off the layout. */
export function rowStory(a: Analysis, lang: Lang): string {
  const parts = a.rows.map(({ row, cells }) =>
    lang === 'id'
      ? `baris ${row + 1} ada ${cells.length} keping`
      : `row ${row + 1} has ${cells.length} ${cells.length === 1 ? 'piece' : 'pieces'}`,
  )
  return lang === 'id' ? listId(parts) : listEn(parts)
}

export function render(params: Params): Rendered {
  const a = analyse(params)
  const breakdown = buildComposeShapePerimeterBreakdown(params)

  // The `Find:` / `Cari:` markers are stripped before display; every breakdown
  // phrase is built against the stripped text and never spans a marker.
  const body_en = [
    `The picture shows ${piecesPhrase(params, 'en')} ${joinPhrase('en')}.`,
    arrangementSentence(params, a, 'en'),
    givenSentence(params, a, 'en'),
    `Find: ${askClause(params.ask, 'en')}`,
  ].join(' ')
  const body_id = [
    `Gambar menunjukkan ${piecesPhrase(params, 'id')}, ${joinPhrase('id')}.`,
    arrangementSentence(params, a, 'id'),
    givenSentence(params, a, 'id'),
    `Cari: ${askClause(params.ask, 'id')}`,
  ].join(' ')

  // ── hint_steps: pin the piece down, lay the shape out, then COUNT the edges
  // that still face outside. Nothing is announced; each line only uses numbers
  // the line before it has already established.
  const steps_en: string[] = []
  const steps_id: string[] = []
  const push = (en: string, id: string) => {
    steps_en.push(en)
    steps_id.push(id)
  }

  // 1 — what one piece measures, when the stem describes the piece.
  if (params.given === 'piece-side') {
    if (params.piece === 'square') {
      push(
        `Start with one piece on its own. It is a square, so all four of its sides are the same, ${a.pieceW} cm each.`,
        `Mulai dari satu keping dulu. Kepingnya persegi, jadi keempat sisinya sama panjang, masing-masing ${a.pieceW} cm.`,
      )
    } else {
      push(
        `Start with one piece on its own. It is ${a.pieceW} cm across and ${a.pieceH} cm down, so in the picture every sideways edge is ${a.pieceW} cm and every up-and-down edge is ${a.pieceH} cm.`,
        `Mulai dari satu keping dulu. Lebarnya ${a.pieceW} cm dan tingginya ${a.pieceH} cm, jadi pada gambar setiap sisi mendatar panjangnya ${a.pieceW} cm dan setiap sisi tegak panjangnya ${a.pieceH} cm.`,
      )
    }
  } else if (params.given === 'piece-perimeter') {
    push(
      `Start with one piece on its own. A square has 4 sides all the same, and the four of them together are ${a.piecePerimeter} cm, so one side is ${a.piecePerimeter} ÷ 4 = ${a.pieceW} cm.`,
      `Mulai dari satu keping dulu. Persegi punya 4 sisi yang sama panjang, dan keempatnya bersama-sama ${a.piecePerimeter} cm, jadi satu sisinya ${a.piecePerimeter} ÷ 4 = ${a.pieceW} cm.`,
    )
  } else if (params.given === 'piece-area') {
    push(
      `Start with one piece on its own. It is a square, so its area is one side times itself. Which number times itself makes ${a.pieceArea}? ${a.pieceW} × ${a.pieceW} = ${a.pieceArea}, so one side is ${a.pieceW} cm.`,
      `Mulai dari satu keping dulu. Kepingnya persegi, jadi luasnya sisi dikali sisi. Bilangan berapa yang dikali dirinya sendiri hasilnya ${a.pieceArea}? ${a.pieceW} × ${a.pieceW} = ${a.pieceArea}, jadi satu sisinya ${a.pieceW} cm.`,
    )
  }

  // 2–4 — the edge walk. Skipped when the ask is the area and the piece is
  // already known, because hiding edges never hides any surface.
  const needsEdgeWalk = params.ask !== 'area' || params.given === 'shape-perimeter'
  if (needsEdgeWalk) {
    push(
      `Now look at how they are pushed together: ${rowStory(a, 'en')}. So the shape is ${a.width} ${a.width === 1 ? 'piece' : 'pieces'} across and ${a.height} ${a.height === 1 ? 'piece' : 'pieces'} down.`,
      `Sekarang lihat susunannya: ${rowStory(a, 'id')}. Jadi bentuknya ${a.width} keping ke samping dan ${a.height} keping ke bawah.`,
    )
    push(
      `Loose on the table, the ${a.count} pieces would show ${a.count} × 4 = ${a.count * 4} edges. But wherever two pieces touch, BOTH of those edges get shut inside and stop being part of the outline. There are ${a.joins} touching places here, so ${a.hiddenEdges} edges disappear.`,
      `Kalau ${a.count} keping itu terpisah semua, akan terlihat ${a.count} × 4 = ${a.count * 4} sisi. Tapi di setiap tempat dua keping bersentuhan, KEDUA sisi itu terkunci di dalam dan tidak lagi menjadi tepi luar. Di sini ada ${a.joins} tempat bersentuhan, jadi ${a.hiddenEdges} sisi hilang.`,
    )
    push(
      `Count what is left facing outside. In any column only the very top edge and the very bottom edge still show, and there are ${a.width} columns: 2 × ${a.width} = ${a.horizontalEdges} sideways edges. In any row only the far-left and the far-right edge still show, and there are ${a.height} rows: 2 × ${a.height} = ${a.verticalEdges} up-and-down edges. Check: ${a.count * 4} − ${a.hiddenEdges} = ${a.outlineEdges}, and ${a.horizontalEdges} + ${a.verticalEdges} = ${a.outlineEdges} too.`,
      `Hitung yang masih menghadap ke luar. Di setiap kolom hanya sisi paling atas dan paling bawah yang masih terlihat, dan kolomnya ada ${a.width}: 2 × ${a.width} = ${a.horizontalEdges} sisi mendatar. Di setiap baris hanya sisi paling kiri dan paling kanan yang masih terlihat, dan barisnya ada ${a.height}: 2 × ${a.height} = ${a.verticalEdges} sisi tegak. Cek: ${a.count * 4} − ${a.hiddenEdges} = ${a.outlineEdges}, dan ${a.horizontalEdges} + ${a.verticalEdges} = ${a.outlineEdges} juga.`,
    )
  }

  // 5 — the string, when the outline is the given and the piece is the unknown.
  if (params.given === 'shape-perimeter') {
    push(
      `The string lies along all ${a.outlineEdges} of those edges and every one of them is one side of one piece, so one side is ${a.shapePerimeter} ÷ ${a.outlineEdges} = ${a.pieceW} cm.`,
      `Tali itu menempel pada ${a.outlineEdges} sisi tadi, dan setiap sisi itu adalah satu sisi keping. Jadi satu sisi keping = ${a.shapePerimeter} ÷ ${a.outlineEdges} = ${a.pieceW} cm.`,
    )
  }

  // 6 — land on the answer.
  if (params.ask === 'perimeter') {
    if (params.piece === 'square') {
      push(
        `Every one of those ${a.outlineEdges} edges is ${a.pieceW} cm, so the perimeter is ${a.outlineEdges} × ${a.pieceW} = ${a.shapePerimeter} cm.`,
        `Setiap sisi dari ${a.outlineEdges} sisi itu panjangnya ${a.pieceW} cm, jadi kelilingnya ${a.outlineEdges} × ${a.pieceW} = ${a.shapePerimeter} cm.`,
      )
    } else {
      push(
        `Each sideways edge is ${a.pieceW} cm and each up-and-down edge is ${a.pieceH} cm, so the perimeter is ${a.horizontalEdges} × ${a.pieceW} + ${a.verticalEdges} × ${a.pieceH} = ${a.horizontalEdges * a.pieceW} + ${a.verticalEdges * a.pieceH} = ${a.shapePerimeter} cm.`,
        `Sisi mendatar panjangnya ${a.pieceW} cm dan sisi tegak panjangnya ${a.pieceH} cm, jadi kelilingnya ${a.horizontalEdges} × ${a.pieceW} + ${a.verticalEdges} × ${a.pieceH} = ${a.horizontalEdges * a.pieceW} + ${a.verticalEdges * a.pieceH} = ${a.shapePerimeter} cm.`,
      )
    }
  } else if (params.ask === 'area') {
    push(
      `Pushing pieces together hides edges, but it never hides any surface — the pieces do not overlap, so the shape covers exactly what the ${a.count} pieces cover.`,
      `Merapatkan keping menyembunyikan sisi, tapi tidak pernah menyembunyikan permukaan — kepingnya tidak tumpang tindih, jadi luas bentuknya persis luas ${a.count} keping itu.`,
    )
    push(
      `One piece covers ${a.pieceW} × ${a.pieceH} = ${a.pieceArea} cm², so ${a.count} pieces cover ${a.count} × ${a.pieceArea} = ${a.shapeArea} cm².`,
      `Satu keping luasnya ${a.pieceW} × ${a.pieceH} = ${a.pieceArea} cm², jadi ${a.count} keping luasnya ${a.count} × ${a.pieceArea} = ${a.shapeArea} cm².`,
    )
  }

  const hint_en =
    params.ask === 'perimeter'
      ? 'Every place two pieces touch buries two edges. Count only the edges still facing outside.'
      : params.ask === 'side'
        ? 'Work out how many piece-edges the string has to cover, then share the string equally between them.'
        : 'Joining pieces hides edges, never surface — add up what the pieces cover.'
  const hint_id =
    params.ask === 'perimeter'
      ? 'Setiap tempat dua keping bersentuhan mengubur dua sisi. Hitung hanya sisi yang masih menghadap ke luar.'
      : params.ask === 'side'
        ? 'Cari dulu berapa sisi keping yang harus ditempuh tali itu, lalu bagi talinya sama rata.'
        : 'Merapatkan keping menyembunyikan sisi, bukan permukaan — jumlahkan saja luas kepingnya.'

  return {
    body_en,
    body_id,
    answer_type: 'fill_in',
    choices_en: null,
    choices_id: null,
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
