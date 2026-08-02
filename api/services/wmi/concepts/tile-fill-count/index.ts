import { z } from 'zod'
import type { ConceptLogic, Rendered, Rng } from '../types.js'
import { buildTileFillCountBreakdown } from './breakdown.js'

// Covering a shape with copies of one small tile — Merdeka's "mengukur luas
// dengan satuan tidak baku", and the only grade-1 evidence the GE-AREA topic
// has in the WMI corpus (2019-semifinal-g1 #6, 2021-final-g1 #8,
// 2022-semifinal-g1 #1, 2023-semifinal-g1 #10, 2025-semifinal-g1 #13).
//
// THE rule this file exists to enforce: the number the child must reach is
// COUNTED OFF `cells` (and `filled`), never written down anywhere. `analyse()`
// below is the single place a count is produced; the stem, the hints, the
// breakdown, the figure and the explainer all read it (or read `cells`
// themselves). There is no field a careless edit could set to a number that
// disagrees with the drawn shape, because there is no such field.
//
// The half-square triangle tile is the one place arithmetic could drift from
// the drawing: two triangles make one grid square, so the tile count is exactly
// twice the square count. That factor lives in `tilesPerSquare()` and is used
// by every consumer; `index.test.ts` re-derives it from the tile name alone.

export const TILES = ['unit-square', 'half-square-triangle'] as const
export type Tile = (typeof TILES)[number]

export const ASKS = ['total', 'how-many-more', 'fewest-to-complete'] as const
export type Ask = (typeof ASKS)[number]

export type Lang = 'en' | 'id'

/** A grid square as [row, col]; row 0 = top, col 0 = left — Polyomino's frame. */
export type Cell = [number, number]

const key = (cell: Cell): string => `${cell[0]},${cell[1]}`
const byReadingOrder = (a: Cell, b: Cell): number => a[0] - b[0] || a[1] - b[1]

/** Two triangles make one square; one square tile makes one square. */
export function tilesPerSquare(tile: Tile): number {
  return tile === 'half-square-triangle' ? 2 : 1
}

// ── pure geometry, shared by the schema, the generator, render and the test ──

export function spanOf(cells: readonly Cell[]): { rows: number; cols: number } {
  if (cells.length === 0) return { rows: 0, cols: 0 }
  let maxR = 0
  let maxC = 0
  for (const [r, c] of cells) {
    if (r > maxR) maxR = r
    if (c > maxC) maxC = c
  }
  // Callers only ever pass normalised cell lists (min row and min col are 0),
  // which `paramsSchema` enforces, so the span is just the largest index + 1.
  return { rows: maxR + 1, cols: maxC + 1 }
}

/** True when every square touches another one edge-to-edge — one single piece. */
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

/** True when no row of the shape has a gap in it — "row 2 has 3 squares" is then unambiguous. */
export function hasSolidRows(cells: readonly Cell[]): boolean {
  const perRow = new Map<number, number[]>()
  for (const [r, c] of cells) {
    const list = perRow.get(r)
    if (list) list.push(c)
    else perRow.set(r, [c])
  }
  for (const cols of perRow.values()) {
    cols.sort((a, b) => a - b)
    if (cols[cols.length - 1] - cols[0] + 1 !== cols.length) return false
  }
  return true
}

/** The squares of the shape, grouped by row, top row first. */
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

/** Every square of the `side × side` box the shape sits in, reading order. */
export function boxCells(side: number): Cell[] {
  const out: Cell[] = []
  for (let r = 0; r < side; r++) for (let c = 0; c < side; c++) out.push([r, c])
  return out
}

// ── params ───────────────────────────────────────────────────────────────────

// zod 4 infers z.tuple([a, b]) as `[a?, b?, ...unknown[]]`, losing the
// fixed-length guarantee, so the inferred params stop satisfying `Cell`. The
// runtime schema really does accept exactly two bounded integers and nothing
// else — this only tells TypeScript what zod already enforces.
const cellSchema = z.tuple([
  z.number().int().min(0).max(7),
  z.number().int().min(0).max(7),
]) as unknown as z.ZodType<Cell>

/** The shape `analyse` needs. Declared structurally so a refinement may call it. */
export interface Shape {
  tile: Tile
  cells: Cell[]
  filled: Cell[]
  ask: Ask
}

