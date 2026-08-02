import { z } from 'zod'
import type { ConceptLogic, Rendered, Rng, WmiChoice } from '../types.js'
import { buildPiecesFillRegionBreakdown } from './breakdown.js'

// A board is tiled except for one hole. Which offered piece — or pair of pieces
// — drops into that hole exactly? A piece may be TURNED to any of its four
// quarter turns, but never FLIPPED. That single rule is the whole concept: the
// mirror image of the winning piece is always on the table, it looks completely
// right, and no amount of turning will ever seat it. Children who "see" the
// shape instead of checking its handedness pick it every time.
//
// The three wrong options are never filler — each one dies to a different
// concrete check a child can actually perform:
//   count — it has the wrong number of squares
//   run   — its longest straight line of squares is longer than any straight
//           line inside the hole, so it cannot even sit INSIDE the hole
//   flip  — it is the mirror image of the winner (right squares, wrong hand)
export const ASKS = ['single-piece', 'pair-of-pieces'] as const
export type Ask = (typeof ASKS)[number]

export const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const

export const REGION_KINDS = ['rectangle', 'square', 'ell', 'staircase'] as const
export type RegionKind = (typeof REGION_KINDS)[number]

const NAMES = ['Budi', 'Siti', 'Ayu', 'Rian', 'Dewi', 'Tono', 'Nadia', 'Fajar'] as const

export type Lang = 'en' | 'id'

/** A grid square as [row, col]; row 0 = top, col 0 = left (Polyomino's frame). */
export type Cell = [number, number]

// ── pure geometry (shared by the generator, the schema, render and the test) ──

const id = (cell: Cell): string => `${cell[0]},${cell[1]}`

export function normalize(cells: readonly Cell[]): Cell[] {
  if (cells.length === 0) return []
  let minR = Infinity
  let minC = Infinity
  for (const [r, c] of cells) {
    if (r < minR) minR = r
    if (c < minC) minC = c
  }
  return cells
    .map(([r, c]) => [r - minR, c - minC] as Cell)
    .sort((a, b) => a[0] - b[0] || a[1] - b[1])
}

/** One quarter turn clockwise: (r, c) → (c, −r), then re-anchored at (0, 0). */
export function rotate90(cells: readonly Cell[]): Cell[] {
  return normalize(cells.map(([r, c]) => [c, -r] as Cell))
}

/** The four quarter turns, in order. Index k = k quarter turns from `cells`. */
export function rotations(cells: readonly Cell[]): Cell[][] {
  const out: Cell[][] = []
  let cur = normalize(cells)
  for (let i = 0; i < 4; i++) {
    out.push(cur)
    cur = rotate90(cur)
  }
  return out
}

/** Mirror across a vertical line. NEVER applied when seating a piece — only to
 *  build the trap option, because a flip is exactly what the rule forbids. */
export function reflect(cells: readonly Cell[]): Cell[] {
  return normalize(cells.map(([r, c]) => [r, -c] as Cell))
}

export const shapeKey = (cells: readonly Cell[]): string => normalize(cells).map(id).join(' ')

/** Canonical name of a shape UNDER TURNS ONLY — mirror images get different keys. */
export function turnKey(cells: readonly Cell[]): string {
  return rotations(cells).map(shapeKey).sort()[0]
}

/** True when the mirror image is not reachable by turning — the trap is real. */
export function isChiral(cells: readonly Cell[]): boolean {
  return turnKey(cells) !== turnKey(reflect(cells))
}

/**
 * The longest straight line of touching squares, horizontally or vertically.
 * Turning a shape swaps its rows and columns, so this number never changes —
 * which is what makes it a fair thing to compare a piece against a hole. If a
 * piece's longest line is longer than the hole's, the piece cannot sit inside
 * the hole in ANY turn (its line would have to be a line inside the hole).
 */
export function longestRun(cells: readonly Cell[]): number {
  const set = new Set(cells.map(id))
  let best = 0
  for (const [r, c] of cells) {
    if (!set.has(id([r, c - 1]))) {
      let k = 0
      while (set.has(id([r, c + k]))) k++
      if (k > best) best = k
    }
    if (!set.has(id([r - 1, c]))) {
      let k = 0
      while (set.has(id([r + k, c]))) k++
      if (k > best) best = k
    }
  }
  return best
}

export function isConnected(cells: readonly Cell[]): boolean {
  if (cells.length === 0) return false
  const set = new Set(cells.map(id))
  const seen = new Set<string>([id(cells[0])])
  const queue: Cell[] = [cells[0]]
  while (queue.length > 0) {
    const [r, c] = queue.pop() as Cell
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
      const next: Cell = [r + dr, c + dc]
      const k = id(next)
      if (set.has(k) && !seen.has(k)) {
        seen.add(k)
        queue.push(next)
      }
    }
  }
  return seen.size === cells.length
}

