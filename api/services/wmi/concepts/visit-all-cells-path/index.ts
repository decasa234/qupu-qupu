import { z } from 'zod'
import type { ConceptLogic, Rendered, Rng } from '../types.js'
import { buildVisitAllCellsPathBreakdown } from './breakdown.js'

// A rabbit on a small board of squares. Some squares are stones it may not
// enter; every other square it must land on EXACTLY once, hopping between
// neighbouring squares (or, in the hard mode, jumping like a chess knight).
// The child is then asked something the finished route decides: the number a
// marked square ends up with, the order the lettered squares are reached, or
// how many routes exist at all.
//
// The single fact this concept lives or dies on: the route must be the ONLY
// route. "Visit everything once" sounds like a maze but it is really a chain of
// forced moves — a square with just one square left beside it has to be entered
// now, a branch that would cut some square off is not a branch at all. If two
// complete routes exist, two different numbers land on the marked square and
// both are defensible; the question then has no answer, only a favourite.
//
// So `generate` never trusts a board that merely *looks* tight. `enumerate`
// walks every possible route by exhaustive depth-first search and `paramsSchema`
// refuses anything that does not come back with exactly one (or, for the
// count-the-routes ask, with the small branch structure that ask needs).
// `index.test.ts` re-counts the routes with its own independent search.
export const ASKS = ['value-at-marked-cell', 'visit-order-of-marked-cells', 'how-many-routes'] as const
export type Ask = (typeof ASKS)[number]

export const STEP_KINDS = ['orthogonal', 'knight'] as const
export type StepKind = (typeof STEP_KINDS)[number]

/** The letters printed on the marked squares, in reading order. */
export const MARK_LETTERS = ['A', 'B', 'C'] as const
/** The glyph on the single marked square of the `value-at-marked-cell` ask. */
export const MARK_GLYPH = '★'

/** How many marks each ask puts on the board. */
export const MARK_COUNT: Record<Ask, number> = {
  'value-at-marked-cell': 1,
  'visit-order-of-marked-cells': 3,
  'how-many-routes': 0,
}

export interface Cell {
  r: number
  c: number
}

export const cellKey = (cell: Cell): string => `${cell.r},${cell.c}`
const sameCell = (a: Cell, b: Cell): boolean => a.r === b.r && a.c === b.c
const byReading = (a: Cell, b: Cell): number => a.r - b.r || a.c - b.c

const cellSchema = z.object({
  r: z.number().int().min(0).max(3),
  c: z.number().int().min(0).max(3),
})

const paramsSchema = z
  .object({
    rows: z.number().int().min(3).max(4),
    cols: z.number().int().min(3).max(4),
    /** Stones. At least one, in reading order, never under the rabbit or a mark. */
    blocked: z.array(cellSchema).min(1).max(9),
    /** Where the rabbit begins. Counts as the first visited square. */
    start: cellSchema,
    step: z.enum(STEP_KINDS),
    ask: z.enum(ASKS),
    /** Marked squares in reading order, so `MARK_LETTERS[i]` names `marks[i]`. */
    marks: z.array(cellSchema).max(3),
  })
  .refine((v) => insideGrid(v, v.start) && v.blocked.every((b) => insideGrid(v, b)) && v.marks.every((m) => insideGrid(v, m)), {
    message: 'every square named must lie inside the grid',
  })
  .refine((v) => new Set(v.blocked.map(cellKey)).size === v.blocked.length, {
    message: 'stones must be distinct',
  })
  .refine((v) => new Set(v.marks.map(cellKey)).size === v.marks.length, {
    message: 'marked squares must be distinct',
  })
  .refine(
    (v) =>
      !v.blocked.some((b) => sameCell(b, v.start)) &&
      !v.marks.some((m) => sameCell(m, v.start)) &&
      !v.marks.some((m) => v.blocked.some((b) => sameCell(b, m))),
    { message: 'a stone may not sit under the rabbit or under a mark' },
  )
  .refine((v) => v.marks.length === MARK_COUNT[v.ask], {
    message: 'each ask puts its own number of marks on the board',
  })
  .refine(
    (v) =>
      [...v.blocked].sort(byReading).every((b, i) => sameCell(b, v.blocked[i])) &&
      [...v.marks].sort(byReading).every((m, i) => sameCell(m, v.marks[i])),
    { message: 'stones and marks are stored in reading order' },
  )
  .refine((v) => v.rows * v.cols - v.blocked.length >= 6, {
    message: 'at least six squares must be left to visit',
  })
  // THE load-bearing rule. Everything above is shape; this is the promise that
  // the question has one answer rather than a preferred one.
  .refine((v) => !structurallySound(v) || hasTheRightRouteCount(v), {
    message:
      'the route must be the only one (or, for how-many-routes, 2 to 4 routes that split at a single fork)',
  })
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'visit-all-cells-path',
  name_en: 'Visit every square exactly once',
  name_id: 'Lewati semua petak satu kali',
  grades: [1, 2, 3] as const,
  description_id:
    'Menelusuri rute yang mampir ke setiap petak tepat satu kali, lalu membaca nomor petak bertanda, urutan huruf yang didatangi, atau banyaknya rute.',
} as const