const paramsSchema = z
  .object({
    tile: z.enum(TILES),
    /**
     * The shape, as the squares of the grid paper it covers. Normalised so the
     * top row is 0 and the left column is 0. THE source of every count.
     */
    cells: z.array(cellSchema).min(3).max(24),
    /** The squares already covered, a subset of `cells`. Empty unless `ask` is how-many-more. */
    filled: z.array(cellSchema).max(24),
    ask: z.enum(ASKS),
  })
  .refine((v) => new Set(v.cells.map(key)).size === v.cells.length, {
    message: 'the shape may not list the same square twice',
  })
  .refine(
    (v) => v.cells.some(([r]) => r === 0) && v.cells.some(([, c]) => c === 0),
    { message: 'the shape must be normalised: a square in row 0 and a square in column 0' },
  )
  .refine((v) => isConnected(v.cells), { message: 'the shape must be one connected piece' })
  .refine((v) => hasSolidRows(v.cells), { message: 'no row of the shape may have a gap' })
  .refine(
    (v) => {
      const inShape = new Set(v.cells.map(key))
      return (
        new Set(v.filled.map(key)).size === v.filled.length &&
        v.filled.every((cell) => inShape.has(key(cell)))
      )
    },
    { message: 'covered squares must be distinct squares of the shape' },
  )
  .refine((v) => (v.ask === 'how-many-more' ? v.filled.length > 0 : v.filled.length === 0), {
    message: 'only how-many-more starts with some squares already covered',
  })
  .refine((v) => v.filled.length < v.cells.length, {
    message: 'at least one square must still be uncovered, or there is nothing to ask',
  })
  // fewest-to-complete asks for the SMALLEST square the shape can grow into. That
  // is only a fair question when the answer is forced, and it is forced exactly
  // when the shape is already as wide as it is tall: a square must cover every
  // row and every column the shape reaches, so its side is at least
  // max(width, height), and when width = height the bounding box IS that square.
  // A wider-than-tall shape would leave the child arguing about which square.
  .refine(
    (v) => {
      if (v.ask !== 'fewest-to-complete') return true
      const span = spanOf(v.cells)
      return v.tile === 'unit-square' && span.rows === span.cols && v.cells.length < span.rows * span.cols
    },
    {
      message:
        'fewest-to-complete needs square tiles, a shape as wide as it is tall, and at least one hole',
    },
  )
  .refine((v) => {
    const n = countOf(v)
    return n >= 1 && n <= 24
  }, { message: 'the answer must be a countable number of tiles for a 6-year-old' })
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'tile-fill-count',
  name_en: 'How many tiles fill the shape',
  name_id: 'Berapa keping untuk menutup?',
  grades: [1, 2] as const,
  description_id:
    'Menghitung berapa keping ubin yang dibutuhkan untuk menutup sebuah bentuk di kertas kotak-kotak, termasuk berapa keping lagi yang kurang dan berapa paling sedikit tambahan agar menjadi persegi penuh.',
} as const

// ── the single place a count is produced ─────────────────────────────────────

export interface Analysis {
  /** The whole shape, reading order. */
  cells: Cell[]
  /** The squares already covered, reading order. */
  filled: Cell[]
  /** The squares of the shape nobody has covered yet. */
  empty: Cell[]
  /** Side of the smallest square the shape fits in (only meaningful when width = height). */
  boxSide: number
  /** Squares inside that box the shape does NOT reach — the holes to plug. */
  holes: Cell[]
  /** THE squares the question is about: whole shape / still empty / holes. */
  target: Cell[]
  /** `target` grouped by row, top first — the order the hints and the animation count in. */
  targetRows: { row: number; cells: Cell[] }[]
  /** 1 for a square tile, 2 for a half-square triangle. */
  perSquare: number
  /** How many grid squares must be covered. Counted, never authored. */
  squares: number
  /** Tiles = squares × perSquare. */
  tiles: number
  answer: string
}

/** Just the number, for the schema refinement (which cannot see `Params` yet). */
function countOf(shape: Shape): number {
  return analyse(shape).tiles
}