/** Distinct turns of a shape (a symmetric shape has fewer than four). */
export function distinctTurns(cells: readonly Cell[]): Cell[][] {
  const seen = new Set<string>()
  const out: Cell[][] = []
  for (const rot of rotations(cells)) {
    const k = shapeKey(rot)
    if (!seen.has(k)) {
      seen.add(k)
      out.push(rot)
    }
  }
  return out
}

/**
 * Brute force, TURNS ONLY: can `pieces` cover every square of `hole` exactly
 * once, with nothing sticking out? Reflections are deliberately never tried —
 * the whole question hangs on a mirrored piece being wrong.
 *
 * Search order is forced: the topmost-then-leftmost uncovered square must be
 * covered by some piece, and because that square is the smallest one left, it
 * must be that piece's OWN topmost-then-leftmost square. So each step has at
 * most (pieces × 4 turns) placements to try. Holes are ≤ 8 squares, so this is
 * a handful of tries — cheap enough to run inside the schema.
 */
export function tiles(hole: readonly Cell[], pieces: readonly Cell[][]): boolean {
  const total = pieces.reduce((sum, p) => sum + p.length, 0)
  if (total !== hole.length) return false
  const turns = pieces.map((p) => distinctTurns(p))
  return cover(new Set(hole.map(id)), turns)
}

function cover(remaining: Set<string>, turns: Cell[][][]): boolean {
  if (remaining.size === 0) return turns.length === 0
  if (turns.length === 0) return false

  let anchor: Cell | null = null
  for (const k of remaining) {
    const [r, c] = k.split(',').map(Number) as Cell
    if (!anchor || r < anchor[0] || (r === anchor[0] && c < anchor[1])) anchor = [r, c]
  }
  if (!anchor) return false

  for (let i = 0; i < turns.length; i++) {
    const rest = turns.filter((_, j) => j !== i)
    for (const turn of turns[i]) {
      // turn[0] is the piece's own topmost-then-leftmost square (normalize sorts).
      const dr = anchor[0] - turn[0][0]
      const dc = anchor[1] - turn[0][1]
      const placed = turn.map(([r, c]) => id([r + dr, c + dc]))
      if (!placed.every((k) => remaining.has(k))) continue
      const next = new Set(remaining)
      for (const k of placed) next.delete(k)
      if (cover(next, rest)) return true
    }
  }
  return false
}

/** Which of the offered options actually fill the hole. Must be exactly one. */
export function fittingOptions(hole: readonly Cell[], options: readonly Cell[][][]): number[] {
  const out: number[] = []
  options.forEach((pieces, i) => {
    if (tiles(hole, pieces)) out.push(i)
  })
  return out
}

// ── params ──────────────────────────────────────────────────────────────────

// `z.tuple([...])` infers as `[number?, number?, ...unknown[]]` under this zod,
// which poisons every helper call, so a length-2 array carries a cell instead.
const cell = z.array(z.number().int().min(-4).max(15)).length(2)

/** Params carry cells as plain length-2 arrays; the geometry works on `Cell`. */
export const asCells = (raw: readonly (readonly number[])[]): Cell[] =>
  raw.map(([r, c]) => [r, c] as Cell)