// ── The board ────────────────────────────────────────────────────────────────

/**
 * The minimum shape the search needs. Declared structurally rather than as
 * `Params`, because a schema refinement calls into it: taking `Params` there
 * would make `Params = z.infer<typeof paramsSchema>` reference itself. Same
 * trick `row-column-sum-grid` uses for its `SolvableGrid`.
 */
export interface SolvableBoard {
  rows: number
  cols: number
  blocked: Cell[]
  start: Cell
  step: StepKind
  ask: Ask
  marks: Cell[]
}

const ORTHOGONAL_DELTAS: readonly (readonly [number, number])[] = [
  [-1, 0],
  [0, 1],
  [1, 0],
  [0, -1],
]

const KNIGHT_DELTAS: readonly (readonly [number, number])[] = [
  [-2, -1],
  [-2, 1],
  [-1, -2],
  [-1, 2],
  [1, -2],
  [1, 2],
  [2, -1],
  [2, 1],
]

function insideGrid(board: { rows: number; cols: number }, cell: Cell): boolean {
  return cell.r >= 0 && cell.r < board.rows && cell.c >= 0 && cell.c < board.cols
}

/** Every square the rabbit may hop to from `cell`, in a fixed order. */
export function neighbours(board: SolvableBoard, cell: Cell): Cell[] {
  const stones = new Set(board.blocked.map(cellKey))
  const deltas = board.step === 'knight' ? KNIGHT_DELTAS : ORTHOGONAL_DELTAS
  return deltas
    .map(([dr, dc]) => ({ r: cell.r + dr, c: cell.c + dc }))
    .filter((n) => insideGrid(board, n) && !stones.has(cellKey(n)))
}

/** Every square that is not a stone, in reading order. */
export function freeCells(board: SolvableBoard): Cell[] {
  const stones = new Set(board.blocked.map(cellKey))
  const out: Cell[] = []
  for (let r = 0; r < board.rows; r++) {
    for (let c = 0; c < board.cols; c++) {
      if (!stones.has(`${r},${c}`)) out.push({ r, c })
    }
  }
  return out
}

/** Enough of a params object to be worth searching at all. */
function structurallySound(v: SolvableBoard): boolean {
  if (v.rows < 3 || v.cols < 3 || v.rows > 4 || v.cols > 4) return false
  if (!insideGrid(v, v.start)) return false
  if (v.blocked.some((b) => sameCell(b, v.start))) return false
  return v.rows * v.cols - v.blocked.length >= 6
}

// ── Exhaustive route search ──────────────────────────────────────────────────

/** Hard ceiling on search work. 16 squares can never come close to it. */
const NODE_BUDGET = 500_000
/** Enumerate at most this many routes; hitting it means "too many to ask about". */
export const ROUTE_CAP = 6

export interface Search {
  routes: Cell[][]
  /** True when the search stopped early — the answer would be a guess. */
  truncated: boolean
}

interface Graph {
  free: Cell[]
  adj: number[][]
  startIndex: number
}

function buildGraph(board: SolvableBoard): Graph | null {
  const free = freeCells(board)
  const at = new Map(free.map((cell, i) => [cellKey(cell), i]))
  const startIndex = at.get(cellKey(board.start))
  if (startIndex === undefined) return null
  const adj = free.map((cell) =>
    neighbours(board, cell)
      .map((n) => at.get(cellKey(n)))
      .filter((i): i is number => i !== undefined),
  )
  return { free, adj, startIndex }
}

/**
 * Every route that starts at the rabbit and lands on each free square exactly
 * once, up to `limit` of them. Depth-first with one pruning rule: if some square
 * still to visit can no longer be reached from where the rabbit stands, the
 * branch is dead — that is the same argument the hints make out loud, used here
 * only to keep the search quick.
 */