export function analyse(shape: Shape): Analysis {
  const cells = [...shape.cells].sort(byReadingOrder)
  const filledSet = new Set(shape.filled.map(key))
  const filled = cells.filter((cell) => filledSet.has(key(cell)))
  const empty = cells.filter((cell) => !filledSet.has(key(cell)))

  const span = spanOf(cells)
  const boxSide = Math.max(span.rows, span.cols)
  const inShape = new Set(cells.map(key))
  const holes = boxCells(boxSide).filter((cell) => !inShape.has(key(cell)))

  const target =
    shape.ask === 'total' ? cells : shape.ask === 'how-many-more' ? empty : holes
  const perSquare = tilesPerSquare(shape.tile)
  const squares = target.length
  const tiles = squares * perSquare

  return {
    cells,
    filled,
    empty,
    boxSide,
    holes,
    target,
    targetRows: groupRows(target),
    perSquare,
    squares,
    tiles,
    answer: String(tiles),
  }
}

/**
 * The one genuinely tempting wrong answer, or `null`. Ranked, because a triangle
 * question can carry two: forgetting that a triangle is only HALF a square is
 * the mistake that costs the most children the mark, so it wins when both apply.
 */
export function trapAnswer(shape: Shape, a: Analysis): string | null {
  if (a.perSquare > 1) return String(a.squares)
  if (shape.ask === 'how-many-more') return String(a.cells.length * a.perSquare)
  if (shape.ask === 'fewest-to-complete') return String(a.boxSide * a.boxSide * a.perSquare)
  return null
}

// ── generation ───────────────────────────────────────────────────────────────

/** Rows of a shape as contiguous runs, turned into the cell list itself. */
function fromRuns(runs: { start: number; len: number }[]): Cell[] {
  const cells: Cell[] = []
  runs.forEach((run, r) => {
    for (let i = 0; i < run.len; i++) cells.push([r, run.start + i])
  })
  const minC = Math.min(...cells.map(([, c]) => c))
  return cells.map(([r, c]) => [r, c - minC] as Cell).sort(byReadingOrder)
}

const REGION_KINDS = ['rectangle', 'staircase', 'ell', 'tee'] as const
type RegionKind = (typeof REGION_KINDS)[number]

function buildRegion(rng: Rng, kind: RegionKind): Cell[] {
  if (kind === 'rectangle') {
    const h = rng.int(2, 4)
    const w = rng.int(2, 4)
    return fromRuns(Array.from({ length: h }, () => ({ start: 0, len: w })))
  }
  if (kind === 'staircase') {
    const h = rng.int(2, 4)
    return fromRuns(Array.from({ length: h }, (_, r) => ({ start: 0, len: r + 1 })))
  }
  if (kind === 'ell') {
    const wTop = rng.int(1, 3)
    const wBottom = rng.int(wTop + 1, 4)
    const hTop = rng.int(1, 3)
    const hBottom = rng.int(1, 2)
    const runs = [
      ...Array.from({ length: hTop }, () => ({ start: 0, len: wTop })),
      ...Array.from({ length: hBottom }, () => ({ start: 0, len: wBottom })),
    ]
    return fromRuns(rng.int(0, 1) === 1 ? runs : [...runs].reverse())
  }
  // tee — one wide row with a stalk hanging from its middle
  const w = rng.pick([3, 5])
  const stalk = rng.int(1, 2)
  const mid = (w - 1) / 2
  const runs = [
    { start: 0, len: w },
    ...Array.from({ length: stalk }, () => ({ start: mid, len: 1 })),
  ]
  return fromRuns(rng.int(0, 1) === 1 ? runs : [...runs].reverse())
}

/**
 * An `n × n` square with an `a × b` bite taken out of the bottom-right corner.
 * Row 0 is still full and row n−1 still starts at column 0, so the shape still
 * reaches all n rows and all n columns — which is what makes n × n provably the
 * smallest square it can grow into.
 */
function buildNotchedSquare(n: number, a: number, b: number): Cell[] {
  const cells: Cell[] = []
  for (let r = 0; r < n; r++) {
    const len = r >= n - a ? n - b : n
    for (let c = 0; c < len; c++) cells.push([r, c])
  }
  return cells
}