const paramsSchema = z
  .object({
    ask: z.enum(ASKS),
    regionKind: z.enum(REGION_KINDS),
    /** Every square of the board, hole included. 4–16 squares. */
    region: z.array(cell).min(4).max(16),
    /** The empty squares inside the board that must be filled. */
    hole: z.array(cell).min(3).max(8),
    /** Four offered options; each holds one piece, or two for the pair ask. */
    options: z.array(z.array(z.array(cell)).min(1).max(2)).length(4),
    answerIndex: z.number().int().min(0).max(3),
    actor: z.string().min(1),
  })
  .refine((v) => new Set(v.region.map((c) => id(c as Cell))).size === v.region.length, {
    message: 'the board may not list the same square twice',
  })
  .refine((v) => new Set(v.hole.map((c) => id(c as Cell))).size === v.hole.length, {
    message: 'the hole may not list the same square twice',
  })
  .refine((v) => isConnected(asCells(v.region)) && isConnected(asCells(v.hole)), {
    message: 'the board and the hole must each be one joined-up piece',
  })
  .refine(
    (v) => {
      const board = new Set(v.region.map((c) => id(c as Cell)))
      return v.hole.every((c) => board.has(id(c as Cell)))
    },
    { message: 'every hole square must be a square of the board' },
  )
  .refine((v) => v.region.length > v.hole.length, {
    message: 'the board must have at least one tiled square left around the hole',
  })
  // The board's silhouette has to match the word the stem uses for it.
  .refine(
    (v) => {
      const cells = normalize(asCells(v.region))
      const spanR = Math.max(...cells.map((c) => c[0])) + 1
      const spanC = Math.max(...cells.map((c) => c[1])) + 1
      const isFullRect = cells.length === spanR * spanC
      if (v.regionKind === 'square') return isFullRect && spanR === spanC
      if (v.regionKind === 'rectangle') return isFullRect
      return !isFullRect
    },
    { message: 'the board shape must match the name the question gives it' },
  )
  .refine(
    (v) => v.options.every((o) => o.length === (v.ask === 'pair-of-pieces' ? 2 : 1)),
    { message: 'the single ask offers one piece per option, the pair ask offers two' },
  )
  .refine(
    (v) =>
      v.options.every((o) =>
        o.every((p) => p.length >= 2 && p.length <= 6 && isConnected(asCells(p))),
      ),
    { message: 'every piece is 2–6 joined-up squares' },
  )
  // Two options that are the same shapes (just drawn turned) would give a child
  // two identical answers to choose between.
  .refine(
    (v) =>
      new Set(
        v.options.map((o) =>
          o
            .map((p) => turnKey(asCells(p)))
            .sort()
            .join(' | '),
        ),
      ).size === 4,
    { message: 'no two options may be the same set of pieces' },
  )
  // THE fairness gate: turning only (never flipping), exactly one option fills
  // the hole — and it is the one marked as the answer.
  .refine(
    (v) => {
      const hits = fittingOptions(asCells(v.hole), v.options.map((o) => o.map(asCells)))
      return hits.length === 1 && hits[0] === v.answerIndex
    },
    { message: 'exactly one option may fill the hole by turning alone, and it must be the marked one' },
  )
  // Every wrong option must die to its own concrete check, so the hint steps can
  // rule them out one at a time instead of just naming the winner.
  .refine(
    (v) => {
      const hole = asCells(v.hole)
      const holeRun = longestRun(hole)
      const reasons = v.options
        .map((o, i) => (i === v.answerIndex ? null : lossReason(o.map(asCells), hole.length, holeRun)))
        .filter((r): r is LossReason => r !== null)
      return new Set(reasons).size === 3
    },
    { message: 'the three wrong options must fail for three different reasons' },
  )
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'pieces-fill-region',
  name_en: 'Which piece fits the hole',
  name_id: 'Kepingan mana yang pas?',
  grades: [1, 2, 3] as const,
  description_id:
    'Memilih kepingan — atau pasangan kepingan — yang tepat mengisi lubang pada sebuah papan. Kepingan boleh diputar, tetapi tidak boleh dibalik.',
} as const

// ── derivation: everything render / breakdown / steps read ───────────────────

export type LossReason = 'count' | 'run' | 'flip'

/** Why an option fails, checked in the order a child would check it. */
export function lossReason(pieces: Cell[][], holeCells: number, holeRun: number): LossReason {
  const squares = pieces.reduce((sum, p) => sum + p.length, 0)
  if (squares !== holeCells) return 'count'
  if (Math.max(...pieces.map(longestRun)) > holeRun) return 'run'
  return 'flip'
}

export interface OptionInfo {
  label: string
  pieces: Cell[][]
  /** Total squares across the option's pieces. */
  squares: number
  /** Squares per piece, as drawn — "3 + 4" for a pair. */
  split: string
  /** The longest straight line of squares in the option's longest piece. */
  run: number
  fits: boolean
  reason: LossReason | null
}

export interface Derived {
  ask: Ask
  /** Squares in the hole. */
  n: number
  /** The longest straight line of squares anywhere in the hole. */
  holeRun: number
  regionKind: RegionKind
  boardSquares: number
  options: OptionInfo[]
  answerLabel: string
  winner: OptionInfo
  countLoser: OptionInfo | null
  runLoser: OptionInfo | null
  flipLoser: OptionInfo | null
  /** Single ask only: quarter turns that seat the drawn winner. 0 = as drawn. */
  turnsToSeat: number
  answer: string
}