export function enumerate(board: SolvableBoard, limit = ROUTE_CAP): Search {
  const graph = buildGraph(board)
  if (graph === null) return { routes: [], truncated: false }
  const { free, adj, startIndex } = graph
  const n = free.length
  const visited = new Array<boolean>(n).fill(false)
  const path: number[] = []
  const found: number[][] = []
  let budget = NODE_BUDGET
  let truncated = false

  const everythingStillReachable = (from: number, remaining: number): boolean => {
    if (remaining === 0) return true
    const seen = new Array<boolean>(n).fill(false)
    seen[from] = true
    const stack = [from]
    let reached = 0
    while (stack.length > 0) {
      const v = stack.pop() as number
      for (const w of adj[v]) {
        if (visited[w] || seen[w]) continue
        seen[w] = true
        reached += 1
        stack.push(w)
      }
    }
    return reached === remaining
  }

  const walk = (current: number): void => {
    if (found.length >= limit) return
    if (budget <= 0) {
      truncated = true
      return
    }
    budget -= 1
    if (path.length === n) {
      found.push([...path])
      return
    }
    if (!everythingStillReachable(current, n - path.length)) return
    for (const next of adj[current]) {
      if (visited[next]) continue
      visited[next] = true
      path.push(next)
      walk(next)
      path.pop()
      visited[next] = false
      if (found.length >= limit || budget <= 0) return
    }
  }

  visited[startIndex] = true
  path.push(startIndex)
  walk(startIndex)
  return { routes: found.map((route) => route.map((i) => free[i])), truncated }
}

/** The schema's route-count promise, as one predicate. */
function hasTheRightRouteCount(board: SolvableBoard): boolean {
  const { routes, truncated } = enumerate(board, ROUTE_CAP)
  if (truncated) return false
  if (board.ask !== 'how-many-routes') return routes.length === 1
  if (routes.length < 2 || routes.length >= ROUTE_CAP) return false
  return splitsAtOneFork(routes)
}

/** Do all routes agree until one square, then part company for good? */
function splitsAtOneFork(routes: Cell[][]): boolean {
  const prefix = commonPrefixLength(routes)
  if (prefix < 1) return false
  const firstMoves = routes.map((route) => route[prefix]).filter((cell): cell is Cell => cell !== undefined)
  if (firstMoves.length !== routes.length) return false
  return new Set(firstMoves.map(cellKey)).size === routes.length
}

function commonPrefixLength(routes: Cell[][]): number {
  const shortest = Math.min(...routes.map((route) => route.length))
  let i = 0
  while (i < shortest && routes.every((route) => sameCell(route[i], routes[0][i]))) i += 1
  return i
}

// ── Why a branch is not a branch ─────────────────────────────────────────────

export type RejectReason = 'cut-off' | 'two-dead-ends' | 'runs-out'

export interface Rejection {
  /** The square the rabbit could have hopped to. */
  cell: Cell
  reason: RejectReason
  /** For `cut-off`: the square that would be stranded. For `two-dead-ends`: both. */
  stranded: Cell[]
  /** For `runs-out`: the most squares any route through `cell` could ever cover. */
  best: number
}

export interface TraceStep {
  from: Cell
  to: Cell
  /** `to`'s place in the route, counting the rabbit's own square as 1. */
  order: number
  /** Every square the rabbit could hop to at that moment, `to` included. */
  options: Cell[]
  /** Why each of the others is not really an option. */
  rejected: Rejection[]
}

/**
 * Why hopping to `option` cannot work, given the squares already used.
 * Checked in the order a child would notice them:
 *   1. some square gets cut off and can never be reached again;
 *   2. two squares are each left with a single door, and a route can only END
 *      at one square;
 *   3. neither is visible in one glance, so say how far that road actually gets.
 * All three are proofs, not hunches — the caller has already established that
 * the option leads to no complete route.
 */
function rejectionFor(graph: Graph, visited: boolean[], visitedCount: number, option: number): Rejection {
  const { free, adj } = graph
  const n = free.length
  visited[option] = true
  try {
    // 1. cut off
    const seen = new Array<boolean>(n).fill(false)
    seen[option] = true
    const stack = [option]
    while (stack.length > 0) {
      const v = stack.pop() as number
      for (const w of adj[v]) {
        if (visited[w] || seen[w]) continue
        seen[w] = true
        stack.push(w)
      }
    }
    const stranded = free
      .map((cell, i) => ({ cell, i }))
      .filter(({ i }) => !visited[i] && !seen[i])
      .map(({ cell }) => cell)
    if (stranded.length > 0) {
      return { cell: free[option], reason: 'cut-off', stranded: [stranded[0]], best: 0 }
    }

    // 2. two squares that would each have to be the last one
    const oneDoor = free
      .map((cell, i) => ({ cell, i }))
      .filter(({ i }) => !visited[i])
      .filter(({ i }) => adj[i].filter((w) => !visited[w] || w === option).length === 1)
      .map(({ cell }) => cell)
    if (oneDoor.length >= 2) {
      return { cell: free[option], reason: 'two-dead-ends', stranded: oneDoor.slice(0, 2), best: 0 }
    }

    // 3. it simply runs out
    return {
      cell: free[option],
      reason: 'runs-out',
      stranded: [],
      best: visitedCount + deepest(adj, visited, option, n - visitedCount),
    }
  } finally {
    visited[option] = false
  }
}