function draft(rng: Rng): Params {
  const tile = rng.pick(TILES)
  const wanted = rng.pick(ASKS)
  // A triangle is half a SQUARE, so "grow it into a full square" would need the
  // child to hold two ideas at once; keep that ask on the square tile.
  const ask: Ask =
    tile === 'half-square-triangle' && wanted === 'fewest-to-complete'
      ? rng.pick(['total', 'how-many-more'] as const)
      : wanted

  if (ask === 'fewest-to-complete') {
    const n = rng.int(2, 4)
    const a = rng.int(1, n - 1)
    const bMax = Math.min(n - 1, Math.max(1, Math.floor(5 / a)))
    const b = rng.int(1, bMax)
    return { tile, cells: buildNotchedSquare(n, a, b), filled: [], ask }
  }

  const cells = buildRegion(rng, rng.pick(REGION_KINDS))
  if (ask === 'total') return { tile, cells, filled: [], ask }

  const sorted = [...cells].sort(byReadingOrder)
  // Covered squares are taken in reading order, so the finished part is always
  // the TOP of the shape and the part still to do is a clean bottom piece the
  // child can count row by row.
  const howMany = rng.int(1, sorted.length - 1)
  return { tile, cells, filled: sorted.slice(0, howMany), ask }
}

/** Pedagogy filter, not correctness — `paramsSchema` already rejects broken shapes. */
function isWorthAsking(p: Params): boolean {
  const span = spanOf(p.cells)
  const a = analyse(p)
  // A single row (or single column) is a counting warm-up, not a covering
  // problem: there is nothing to count row by row.
  if (p.ask !== 'fewest-to-complete' && (span.rows < 2 || span.cols < 2)) return false
  // Keep the numbers inside a six-year-old's counting range, and tighter for the
  // triangle tile because its answer is doubled.
  const ceiling = p.tile === 'half-square-triangle' ? 14 : 12
  if (a.tiles > ceiling) return false
  if (p.ask !== 'fewest-to-complete' && p.cells.length > (p.tile === 'half-square-triangle' ? 7 : 12)) {
    return false
  }
  // The counting has to be worth doing: one lonely square left over is a
  // question about noticing, not about counting.
  if (a.squares < 2) return false
  // …and it should really span rows, so the running total in the hints and the
  // row-by-row reveal in the animation have something to run over.
  if (a.targetRows.length < 2) return false
  return true
}

export function generate(rng: Rng): Params {
  let first: Params | null = null
  for (let attempt = 0; attempt < 200; attempt++) {
    const candidate = draft(rng)
    if (!paramsSchema.safeParse(candidate).success) continue
    if (first === null) first = candidate
    if (isWorthAsking(candidate)) return candidate
  }
  if (first !== null) return first
  // Every draft missed (vanishingly unlikely). A 2-by-3 rectangle of square
  // tiles is correct by construction.
  return {
    tile: 'unit-square',
    cells: [
      [0, 0], [0, 1], [0, 2],
      [1, 0], [1, 1], [1, 2],
    ],
    filled: [],
    ask: 'total',
  }
}

// ── rendering ────────────────────────────────────────────────────────────────

/** The sentence naming the tile. Exported so the breakdown can quote it exactly. */
export function tileClause(tile: Tile, lang: Lang): string {
  if (tile === 'half-square-triangle') {
    return lang === 'id'
      ? 'Satu keping berbentuk segitiga, dan dua keping disatukan menjadi satu kotak penuh pada kertas.'
      : 'Each tile is a triangle, and two tiles fit together to make one whole square of the grid.'
  }
  return lang === 'id'
    ? 'Satu keping berbentuk kotak kecil, persis sama besar dengan satu kotak pada kertas.'
    : 'Each tile is a small square, exactly the same size as one square of the grid.'
}

/**
 * The extra fact the ask needs, or `null` for the plain total. The
 * fewest-to-complete version quotes the shape's measured width and height,
 * which is the evidence that pins the big square down.
 */
export function setupClause(ask: Ask, boxSide: number, lang: Lang): string | null {
  if (ask === 'how-many-more') {
    return lang === 'id'
      ? 'Sebagian kotak pada bentuk itu sudah diwarnai, dan bagian itu sudah selesai.'
      : 'Some squares of the shape are already coloured in, and that part is finished.'
  }
  if (ask === 'fewest-to-complete') {
    return lang === 'id'
      ? `Bentuk itu paling lebar ${boxSide} kotak dan tingginya ${boxSide} kotak.`
      : `The shape is ${boxSide} squares across at its widest and ${boxSide} squares tall.`
  }
  return null
}