export function derive(params: Params): Derived {
  const { ask, options, answerIndex, regionKind } = params
  const hole = asCells(params.hole)
  const n = hole.length
  const holeRun = longestRun(hole)

  const infos: OptionInfo[] = options.map((raw, i) => {
    const pieces = raw.map(asCells)
    const squares = pieces.reduce((sum, p) => sum + p.length, 0)
    const fits = i === answerIndex
    return {
      label: OPTION_LABELS[i],
      pieces,
      squares,
      split: pieces.map((p) => p.length).join(' + '),
      run: Math.max(...pieces.map(longestRun)),
      fits,
      reason: fits ? null : lossReason(pieces, n, holeRun),
    }
  })

  const byReason = (reason: LossReason) => infos.find((o) => o.reason === reason) ?? null

  // Honest count of the turns that seat the drawn winner — searched, not assumed.
  let turnsToSeat = 0
  if (ask === 'single-piece') {
    const target = shapeKey(hole)
    const found = rotations(infos[answerIndex].pieces[0]).findIndex((r) => shapeKey(r) === target)
    turnsToSeat = found < 0 ? 0 : found
  }

  return {
    ask,
    n,
    holeRun,
    regionKind,
    boardSquares: params.region.length,
    options: infos,
    answerLabel: OPTION_LABELS[answerIndex],
    winner: infos[answerIndex],
    countLoser: byReason('count'),
    runLoser: byReason('run'),
    flipLoser: byReason('flip'),
    turnsToSeat,
    answer: OPTION_LABELS[answerIndex],
  }
}

// ── wording helpers ─────────────────────────────────────────────────────────

export function boardWord(kind: RegionKind, lang: Lang): string {
  if (lang === 'id') {
    return {
      rectangle: 'papan persegi panjang',
      square: 'papan persegi',
      ell: 'papan berbentuk L',
      staircase: 'papan bertangga',
    }[kind]
  }
  return {
    rectangle: 'a rectangular board',
    square: 'a square board',
    ell: 'an L-shaped board',
    staircase: 'a staircase board',
  }[kind]
}

/** English article for a square count — holes here run 3…8, and 8 takes "an". */
export function aOrAn(n: number): string {
  return n === 8 ? 'an' : 'a'
}

export function turnWord(turns: number, lang: Lang): string {
  if (lang === 'id') {
    return ['tanpa diputar sama sekali', 'seperempat putaran', 'setengah putaran', 'tiga perempat putaran'][
      turns % 4
    ]
  }
  return ['without turning it at all', 'a quarter turn', 'a half turn', 'three quarter turns'][turns % 4]
}

// ── the shape catalogue ─────────────────────────────────────────────────────

// Every free polyomino this concept ever draws. Chirality and longest-run are
// COMPUTED from these lists, never hand-declared, so the catalogue cannot drift
// out of step with the rules the generator relies on.
export const CATALOG: Cell[][] = [
  [[0, 0], [0, 1]], // domino
  [[0, 0], [0, 1], [0, 2]], // I3
  [[0, 0], [1, 0], [1, 1]], // L3
  [[0, 0], [0, 1], [0, 2], [0, 3]], // I4
  [[0, 0], [0, 1], [1, 0], [1, 1]], // O4 (square)
  [[0, 0], [0, 1], [0, 2], [1, 1]], // T4
  [[0, 0], [1, 0], [2, 0], [2, 1]], // L4
  [[0, 1], [0, 2], [1, 0], [1, 1]], // S4
  [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]], // I5
  [[0, 0], [1, 0], [2, 0], [3, 0], [3, 1]], // L5
  [[0, 1], [1, 0], [1, 1], [2, 1], [3, 1]], // Y5
  [[0, 0], [0, 1], [0, 2], [1, 1], [2, 1]], // T5
  [[0, 0], [0, 2], [1, 0], [1, 1], [1, 2]], // U5
  [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2]], // V5
  [[0, 0], [0, 1], [1, 0], [1, 1], [2, 0]], // P5
  [[0, 1], [0, 2], [1, 0], [1, 1], [2, 1]], // F5
  [[0, 0], [0, 1], [1, 1], [2, 1], [2, 2]], // Z5
  [[0, 1], [1, 1], [2, 0], [2, 1], [3, 0]], // N5
]

/** Winners must be chiral, or the mirror trap would silently be a right answer. */
const WINNER_SHAPES = CATALOG.filter((p) => p.length >= 4 && p.length <= 5 && isChiral(p))
/** Partners for the pair ask — any small shape, chirality not required. */
const PARTNER_SHAPES = CATALOG.filter((p) => p.length >= 2 && p.length <= 4)

// ── generation ──────────────────────────────────────────────────────────────

/** A same-size shape whose longest straight line is longer than the hole's. */
function pickRunLoser(rng: Rng, size: number, holeRun: number): Cell[] | null {
  const pool = CATALOG.filter((p) => p.length === size && longestRun(p) > holeRun)
  return pool.length > 0 ? rng.pick(pool) : null
}