/** The most further squares any walk from `from` can still cover. */
function deepest(adj: number[][], visited: boolean[], from: number, remaining: number): number {
  let best = 0
  const walk = (v: number, depth: number): void => {
    if (depth > best) best = depth
    if (best >= remaining) return
    for (const w of adj[v]) {
      if (visited[w]) continue
      visited[w] = true
      walk(w, depth + 1)
      visited[w] = false
      if (best >= remaining) return
    }
  }
  walk(from, 0)
  return best
}

/**
 * The forced-move trail along `route`, for moves `[fromMove, toMove)`.
 * Move `i` takes the rabbit from `route[i]` to `route[i + 1]`.
 */
export function traceRange(board: SolvableBoard, route: Cell[], fromMove: number, toMove: number): TraceStep[] {
  const graph = buildGraph(board)
  if (graph === null) return []
  const { free, adj } = graph
  const at = new Map(free.map((cell, i) => [cellKey(cell), i]))
  const visited = new Array<boolean>(free.length).fill(false)
  const steps: TraceStep[] = []

  for (let i = 0; i < toMove && i + 1 < route.length; i++) {
    const fromIndex = at.get(cellKey(route[i]))
    const toIndex = at.get(cellKey(route[i + 1]))
    if (fromIndex === undefined || toIndex === undefined) return steps
    visited[fromIndex] = true
    if (i >= fromMove) {
      const options = adj[fromIndex].filter((w) => !visited[w])
      const rejected = options
        .filter((w) => w !== toIndex)
        .map((w) => rejectionFor(graph, visited, i + 2, w))
      steps.push({
        from: route[i],
        to: route[i + 1],
        order: i + 2,
        options: options.map((w) => free[w]),
        rejected,
      })
    }
  }
  return steps
}

// ── The whole picture ────────────────────────────────────────────────────────

export interface Tail {
  /** The square that branch begins with. */
  first: Cell
  route: Cell[]
  trace: TraceStep[]
}

export interface Analysis {
  free: Cell[]
  routes: Cell[][]
  count: number
  /** The route the question is about. For `how-many-routes`, the first branch. */
  route: Cell[]
  /** Forced moves up to (but not including) the fork. The whole route when unique. */
  trace: TraceStep[]
  /** How many squares every route agrees on. Equals `route.length` when unique. */
  prefixLength: number
  /** The fork's own move, or null when the route is unique. */
  fork: TraceStep | null
  tails: Tail[]
  /** 1-based place in the route, by cell key. Only meaningful when unique. */
  orderOf: Map<string, number>
  /** `MARK_LETTERS` sorted into the order the rabbit reaches those squares. */
  visitOrderLetters: string[]
  answer: string
}

export function analyse(board: SolvableBoard): Analysis {
  const free = freeCells(board)
  const { routes } = enumerate(board, ROUTE_CAP)
  const count = routes.length
  const route = routes[0] ?? []
  const orderOf = new Map<string, number>()
  route.forEach((cell, i) => orderOf.set(cellKey(cell), i + 1))

  const unique = count === 1
  const prefixLength = unique ? route.length : count > 1 ? commonPrefixLength(routes) : 0
  const trace = unique
    ? traceRange(board, route, 0, route.length - 1)
    : count > 1
      ? traceRange(board, route, 0, Math.max(0, prefixLength - 1))
      : []

  let fork: TraceStep | null = null
  let tails: Tail[] = []
  if (!unique && count > 1 && prefixLength >= 1 && prefixLength < route.length) {
    fork = traceRange(board, route, prefixLength - 1, prefixLength)[0] ?? null
    tails = routes.map((r) => ({
      first: r[prefixLength],
      route: r,
      trace: traceRange(board, r, prefixLength, r.length - 1),
    }))
  }

  const letters = board.marks.map((_, i) => MARK_LETTERS[i] as string)
  const visitOrderLetters = letters
    .map((letter, i) => ({ letter, at: orderOf.get(cellKey(board.marks[i])) ?? 0 }))
    .sort((a, b) => a.at - b.at)
    .map((x) => x.letter)

  const answer =
    board.ask === 'how-many-routes'
      ? String(count)
      : board.ask === 'visit-order-of-marked-cells'
        ? visitOrderLetters.join('')
        : String(orderOf.get(cellKey(board.marks[0] ?? { r: -1, c: -1 })) ?? 0)

  return {
    free,
    routes,
    count,
    route,
    trace,
    prefixLength,
    fork,
    tails,
    orderOf,
    visitOrderLetters,
    answer,
  }
}