/** The question sentence, ending in "?". Exported so the breakdown can quote it. */
export function askClause(ask: Ask, lang: Lang): string {
  if (ask === 'how-many-more') {
    return lang === 'id'
      ? 'Berapa keping lagi yang masih dibutuhkan untuk menutup sisanya?'
      : 'How many more tiles do you still need to cover the rest?'
  }
  if (ask === 'fewest-to-complete') {
    return lang === 'id'
      ? 'Berapa paling sedikit keping yang harus ditambahkan agar bentuk itu menjadi persegi penuh?'
      : 'What is the fewest number of tiles you must add to make the shape a full square?'
  }
  return lang === 'id'
    ? 'Berapa keping yang dibutuhkan untuk menutup seluruh bentuk itu?'
    : 'How many tiles do you need to cover the whole shape?'
}

/** "1", "1 dan 2", "1, 2, dan 3" — plain lists for a six-year-old. */
function listId(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  if (items.length === 2) return `${items[0]} dan ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, dan ${items[items.length - 1]}`
}

function listEn(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

/**
 * "row 1 has 3, that makes 3; row 2 has 2, that makes 5" — the running total a
 * child can follow with a finger. Built from the grouped cell list, so the words
 * cannot say a different number from the picture.
 */
export function runningCount(rows: { row: number; cells: Cell[] }[], lang: Lang): string {
  let total = 0
  const parts = rows.map(({ row, cells }) => {
    total += cells.length
    return lang === 'id'
      ? `baris ${row + 1} ada ${cells.length}, jadi ${total}`
      : `row ${row + 1} has ${cells.length}, that makes ${total}`
  })
  return lang === 'id' ? listId(parts) : listEn(parts)
}

export function render(params: Params): Rendered {
  const a = analyse(params)
  const breakdown = buildTileFillCountBreakdown(params)
  const setup_en = setupClause(params.ask, a.boxSide, 'en')
  const setup_id = setupClause(params.ask, a.boxSide, 'id')

  // The `Find:` / `Cari:` markers are stripped before display; every breakdown
  // phrase is built against the stripped text and never spans a marker.
  const body_en = [
    'The shape in the picture is drawn on square grid paper.',
    tileClause(params.tile, 'en'),
    ...(setup_en ? [setup_en] : []),
    `Find: ${askClause(params.ask, 'en')}`,
  ].join(' ')
  const body_id = [
    'Bentuk pada gambar digambar di kertas kotak-kotak.',
    tileClause(params.tile, 'id'),
    ...(setup_id ? [setup_id] : []),
    `Cari: ${askClause(params.ask, 'id')}`,
  ].join(' ')

  // ── hint_steps: read the tile, decide which squares to count, then COUNT them
  // row by row with a running total. Nothing is announced; the last line is the
  // running total plus (for triangles) one doubling the child can also see.
  const steps_en: string[] = []
  const steps_id: string[] = []

  if (params.tile === 'half-square-triangle') {
    steps_en.push(
      'Look at the tile first. It is half a square: two tiles pushed together make one whole square of the grid paper. So count squares first, and turn squares into tiles at the end.',
    )
    steps_id.push(
      'Lihat kepingnya dulu. Kepingnya setengah kotak: dua keping yang dirapatkan menjadi satu kotak penuh di kertas. Jadi hitung kotaknya dulu, baru diubah menjadi keping di akhir.',
    )
  } else {
    steps_en.push(
      'Look at the tile first. It is exactly one square of the grid paper, so one tile covers one square and the number of tiles is just the number of squares.',
    )
    steps_id.push(
      'Lihat kepingnya dulu. Kepingnya persis satu kotak di kertas, jadi satu keping menutup satu kotak dan banyaknya keping sama dengan banyaknya kotak.',
    )
  }

  if (params.ask === 'how-many-more') {
    steps_en.push(
      'The coloured squares are already done, so they need no new tiles. Only the squares that are still white have to be counted.',
    )
    steps_id.push(
      'Kotak yang sudah diwarnai berarti sudah selesai, jadi tidak perlu keping baru. Yang dihitung hanya kotak yang masih putih.',
    )
  } else if (params.ask === 'fewest-to-complete') {
    steps_en.push(
      `A square that covers the shape has to be at least as wide as the shape and at least as tall, and the shape is ${a.boxSide} across and ${a.boxSide} down. So the smallest square it can grow into is ${a.boxSide} by ${a.boxSide}, and the tiles you add are exactly the empty squares inside it.`,
    )
    steps_id.push(
      `Persegi yang menutup bentuk itu paling tidak harus selebar bentuknya dan setinggi bentuknya, sedangkan bentuk itu ${a.boxSide} kotak ke samping dan ${a.boxSide} kotak ke bawah. Jadi persegi terkecil yang bisa dibuat adalah ${a.boxSide} kali ${a.boxSide}, dan keping yang ditambahkan tepat sebanyak kotak kosong di dalamnya.`,
    )
  }

  const countedNoun_en =
    params.ask === 'total' ? 'squares' : params.ask === 'how-many-more' ? 'white squares' : 'empty squares'
  const countedNoun_id =
    params.ask === 'total' ? 'kotak' : params.ask === 'how-many-more' ? 'kotak putih' : 'kotak kosong'

  steps_en.push(
    `Now count them row by row from the top, keeping the total in your head: ${runningCount(a.targetRows, 'en')}. That is ${a.squares} ${countedNoun_en}.`,
  )
  steps_id.push(
    `Sekarang hitung baris demi baris dari atas sambil mengingat jumlahnya: ${runningCount(a.targetRows, 'id')}. Jadi ada ${a.squares} ${countedNoun_id}.`,
  )

  if (params.ask === 'how-many-more') {
    steps_en.push(
      `Check it the other way round: the whole shape is ${a.cells.length} squares and ${a.filled.length} are already coloured, and ${a.cells.length} − ${a.filled.length} = ${a.squares}. Same number.`,
    )
    steps_id.push(
      `Cek dengan cara sebaliknya: seluruh bentuk ada ${a.cells.length} kotak dan ${a.filled.length} sudah diwarnai, dan ${a.cells.length} − ${a.filled.length} = ${a.squares}. Hasilnya sama.`,
    )
  }

  if (params.tile === 'half-square-triangle') {
    steps_en.push(
      `Every one of those squares takes 2 triangle tiles, so lay 2 on each: ${a.squares} + ${a.squares} = ${a.tiles}. You need ${a.tiles} tiles.`,
    )
    steps_id.push(
      `Setiap kotak itu butuh 2 keping segitiga, jadi pasang 2 di tiap kotak: ${a.squares} + ${a.squares} = ${a.tiles}. Dibutuhkan ${a.tiles} keping.`,
    )
  } else {
    steps_en.push(
      `One tile per square, so ${a.squares} squares take ${a.tiles} tiles.`,
    )
    steps_id.push(
      `Satu keping untuk satu kotak, jadi ${a.squares} kotak butuh ${a.tiles} keping.`,
    )
  }

  const hint_en =
    params.tile === 'half-square-triangle'
      ? 'Count grid squares first, row by row — then remember every square swallows two triangle tiles.'
      : params.ask === 'total'
        ? 'Count the squares of the shape row by row and keep a running total; one tile covers one square.'
        : params.ask === 'how-many-more'
          ? 'The coloured squares are finished. Count only the white ones, row by row.'
          : 'Draw the smallest square the shape reaches, then count the empty squares left inside it.'
  const hint_id =
    params.tile === 'half-square-triangle'
      ? 'Hitung dulu kotaknya baris demi baris — lalu ingat setiap kotak menelan dua keping segitiga.'
      : params.ask === 'total'
        ? 'Hitung kotak pada bentuk itu baris demi baris sambil menjumlah; satu keping menutup satu kotak.'
        : params.ask === 'how-many-more'
          ? 'Kotak yang sudah diwarnai sudah selesai. Hitung hanya kotak yang masih putih, baris demi baris.'
          : 'Bayangkan persegi terkecil yang dicapai bentuk itu, lalu hitung kotak kosong yang tersisa di dalamnya.'

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