function growByOne(rng: Rng, cells: Cell[]): Cell[] | null {
  const set = new Set(cells.map(id))
  const seen = new Set<string>()
  const spots: Cell[] = []
  for (const [r, c] of cells) {
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
      const next: Cell = [r + dr, c + dc]
      const k = id(next)
      if (!set.has(k) && !seen.has(k)) {
        seen.add(k)
        spots.push(next)
      }
    }
  }
  return spots.length > 0 ? normalize([...cells, rng.pick(spots)]) : null
}

function shrinkByOne(rng: Rng, cells: Cell[]): Cell[] | null {
  const keepers = cells.filter((_, i) => {
    const rest = cells.filter((_, j) => j !== i)
    return rest.length >= 2 && isConnected(rest)
  })
  if (keepers.length === 0) return null
  const drop = rng.pick(keepers)
  return normalize(cells.filter((c) => c !== drop))
}

/**
 * Draw a shape in a random turn, so the winner is never the giveaway. With
 * `avoidAsIs` the drawn turn is never the shape's own orientation, which is how
 * the winning piece is kept from sitting on the page already lined up.
 */
function drawTurned(rng: Rng, cells: Cell[], avoidAsIs = false): Cell[] {
  const turns = distinctTurns(cells)
  const lo = avoidAsIs && turns.length > 1 ? 1 : 0
  return turns[rng.int(lo, turns.length - 1)]
}

interface Board {
  region: Cell[]
  hole: Cell[]
  regionKind: RegionKind
}

/**
 * Wraps a board around the hole: the hole keeps its shape and the board grows
 * around it, then optionally loses a corner (L) or a triangle (staircase). Both
 * lists come back in ONE shared frame, anchored at the board's top-left square,
 * so the illustration can lay the hole straight onto the board.
 */
function buildBoard(rng: Rng, holeShape: Cell[]): Board | null {
  const base = normalize(holeShape)
  const spanR = Math.max(...base.map((c) => c[0])) + 1
  const spanC = Math.max(...base.map((c) => c[1])) + 1
  if (spanR > 4 || spanC > 4) return null
  const holeFillsItsBox = base.length === spanR * spanC

  for (let attempt = 0; attempt < 40; attempt++) {
    const er = rng.int(0, 2)
    const ec = rng.int(0, 2)
    if (holeFillsItsBox && er + ec === 0) continue
    const H = spanR + er
    const W = spanC + ec
    if (H < 2 || W < 2 || H * W < 4 || H * W > 16) continue

    const offR = rng.int(0, er)
    const offC = rng.int(0, ec)
    const hole = base.map(([r, c]) => [r + offR, c + offC] as Cell)
    const holeIds = new Set(hole.map(id))

    const full: Cell[] = []
    for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) full.push([r, c])
    if (full.length <= hole.length) continue

    const wanted = rng.pick(['rectangle', 'ell', 'staircase'] as const)
    let region: Cell[] | null = null
    let kind: RegionKind = H === W ? 'square' : 'rectangle'

    if (wanted === 'ell') {
      const br = rng.int(1, H - 1)
      const bc = rng.int(1, W - 1)
      const fromBottom = rng.int(0, 1) === 1
      const fromRight = rng.int(0, 1) === 1
      const bite = new Set<string>()
      for (let i = 0; i < br; i++) {
        for (let j = 0; j < bc; j++) {
          bite.add(id([fromBottom ? H - 1 - i : i, fromRight ? W - 1 - j : j]))
        }
      }
      const cand = full.filter((c) => !bite.has(id(c)))
      if (
        cand.length > hole.length &&
        cand.length >= 4 &&
        hole.every((c) => !bite.has(id(c))) &&
        isConnected(cand)
      ) {
        region = cand
        kind = 'ell'
      }
    } else if (wanted === 'staircase') {
      const limit = Math.max(H, W) - 1
      const fromBottom = rng.int(0, 1) === 1
      const fromRight = rng.int(0, 1) === 1
      const cand = full.filter(([r, c]) => {
        const rr = fromBottom ? H - 1 - r : r
        const cc = fromRight ? W - 1 - c : c
        return rr + cc <= limit
      })
      const keep = new Set(cand.map(id))
      if (
        cand.length > hole.length &&
        cand.length >= 4 &&
        cand.length < full.length &&
        [...holeIds].every((k) => keep.has(k)) &&
        isConnected(cand)
      ) {
        region = cand
        kind = 'staircase'
      }
    }

    if (!region) region = full

    // Re-anchor both lists on the board's top-left square, together.
    const minR = Math.min(...region.map((c) => c[0]))
    const minC = Math.min(...region.map((c) => c[1]))
    const shift = (cells: Cell[]) => cells.map(([r, c]) => [r - minR, c - minC] as Cell)
    return { region: shift(region), hole: shift(hole), regionKind: kind }
  }
  return null
}