/**
 * The one genuinely tempting wrong answer each ask invites.
 * - counting the HOPS instead of the squares, so the rabbit's own square is
 *   left out and every number comes up one short;
 * - reading the letters off the picture left-to-right instead of tracing them.
 * Counting routes has no such misstep, so it gets no trap.
 */
export function trapAnswer(board: SolvableBoard, a: Analysis): string | null {
  if (board.ask === 'value-at-marked-cell') {
    const n = Number(a.answer)
    return Number.isFinite(n) && n >= 2 ? String(n - 1) : null
  }
  if (board.ask === 'visit-order-of-marked-cells') {
    const reading = board.marks.map((_, i) => MARK_LETTERS[i]).join('')
    return reading === a.answer ? null : reading
  }
  return null
}

// ── Chapters: how the trail is told ──────────────────────────────────────────

export interface Chapter {
  /** `run` groups consecutive one-door hops; `fork-out` is a single elimination. */
  kind: 'run' | 'eliminate'
  steps: TraceStep[]
}

/** Consecutive one-door hops read as one sentence; each elimination earns its own. */
export function chaptersOf(trace: TraceStep[]): Chapter[] {
  const out: Chapter[] = []
  for (const step of trace) {
    if (step.options.length > 1) {
      out.push({ kind: 'eliminate', steps: [step] })
      continue
    }
    const last = out[out.length - 1]
    if (last && last.kind === 'run') last.steps.push(step)
    else out.push({ kind: 'run', steps: [step] })
  }
  return out
}

// ── Generation ───────────────────────────────────────────────────────────────

const SHAPES = [
  { rows: 3, cols: 3, stones: [1, 3] as const },
  { rows: 3, cols: 4, stones: [2, 5] as const },
  { rows: 4, cols: 3, stones: [2, 5] as const },
  { rows: 4, cols: 4, stones: [4, 8] as const },
] as const

/** Are all the free squares in one piece? A split board has no route at all. */
function connected(board: SolvableBoard): boolean {
  const graph = buildGraph(board)
  if (graph === null) return false
  const { free, adj, startIndex } = graph
  const seen = new Array<boolean>(free.length).fill(false)
  seen[startIndex] = true
  const stack = [startIndex]
  let reached = 1
  while (stack.length > 0) {
    const v = stack.pop() as number
    for (const w of adj[v]) {
      if (seen[w]) continue
      seen[w] = true
      reached += 1
      stack.push(w)
    }
  }
  return reached === free.length
}

function draft(rng: Rng): Params | null {
  const shape = rng.pick(SHAPES)
  const { rows, cols } = shape
  // Knight jumps need room: on a 3-by-3 the middle square has no L-move at all,
  // so no route can ever cover the board. Every larger shape is fair game, and
  // whether the jumps actually pin a single route is decided further down by
  // the search, not guessed here.
  const step: StepKind = rows * cols > 9 && rng.int(0, 2) === 0 ? 'knight' : 'orthogonal'
  const ask: Ask = rng.pick(ASKS)

  const all: Cell[] = []
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) all.push({ r, c })
  const stoneCount = rng.int(shape.stones[0], shape.stones[1])
  const blocked = rng.shuffle(all).slice(0, stoneCount).sort(byReading)

  const skeleton: SolvableBoard = {
    rows,
    cols,
    blocked,
    start: { r: -1, c: -1 },
    step,
    ask,
    marks: [],
  }
  const free = freeCells(skeleton)
  if (free.length < 6) return null

  // Try the free squares as starting points until one gives the route count
  // this ask needs. A dead-end square is the best bet — the rabbit's very first
  // hop is then already forced — so those go first.
  const degree = new Map(free.map((cell) => [cellKey(cell), neighbours(skeleton, cell).length]))
  const candidates = rng
    .shuffle(free)
    .slice()
    .sort((a, b) => (degree.get(cellKey(a)) ?? 9) - (degree.get(cellKey(b)) ?? 9))
    .slice(0, 6)

  for (const start of candidates) {
    const board: SolvableBoard = { ...skeleton, start }
    if (!connected(board)) continue
    if (!hasTheRightRouteCount(board)) continue
    const marks = pickMarks(rng, board, ask)
    if (marks === null) continue
    return { rows, cols, blocked, start, step, ask, marks }
  }
  return null
}