function assemble(
  rng: Rng,
  ask: Ask,
  actor: string,
  board: Board,
  winner: Cell[][],
  losers: Cell[][][],
): Params | null {
  const answerIndex = rng.int(0, 3)
  const options = [...losers]
  options.splice(answerIndex, 0, winner)
  const candidate = { ask, regionKind: board.regionKind, region: board.region, hole: board.hole, options, answerIndex, actor }
  // Everything a draw can get wrong is already a schema rule, so the schema is
  // the gate: a candidate that fails it is simply discarded and the caller redraws.
  return paramsSchema.safeParse(candidate).success ? (candidate as Params) : null
}

function trySingle(rng: Rng, actor: string): Params | null {
  const shape = rng.pick(WINNER_SHAPES)
  const hole = rng.int(0, 1) === 1 ? reflect(shape) : normalize(shape)
  const holeRun = longestRun(hole)

  const runShape = pickRunLoser(rng, hole.length, holeRun)
  if (!runShape) return null
  const countShape = rng.int(0, 1) === 1 ? growByOne(rng, hole) : shrinkByOne(rng, hole)
  if (!countShape) return null

  const board = buildBoard(rng, hole)
  if (!board) return null

  const losers = rng.shuffle([
    [drawTurned(rng, countShape)],
    [drawTurned(rng, runShape)],
    [drawTurned(rng, reflect(hole))],
  ])
  return assemble(rng, 'single-piece', actor, board, [drawTurned(rng, hole, true)], losers)
}

function tryPair(rng: Rng, actor: string): Params | null {
  const anchorShape = rng.pick(WINNER_SHAPES)
  const anchor = rng.int(0, 1) === 1 ? reflect(anchorShape) : normalize(anchorShape)
  const partnerShape = rng.pick(PARTNER_SHAPES)
  const total = anchor.length + partnerShape.length
  if (total < 6 || total > 8) return null

  // Slide the partner around the anchor until the two touch without overlapping.
  const anchorIds = new Set(anchor.map(id))
  const seats: Cell[][] = []
  for (const turn of distinctTurns(partnerShape)) {
    for (let dr = -4; dr <= 4; dr++) {
      for (let dc = -4; dc <= 4; dc++) {
        const placed = turn.map(([r, c]) => [r + dr, c + dc] as Cell)
        if (placed.some((c) => anchorIds.has(id(c)))) continue
        const union = [...anchor, ...placed]
        if (!isConnected(union)) continue
        const spanR = Math.max(...union.map((c) => c[0])) - Math.min(...union.map((c) => c[0])) + 1
        const spanC = Math.max(...union.map((c) => c[1])) - Math.min(...union.map((c) => c[1])) + 1
        if (spanR > 4 || spanC > 4) continue
        seats.push(placed)
      }
    }
  }
  if (seats.length === 0) return null

  const partner = rng.pick(seats)
  const hole = normalize([...anchor, ...partner])
  const holeRun = longestRun(hole)
  const partnerShapeNorm = normalize(partner)

  // The mirror trap has to be a genuine miss: the flipped anchor plus the same
  // partner must NOT find some other way to tile the hole.
  const flipped = reflect(anchor)
  if (tiles(hole, [flipped, partnerShapeNorm])) return null

  // The run loser replaces whichever piece has a same-size, longer-line stand-in.
  const runForAnchor = pickRunLoser(rng, anchor.length, holeRun)
  const runForPartner = pickRunLoser(rng, partnerShapeNorm.length, holeRun)
  const runPair =
    runForAnchor && (rng.int(0, 1) === 1 || !runForPartner)
      ? [runForAnchor, partnerShapeNorm]
      : runForPartner
        ? [anchor, runForPartner]
        : null
  if (!runPair) return null

  const growAnchor = rng.int(0, 1) === 1
  const grown = growByOne(rng, growAnchor ? anchor : partnerShapeNorm)
  if (!grown) return null
  const countPair = growAnchor ? [grown, partnerShapeNorm] : [anchor, grown]

  const board = buildBoard(rng, hole)
  if (!board) return null

  const draw = (pair: Cell[][]) => rng.shuffle(pair.map((p) => drawTurned(rng, p)))
  const losers = rng.shuffle([draw(countPair), draw(runPair), draw([flipped, partnerShapeNorm])])
  return assemble(rng, 'pair-of-pieces', actor, board, draw([anchor, partnerShapeNorm]), losers)
}

// A verified board per ask, used only if 200 draws in a row all collide. Both
// satisfy the schema (asserted in index.test.ts), so `generate` can never hand
// back params that fail to parse.
export const FALLBACKS: Record<Ask, Params> = {
  // 3×3 board, an L-shaped hole down the left edge.
  'single-piece': {
    ask: 'single-piece',
    regionKind: 'square',
    region: [
      [0, 0], [0, 1], [0, 2],
      [1, 0], [1, 1], [1, 2],
      [2, 0], [2, 1], [2, 2],
    ],
    hole: [[0, 0], [1, 0], [2, 0], [2, 1]],
    options: [
      [[[0, 0], [0, 1], [1, 1]]], // count: only 3 squares
      [[[0, 0], [0, 1], [0, 2], [0, 3]]], // run: a straight line of 4
      [[[0, 0], [0, 1], [1, 0], [2, 0]]], // flip: the mirrored L
      [[[0, 0], [0, 1], [1, 1], [2, 1]]], // the winner, drawn already turned
    ],
    answerIndex: 3,
    actor: 'Budi',
  },
  // 3×3 board, a 6-square hole filled by a domino plus an S-piece.
  'pair-of-pieces': {
    ask: 'pair-of-pieces',
    regionKind: 'square',
    region: [
      [0, 0], [0, 1], [0, 2],
      [1, 0], [1, 1], [1, 2],
      [2, 0], [2, 1], [2, 2],
    ],
    hole: [[0, 1], [0, 2], [1, 0], [1, 1], [2, 0], [2, 1]],
    options: [
      [[[0, 0], [1, 0], [1, 1], [2, 1]], [[0, 0], [1, 0], [2, 0]]], // count: 7 squares
      [[[0, 0], [0, 1]], [[0, 0], [1, 0], [2, 0], [3, 0]]], // run: a straight line of 4
      [[[0, 0], [1, 0]], [[0, 0], [1, 0], [1, 1], [2, 1]]], // the winner
      [[[0, 0], [0, 1], [1, 1], [1, 2]], [[0, 0], [1, 0]]], // flip: the mirrored S
    ],
    answerIndex: 2,
    actor: 'Dewi',
  },
}

export function generate(rng: Rng): Params {
  const ask = rng.pick(ASKS)
  const actor = rng.pick(NAMES)
  for (let attempt = 0; attempt < 200; attempt++) {
    const cand = ask === 'single-piece' ? trySingle(rng, actor) : tryPair(rng, actor)
    if (cand) return cand
  }
  return { ...FALLBACKS[ask], actor }
}

// ── render ──────────────────────────────────────────────────────────────────

function choicesFor(d: Derived, lang: Lang): WmiChoice[] {
  return d.options.map((o) => ({
    label: o.label,
    text:
      lang === 'id'
        ? d.ask === 'pair-of-pieces'
          ? `Pasangan ${o.label} (${o.split} kotak)`
          : `Kepingan ${o.label} (${o.split} kotak)`
        : d.ask === 'pair-of-pieces'
          ? `Pair ${o.label} (${o.split} squares)`
          : `Piece ${o.label} (${o.split} squares)`,
  }))
}