/** Where the question puts its marks, or null when this board cannot carry them. */
function pickMarks(rng: Rng, board: SolvableBoard, ask: Ask): Cell[] | null {
  if (ask === 'how-many-routes') return []
  const a = analyse(board)
  const route = a.route
  if (route.length < 6) return null

  if (ask === 'value-at-marked-cell') {
    // Never the first squares: a mark the rabbit reaches straight away is read
    // off the picture rather than worked out.
    const late = route.slice(3)
    if (late.length === 0) return null
    return [rng.pick(late)]
  }

  // Three lettered squares, never the rabbit's own. Letters are handed out in
  // reading order, so an answer that comes back as ABC would be exactly what a
  // child gets by not tracing at all — reject those boards and let the reading
  // order stay a trap rather than a shortcut.
  const pool = route.slice(1)
  if (pool.length < 3) return null
  for (let attempt = 0; attempt < 12; attempt++) {
    const marks = rng.shuffle(pool).slice(0, 3).sort(byReading)
    const withMarks: SolvableBoard = { ...board, ask, marks }
    if (analyse(withMarks).answer !== MARK_LETTERS.join('')) return marks
  }
  return null
}

/**
 * Quality filter, not a correctness rule — `paramsSchema` already refuses any
 * board whose route count is wrong. This rejects boards that are technically
 * fine but bad to learn from.
 */
function isWorthAsking(p: Params): boolean {
  const a = analyse(p)
  if (a.count === 0) return false
  const chapters = chaptersOf(a.trace)
  // A bare corridor forces itself; there is no thinking in it. At least one hop
  // must be settled by ruling a wrong turn out.
  if (p.ask !== 'how-many-routes' && !chapters.some((ch) => ch.kind === 'eliminate')) return false
  // Every rejection the hints will narrate must have a reason worth reading.
  // "runs-out" is honest but the weakest of the three, so cap how often it leans
  // on it: a board explained mostly by "just try it" is a board of trial runs.
  const rejections = a.trace.flatMap((s) => s.rejected)
  if (rejections.filter((x) => x.reason === 'runs-out').length > 1) return false
  // Keep the read short. Rule line + chapters + closing line.
  if (chapters.length > 4) return false
  if (p.ask === 'how-many-routes') {
    if (a.fork === null || a.tails.length !== a.count) return false
    // Every route gets a line of its own, so keep the list short enough to read.
    if (a.count > 3) return false
    if (chapters.length > 3) return false
    if (a.tails.some((t) => chaptersOf(t.trace).length > 3)) return false
  }
  return true
}

/**
 * A hand-built board that is forced by construction: the free squares form a
 * single corridor, so from its end there is never a choice at all. Only reached
 * if every random draft missed, which the tests say does not happen.
 */
const FALLBACK: Params = {
  rows: 3,
  cols: 3,
  blocked: [
    { r: 0, c: 1 },
    { r: 1, c: 1 },
  ],
  start: { r: 0, c: 0 },
  step: 'orthogonal',
  ask: 'value-at-marked-cell',
  marks: [{ r: 1, c: 2 }],
}

export function generate(rng: Rng): Params {
  let first: Params | null = null
  for (let attempt = 0; attempt < 260; attempt++) {
    const candidate = draft(rng)
    if (candidate === null) continue
    if (first === null) first = candidate
    if (isWorthAsking(candidate)) return candidate
  }
  return first ?? FALLBACK
}

// ── Rendering ────────────────────────────────────────────────────────────────

/** "row 2, column 3" / "baris 2 kolom 3". Rows from the top, columns from the left. */
export function cellName(cell: Cell, lang: 'en' | 'id'): string {
  return lang === 'id'
    ? `baris ${cell.r + 1} kolom ${cell.c + 1}`
    : `row ${cell.r + 1} column ${cell.c + 1}`
}

function listEn(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

function listId(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  if (items.length === 2) return `${items[0]} dan ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, dan ${items[items.length - 1]}`
}

/** The sentence describing one hop. Exported so the breakdown can quote it. */
export function moveClause(step: StepKind, lang: 'en' | 'id'): string {
  if (step === 'knight') {
    return lang === 'id'
      ? 'Sekali lompat ia bergerak seperti kuda catur: dua petak lurus lalu satu petak ke samping.'
      : 'Each jump moves it like a chess knight: two squares straight then one square across.'
  }
  return lang === 'id'
    ? 'Sekali lompat ia pindah ke petak tetangga yang berbagi sisi.'
    : 'Each hop takes it to a neighbouring square that shares a side.'
}

/** The phrase inside `moveClause` the breakdown highlights. */
export function moveHighlight(step: StepKind, lang: 'en' | 'id'): string {
  if (step === 'knight') {
    return lang === 'id'
      ? 'seperti kuda catur: dua petak lurus lalu satu petak ke samping'
      : 'like a chess knight: two squares straight then one square across'
  }
  return lang === 'id'
    ? 'petak tetangga yang berbagi sisi'
    : 'a neighbouring square that shares a side'
}

/** The question sentence, ending in "?" or ".". Exported so the breakdown can quote it. */
export function askClause(ask: Ask, lang: 'en' | 'id'): string {
  if (ask === 'value-at-marked-cell') {
    return lang === 'id'
      ? `Berapa nomor petak bertanda ${MARK_GLYPH}?`
      : `What number does the square marked ${MARK_GLYPH} get?`
  }
  if (ask === 'visit-order-of-marked-cells') {
    return lang === 'id'
      ? 'Tulis huruf A, B, dan C sesuai urutan kelinci mendatanginya, tanpa spasi (contoh: BCA).'
      : 'Write the letters A, B and C in the order the rabbit reaches them, with no spaces (for example BCA).'
  }
  return lang === 'id'
    ? 'Ada berapa rute berbeda yang bisa ditempuh kelinci?'
    : 'How many different routes can the rabbit take?'
}

function bodyFor(p: Params, lang: 'en' | 'id'): string {
  const id = lang === 'id'
  const sentences: string[] = [
    id ? 'Kelinci mulai dari petak hijau.' : 'The rabbit starts from the green square.',
    moveClause(p.step, lang),
    id
      ? 'Petak biru adalah batu yang tidak boleh diinjak.'
      : 'The blue squares are stones it must not step on.',
    id
      ? 'Kelinci harus melewati setiap petak yang bukan batu tepat satu kali.'
      : 'The rabbit has to cross every square that is not a stone exactly once.',
  ]
  if (p.ask === 'value-at-marked-cell') {
    sentences.push(
      id
        ? 'Petak diberi nomor sesuai urutan kelinci mendatanginya: petak awal nomor 1, lalu 2, 3, dan seterusnya.'
        : 'Number the squares in the order the rabbit reaches them: the starting square is 1, then 2, then 3, and so on.',
    )
  }
  if (p.ask === 'visit-order-of-marked-cells') {
    sentences.push(
      id ? 'Tiga petak sudah ditandai huruf A, B, dan C.' : 'Three squares are marked with the letters A, B and C.',
    )
  }
  sentences.push(`${id ? 'Cari' : 'Find'}: ${askClause(p.ask, lang)}`)
  return sentences.join(' ')
}

/** One sentence explaining why a hop is not really on offer. */
function rejectionSentence(x: Rejection, total: number, lang: 'en' | 'id'): string {
  const id = lang === 'id'
  const to = cellName(x.cell, lang)
  if (x.reason === 'cut-off') {
    const lost = cellName(x.stranded[0], lang)
    return id
      ? `Kalau ke ${to}, petak ${lost} terputus — tidak ada jalan menuju ke sana lagi.`
      : `Hopping to ${to} cuts off ${lost} — there would be no way back to it.`
  }
  if (x.reason === 'two-dead-ends') {
    const a = cellName(x.stranded[0], lang)
    const b = cellName(x.stranded[1], lang)
    return id
      ? `Kalau ke ${to}, petak ${a} dan ${b} sama-sama tinggal punya satu pintu, padahal rute cuma boleh berhenti di satu petak.`
      : `Hopping to ${to} leaves ${a} and ${b} each with a single door, yet a route can only finish on one square.`
  }
  return id
    ? `Kalau ke ${to}, jalannya mentok setelah ${x.best} petak, padahal ada ${total} petak yang harus didatangi.`
    : `Hopping to ${to} runs out after ${x.best} squares, and there are ${total} squares to cover.`
}

/** One sentence per chapter of the forced trail. */
function chapterSentence(chapter: Chapter, total: number, lang: 'en' | 'id'): string {
  const id = lang === 'id'
  if (chapter.kind === 'run') {
    const from = cellName(chapter.steps[0].from, lang)
    const list = chapter.steps.map((s) => cellName(s.to, lang))
    const firstOrder = chapter.steps[0].order
    const lastOrder = chapter.steps[chapter.steps.length - 1].order
    const numbering = id
      ? firstOrder === lastOrder
        ? `jadi itu petak ke-${firstOrder}.`
        : `jadi itu petak ke-${firstOrder} sampai petak ke-${lastOrder}.`
      : firstOrder === lastOrder
        ? `so that is square ${firstOrder}.`
        : `so those are squares ${firstOrder} to ${lastOrder}.`
    return id
      ? `Mulai dari ${from}, setiap petak yang disinggahi cuma punya satu tetangga yang belum didatangi, jadi lompatannya wajib: ${list.join(' → ')} — ${numbering}`
      : `Starting at ${from}, every square along the way has just one unvisited neighbour, so each hop is forced: ${list.join(' → ')} — ${numbering}`
  }
  const step = chapter.steps[0]
  const from = cellName(step.from, lang)
  const to = cellName(step.to, lang)
  const reasons = step.rejected.map((x) => rejectionSentence(x, total, lang)).join(' ')
  return id
    ? `Dari ${from} ada ${step.options.length} petak yang belum didatangi di sebelahnya. ${reasons} Jadi kelinci wajib ke ${to} — petak ke-${step.order}.`
    : `From ${from} there are ${step.options.length} unvisited squares beside it. ${reasons} So the rabbit must take ${to} — square ${step.order}.`
}

function hintSteps(p: Params, a: Analysis, lang: 'en' | 'id'): string[] {
  const id = lang === 'id'
  const total = a.free.length
  const out: string[] = [
    id
      ? `Baris dihitung dari atas, kolom dari kiri. Ada ${total} petak yang harus didatangi dan kelinci tidak boleh mengulang petak, jadi kalau di sebelahnya cuma tersisa satu petak yang belum didatangi, lompatan itu wajib — dan kalau ada dua, coret pilihan yang membuat petak lain tidak bisa dijangkau lagi.`
      : `Rows are counted from the top and columns from the left. There are ${total} squares to cover and the rabbit may never repeat one, so when only a single unvisited square sits beside it the hop is forced — and when two do, cross off the one that would leave another square unreachable.`,
  ]

  for (const chapter of chaptersOf(a.trace)) out.push(chapterSentence(chapter, total, lang))

  if (p.ask === 'how-many-routes' && a.fork !== null) {
    const at = cellName(a.fork.from, lang)
    const options = a.tails.map((t) => cellName(t.first, lang))
    out.push(
      id
        ? `Sampai di ${at} rutenya sama untuk semua jalan. Di sini ada ${a.tails.length} petak yang dua-duanya masih bisa menyelesaikan sisanya: ${listId(options)}.`
        : `Every route agrees as far as ${at}. Here ${a.tails.length} squares can still finish the job: ${listEn(options)}.`,
    )
    a.tails.forEach((tail, i) => {
      const rest = tail.route.slice(a.prefixLength + 1).map((cell) => cellName(cell, lang))
      const tailText = id
        ? rest.length === 0
          ? 'dan papan langsung habis.'
          : `sisanya wajib: ${rest.join(' → ')}.`
        : rest.length === 0
          ? 'and the board is finished.'
          : `the rest is forced: ${rest.join(' → ')}.`
      out.push(
        id
          ? `Rute ${i + 1} — lewat ${cellName(tail.first, lang)}, ${tailText} Itu satu rute utuh.`
          : `Route ${i + 1} — through ${cellName(tail.first, lang)}, ${tailText} That is one whole route.`,
      )
    })
    out.push(
      id
        ? `Tidak ada percabangan lain, jadi banyaknya rute persis sama dengan banyaknya pilihan tadi: ${a.answer}.`
        : `There is no other fork, so the number of routes is exactly the number of choices there: ${a.answer}.`,
    )
    return out
  }

  if (p.ask === 'value-at-marked-cell') {
    const mark = cellName(p.marks[0], lang)
    out.push(
      id
        ? `Petak bertanda ${MARK_GLYPH} ada di ${mark}, dan menurut hitungan tadi itu petak ke-${a.answer}. Jadi nomornya ${a.answer}.`
        : `The square marked ${MARK_GLYPH} is at ${mark}, and the count above makes it square ${a.answer}. So its number is ${a.answer}.`,
    )
    return out
  }

  const reached = p.marks.map((cell, i) => {
    const letter = MARK_LETTERS[i]
    const at = a.orderOf.get(cellKey(cell)) ?? 0
    return id ? `${letter} adalah petak ke-${at}` : `${letter} is square ${at}`
  })
  out.push(
    id
      ? `${listId(reached)}. Urut dari yang paling awal: ${a.visitOrderLetters.join('')}.`
      : `${listEn(reached)}. Smallest number first, that reads ${a.visitOrderLetters.join('')}.`,
  )
  return out
}

export function render(params: Params): Rendered {
  const a = analyse(params)
  const breakdown = buildVisitAllCellsPathBreakdown(params)

  return {
    body_en: bodyFor(params, 'en'),
    body_id: bodyFor(params, 'id'),
    answer_type: 'fill_in',
    choices_en: null,
    choices_id: null,
    answer: a.answer,
    hint_en:
      'Look for a square with only one unvisited neighbour — that hop has to happen. And before taking a turn, check that no square is left stranded behind you.',
    hint_id:
      'Cari petak yang di sebelahnya cuma tersisa satu petak yang belum didatangi — lompatan itu pasti. Sebelum berbelok, periksa juga jangan sampai ada petak yang jadi tertinggal di belakang.',
    hint_steps_en: hintSteps(params, a, 'en'),
    hint_steps_id: hintSteps(params, a, 'id'),
    breakdown,
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