export function render(params: Params): Rendered {
  const d = derive(params)
  const breakdown = buildPiecesFillRegionBreakdown(params)
  const { actor } = params
  const pair = d.ask === 'pair-of-pieces'

  const countList = (lang: Lang) =>
    d.options.map((o) => `${o.label} ${o.squares}`).join(', ') + (lang === 'id' ? ' kotak' : ' squares')

  const cl = d.countLoser
  const rl = d.runLoser
  const fl = d.flipLoser

  // Every wrong choice is knocked out by something a child can check with their
  // own eyes — a count, a line length, a corner that points the wrong way — and
  // only then is the survivor actually seated in the hole.
  const stepsEn = [
    `The hole is ${d.n} squares. Count the squares in each choice: ${countList('en')}. ${cl?.label ?? '—'} carries ${cl?.squares ?? 0}, so it can never fill ${aOrAn(d.n)} ${d.n}-square hole — cross it off.`,
    `The longest straight line of squares anywhere in the hole is ${d.holeRun}. ${rl?.label ?? '—'} has a straight line of ${rl?.run ?? 0} squares, and turning never shortens a line, so ${rl?.label ?? '—'} cannot even sit inside the hole — cross it off.`,
    pair
      ? `${fl?.label ?? '—'} and ${d.answerLabel} carry the same ${d.n} squares, and one of ${fl?.label ?? '—'}'s pieces is the mirror image of the matching piece in ${d.answerLabel} — its corner turns the other way. Turning slides a piece around, it never swaps a left corner for a right one, so ${fl?.label ?? '—'} always ends up with a square poking out or a square left empty — cross it off.`
      : `${fl?.label ?? '—'} and ${d.answerLabel} carry the same ${d.n} squares, but one is the mirror image of the other: their corners turn opposite ways. Turning slides a piece around, it never swaps a left corner for a right one, so ${fl?.label ?? '—'} still leaves squares poking out after all four turns — cross it off.`,
    pair
      ? `That leaves ${d.answerLabel}. Lay its ${d.winner.split} squares into the hole: together they cover all ${d.n} squares with no gap and nothing overlapping. So the answer is ${d.answerLabel}.`
      : `That leaves ${d.answerLabel}. Give it ${turnWord(d.turnsToSeat, 'en')} and drop it in: all ${d.n} squares of the hole are covered and nothing sticks out. So the answer is ${d.answerLabel}.`,
  ]

  const stepsId = [
    `Lubangnya berisi ${d.n} kotak. Hitung kotak di tiap pilihan: ${countList('id')}. ${cl?.label ?? '—'} punya ${cl?.squares ?? 0} kotak, jadi tidak mungkin mengisi lubang yang berisi ${d.n} kotak — coret.`,
    `Garis lurus terpanjang di dalam lubang hanya ${d.holeRun} kotak. ${rl?.label ?? '—'} punya garis lurus ${rl?.run ?? 0} kotak, dan memutar tidak pernah memendekkan garis, jadi ${rl?.label ?? '—'} tidak bisa masuk ke lubang sama sekali — coret.`,
    pair
      ? `${fl?.label ?? '—'} dan ${d.answerLabel} sama-sama ${d.n} kotak, dan salah satu kepingan ${fl?.label ?? '—'} adalah bayangan cermin dari kepingan sepadan di ${d.answerLabel} — tekukannya menghadap arah sebaliknya. Memutar hanya menggeser kepingan, tidak pernah menukar tekukan kiri jadi kanan, jadi ${fl?.label ?? '—'} selalu menyisakan kotak yang menonjol atau kotak yang belum tertutup — coret.`
      : `${fl?.label ?? '—'} dan ${d.answerLabel} sama-sama ${d.n} kotak, tetapi yang satu bayangan cermin yang lain: tekukannya menghadap arah berlawanan. Memutar hanya menggeser kepingan, tidak pernah menukar tekukan kiri jadi kanan, jadi setelah dicoba keempat putaran ${fl?.label ?? '—'} tetap menyisakan kotak yang menonjol keluar — coret.`,
    pair
      ? `Tinggal ${d.answerLabel}. Susun ${d.winner.split} kotaknya ke dalam lubang: bersama-sama menutup semua ${d.n} kotak tanpa celah dan tanpa bertumpuk. Jadi jawabannya ${d.answerLabel}.`
      : `Tinggal ${d.answerLabel}. Beri ${turnWord(d.turnsToSeat, 'id')}, lalu masukkan: semua ${d.n} kotak lubang tertutup dan tidak ada yang menonjol. Jadi jawabannya ${d.answerLabel}.`,
  ]

  const body_en =
    `${actor} is tiling ${boardWord(d.regionKind, 'en')}. Every square is covered except one empty hole of ${d.n} squares. ` +
    (pair ? `Two pieces together must fill the hole with no gap and no overlap. ` : '') +
    `A piece may be turned to any angle, but it must NOT be flipped over.\n\n` +
    `Find: Which ${pair ? 'pair' : 'piece'} — A, B, C, or D — fills the hole exactly?`

  const body_id =
    `${actor} sedang menutup ${boardWord(d.regionKind, 'id')} dengan ubin. Semua kotak sudah tertutup kecuali satu lubang kosong berisi ${d.n} kotak. ` +
    (pair ? `Dua kepingan harus mengisi lubang itu tanpa celah dan tanpa bertumpuk. ` : '') +
    `Kepingan boleh diputar ke segala arah, tetapi TIDAK boleh dibalik.\n\n` +
    `Cari: ${pair ? 'Pasangan' : 'Kepingan'} mana — A, B, C, atau D — yang pas mengisi lubang itu?`

  return {
    body_en,
    body_id,
    answer_type: 'multiple_choice',
    choices_en: choicesFor(d, 'en'),
    choices_id: choicesFor(d, 'id'),
    answer: d.answer,
    hint_en: `Count the squares first, then turn each piece in your head — but never flip it. A mirrored piece looks right and never goes in.`,
    hint_id: `Hitung kotaknya dulu, lalu putar tiap kepingan dalam pikiranmu — tetapi jangan pernah dibalik. Kepingan yang dicerminkan terlihat benar tapi tidak pernah masuk.`,
    hint_steps_en: stepsEn,
    hint_steps_id: stepsId,
    breakdown,
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
