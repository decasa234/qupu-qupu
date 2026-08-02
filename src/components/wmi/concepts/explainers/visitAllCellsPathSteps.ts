import type { Lang } from './makeTenSteps'

// `visit-all-cells-path`. A rabbit that has to land on every square of a small
// board exactly once, and a question the finished route decides.
//
// The move this storyboard has to teach is that "exactly once" keeps making the
// decision for you. A square with a single unvisited neighbour must be entered
// NOW; a turn that would strand a square behind the rabbit was never a turn at
// all. So the trail is drawn one forced stretch at a time, and every fork gets a
// beat that crosses the wrong branch out and says what it would have broken.
// Nothing is ever announced — the route arrives move by move.
//
// Mirrors api/services/wmi/concepts/visit-all-cells-path. Params arrive as
// `unknown` from the DB, so the board, the routes and the forcing walk are all
// re-derived here; the storyboard can never narrate a hop the board does not in
// fact force.
export type VisitAsk = 'value-at-marked-cell' | 'visit-order-of-marked-cells' | 'how-many-routes'
export type VisitPhase = 'setup' | 'forced' | 'eliminate' | 'fork' | 'branch' | 'trap' | 'result'

export interface VisitCell {
  r: number
  c: number
}

export interface VisitParams {
  rows: number
  cols: number
  blocked: VisitCell[]
  start: VisitCell
  step: 'orthogonal' | 'knight'
  ask: VisitAsk
  marks: VisitCell[]
}

export interface VisitBeat {
  phase: VisitPhase
  caption: string
  /** The trail drawn so far, as `[col, row]` for MazeGrid. */
  path: [number, number][]
  /** Visit numbers to print on the board this beat. */
  numbers: { r: number; c: number; n: number }[]
  /** The square the beat is deciding from, ringed in amber. */
  focus: VisitCell | null
  /** The hops ruled out this beat, crossed out in rose. */
  crossed: VisitCell[]
  /** The answer — non-null ONLY on the final beat. */
  reveal: string | null
  hold: number
}

export interface VisitStoryboard {
  rows: number
  cols: number
  blocked: [number, number][]
  start: [number, number]
  /** The lettered / starred squares, with the glyph printed on each. */
  marks: { cell: VisitCell; label: string }[]
  answer: string
  steps: VisitBeat[]
  finalIndex: number
}

/** Mirrors MARK_LETTERS / MARK_GLYPH in the backend concept. */
const MARK_LETTERS = ['A', 'B', 'C']
const MARK_GLYPH = '★'

const ORTHOGONAL: [number, number][] = [
  [-1, 0],
  [0, 1],
  [1, 0],
  [0, -1],
]
const KNIGHT: [number, number][] = [
  [-2, -1],
  [-2, 1],
  [-1, -2],
  [-1, 2],
  [1, -2],
  [1, 2],
  [2, -1],
  [2, 1],
]

const FALLBACK: VisitParams = {
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

const key = (cell: VisitCell): string => `${cell.r},${cell.c}`
const same = (a: VisitCell, b: VisitCell): boolean => a.r === b.r && a.c === b.c
const byReading = (a: VisitCell, b: VisitCell): number => a.r - b.r || a.c - b.c

const int = (v: unknown, fallback: number): number =>
  typeof v === 'number' && Number.isFinite(v) ? Math.round(v) : fallback

const readCell = (v: unknown): VisitCell => ({ r: int((v as VisitCell)?.r, -1), c: int((v as VisitCell)?.c, -1) })

function read(raw: unknown): VisitParams {
  const p = (raw ?? {}) as Partial<VisitParams>
  const rows = Math.max(3, Math.min(4, int(p.rows, 0)))
  const cols = Math.max(3, Math.min(4, int(p.cols, 0)))
  const inside = (cell: VisitCell) => cell.r >= 0 && cell.r < rows && cell.c >= 0 && cell.c < cols

  const start = readCell(p.start)
  if (!inside(start)) return FALLBACK
  const blocked = (Array.isArray(p.blocked) ? p.blocked : []).map(readCell).filter(inside).sort(byReading)
  const stones = new Set(blocked.map(key))
  if (stones.has(key(start))) return FALLBACK
  if (rows * cols - stones.size < 2) return FALLBACK

  const step = p.step === 'knight' ? 'knight' : 'orthogonal'
  const ask: VisitAsk =
    p.ask === 'visit-order-of-marked-cells' || p.ask === 'how-many-routes' ? p.ask : 'value-at-marked-cell'
  const wanted = ask === 'how-many-routes' ? 0 : ask === 'visit-order-of-marked-cells' ? 3 : 1
  const marks = (Array.isArray(p.marks) ? p.marks : [])
    .map(readCell)
    .filter((cell) => inside(cell) && !stones.has(key(cell)) && !same(cell, start))
    .filter((cell, i, all) => all.findIndex((x) => same(x, cell)) === i)
    .sort(byReading)
    .slice(0, wanted)

  const board: VisitParams = { rows, cols, blocked, start, step, ask, marks }
  // A board whose marks went missing cannot answer its own question; ask the
  // one thing that needs no marks instead of narrating a blank.
  if (marks.length !== wanted) return { ...board, ask: 'how-many-routes', marks: [] }
  return board
}

// ── The board, re-derived ────────────────────────────────────────────────────

function freeCells(p: VisitParams): VisitCell[] {
  const stones = new Set(p.blocked.map(key))
  const out: VisitCell[] = []
  for (let r = 0; r < p.rows; r++) {
    for (let c = 0; c < p.cols; c++) if (!stones.has(`${r},${c}`)) out.push({ r, c })
  }
  return out
}

interface Graph {
  free: VisitCell[]
  adj: number[][]
  startIndex: number
}

function buildGraph(p: VisitParams): Graph | null {
  const free = freeCells(p)
  const at = new Map(free.map((cell, i) => [key(cell), i]))
  const startIndex = at.get(key(p.start))
  if (startIndex === undefined) return null
  const deltas = p.step === 'knight' ? KNIGHT : ORTHOGONAL
  const adj = free.map((cell) =>
    deltas
      .map(([dr, dc]) => at.get(`${cell.r + dr},${cell.c + dc}`))
      .filter((i): i is number => i !== undefined),
  )
  return { free, adj, startIndex }
}

/** Every complete route, up to `limit`. Same exhaustive walk as the backend. */
function enumerate(graph: Graph, limit: number): number[][] {
  const { adj, free, startIndex } = graph
  const n = free.length
  const visited = new Array<boolean>(n).fill(false)
  const path: number[] = []
  const found: number[][] = []
  let budget = 300_000

  const reachable = (from: number, remaining: number): boolean => {
    if (remaining === 0) return true
    const seen = new Array<boolean>(n).fill(false)
    seen[from] = true
    const stack = [from]
    let count = 0
    while (stack.length > 0) {
      const v = stack.pop() as number
      for (const w of adj[v]) {
        if (visited[w] || seen[w]) continue
        seen[w] = true
        count += 1
        stack.push(w)
      }
    }
    return count === remaining
  }

  const walk = (current: number): void => {
    if (found.length >= limit || budget <= 0) return
    budget -= 1
    if (path.length === n) {
      found.push([...path])
      return
    }
    if (!reachable(current, n - path.length)) return
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
  return found
}

type RejectReason = 'cut-off' | 'two-dead-ends' | 'runs-out'

interface Rejection {
  cell: VisitCell
  reason: RejectReason
  stranded: VisitCell[]
  best: number
}

interface Move {
  from: VisitCell
  to: VisitCell
  order: number
  optionCount: number
  rejected: Rejection[]
}

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

/** Why that hop is not really on offer. Same three proofs as the backend. */
function rejectionFor(graph: Graph, visited: boolean[], visitedCount: number, option: number): Rejection {
  const { free, adj } = graph
  const n = free.length
  visited[option] = true
  try {
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
    const stranded = free.filter((_, i) => !visited[i] && !seen[i])
    if (stranded.length > 0) {
      return { cell: free[option], reason: 'cut-off', stranded: [stranded[0]], best: 0 }
    }
    const oneDoor = free.filter(
      (_, i) => !visited[i] && adj[i].filter((w) => !visited[w] || w === option).length === 1,
    )
    if (oneDoor.length >= 2) {
      return { cell: free[option], reason: 'two-dead-ends', stranded: oneDoor.slice(0, 2), best: 0 }
    }
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

/** The move-by-move trail along `route`, for moves `[fromMove, toMove)`. */
function traceRange(graph: Graph, route: number[], fromMove: number, toMove: number): Move[] {
  const { free, adj } = graph
  const visited = new Array<boolean>(free.length).fill(false)
  const moves: Move[] = []
  for (let i = 0; i < toMove && i + 1 < route.length; i++) {
    visited[route[i]] = true
    if (i < fromMove) continue
    const options = adj[route[i]].filter((w) => !visited[w])
    moves.push({
      from: free[route[i]],
      to: free[route[i + 1]],
      order: i + 2,
      optionCount: options.length,
      rejected: options.filter((w) => w !== route[i + 1]).map((w) => rejectionFor(graph, visited, i + 2, w)),
    })
  }
  return moves
}

interface Chapter {
  kind: 'run' | 'eliminate'
  moves: Move[]
}

function chaptersOf(trace: Move[]): Chapter[] {
  const out: Chapter[] = []
  for (const move of trace) {
    if (move.optionCount > 1) {
      out.push({ kind: 'eliminate', moves: [move] })
      continue
    }
    const last = out[out.length - 1]
    if (last && last.kind === 'run') last.moves.push(move)
    else out.push({ kind: 'run', moves: [move] })
  }
  return out
}

// ── Words ────────────────────────────────────────────────────────────────────

const cellName = (cell: VisitCell, lang: Lang): string =>
  lang === 'id' ? `baris ${cell.r + 1} kolom ${cell.c + 1}` : `row ${cell.r + 1} column ${cell.c + 1}`

function listEn(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

function listId(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  if (items.length === 2) return `${items[0]} dan ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, dan ${items[items.length - 1]}`
}

function rejectionSentence(x: Rejection, total: number, lang: Lang): string {
  const id = lang === 'id'
  const to = cellName(x.cell, lang)
  if (x.reason === 'cut-off') {
    const lost = cellName(x.stranded[0], lang)
    return id
      ? `Kalau ke ${to}, petak ${lost} terputus — tidak ada jalan ke sana lagi.`
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
    ? `Kalau ke ${to}, jalannya mentok setelah ${x.best} petak, padahal ada ${total} petak.`
    : `Hopping to ${to} runs out after ${x.best} squares, and there are ${total} to cover.`
}

// ── Storyboard ───────────────────────────────────────────────────────────────

export function buildVisitAllCellsPathSteps(raw: unknown, lang: Lang): VisitStoryboard {
  const p = read(raw)
  const T = (en: string, id: string) => (lang === 'id' ? id : en)
  const id = lang === 'id'

  const graph = buildGraph(p)
  const free = graph ? graph.free : freeCells(p)
  const routes = graph ? enumerate(graph, 6) : []
  const count = routes.length
  const cellsOf = (route: number[]): VisitCell[] => route.map((i) => free[i])
  const route = count > 0 ? cellsOf(routes[0]) : []

  const orderOf = new Map<string, number>()
  route.forEach((cell, i) => orderOf.set(key(cell), i + 1))

  const marks = p.marks.map((cell, i) => ({
    cell,
    label: p.marks.length === 1 ? MARK_GLYPH : (MARK_LETTERS[i] as string),
  }))
  const visitOrderLetters = marks
    .map((m) => ({ label: m.label, at: orderOf.get(key(m.cell)) ?? 0 }))
    .sort((a, b) => a.at - b.at)
    .map((x) => x.label)

  const answer =
    p.ask === 'how-many-routes'
      ? String(count)
      : p.ask === 'visit-order-of-marked-cells'
        ? visitOrderLetters.join('')
        : String(orderOf.get(key(p.marks[0] ?? { r: -1, c: -1 })) ?? 0)

  // How far every route agrees, and where they part company.
  let prefix = route.length
  if (count > 1) {
    const shortest = Math.min(...routes.map((r) => r.length))
    prefix = 0
    while (prefix < shortest && routes.every((r) => r[prefix] === routes[0][prefix])) prefix += 1
  }
  const trace = graph ? traceRange(graph, routes[0] ?? [], 0, Math.max(0, prefix - 1)) : []
  const fork =
    graph && count > 1 && prefix >= 1 && prefix < route.length
      ? (traceRange(graph, routes[0], prefix - 1, prefix)[0] ?? null)
      : null
  const tails =
    graph && fork !== null
      ? routes.map((r) => ({ route: cellsOf(r), first: free[r[prefix]] }))
      : []

  const total = free.length
  const steps: VisitBeat[] = []
  const seen: VisitCell[] = route.length > 0 ? [route[0]] : []

  const numbersFor = (cells: VisitCell[]): { r: number; c: number; n: number }[] =>
    cells.map((cell, i) => ({ r: cell.r, c: cell.c, n: i + 1 }))
  const pathFor = (cells: VisitCell[]): [number, number][] => cells.map((cell) => [cell.c, cell.r])

  const push = (draft: Omit<VisitBeat, 'reveal' | 'hold'> & Partial<Pick<VisitBeat, 'reveal' | 'hold'>>) => {
    steps.push({ reveal: null, hold: 3000, ...draft })
  }

  // ── Beat 1 — the board and the rule that does all the work. ────────────────
  push({
    phase: 'setup',
    path: [],
    // No numbers yet: the setup beat shows the rabbit sitting on its square,
    // and the counting only starts once the trail does.
    numbers: [],
    focus: p.start,
    crossed: [],
    caption: T(
      `The rabbit must land on all ${total} squares, never twice. That rule decides most hops for you: a square with only one unvisited neighbour has to be entered right away.`,
      `Kelinci harus mendarat di ${total} petak, tidak boleh dua kali. Aturan itu sudah menentukan sebagian besar lompatan: petak yang tetangganya tinggal satu harus dimasuki saat itu juga.`,
    ),
    hold: 3400,
  })

  // ── Beats 2.. — one per stretch of the forced trail. ───────────────────────
  for (const chapter of chaptersOf(trace)) {
    if (chapter.kind === 'run') {
      const from = cellName(chapter.moves[0].from, lang)
      const list = chapter.moves.map((m) => cellName(m.to, lang))
      const firstOrder = chapter.moves[0].order
      const lastOrder = chapter.moves[chapter.moves.length - 1].order
      for (const move of chapter.moves) seen.push(move.to)
      push({
        phase: 'forced',
        path: pathFor(seen),
        numbers: numbersFor(seen),
        focus: chapter.moves[chapter.moves.length - 1].to,
        crossed: [],
        caption: id
          ? `Mulai dari ${from}, setiap petak yang disinggahi cuma punya satu tetangga yang belum didatangi, jadi lompatannya wajib: ${list.join(' → ')}${firstOrder === lastOrder ? ` — petak ke-${firstOrder}.` : ` — petak ke-${firstOrder} sampai ke-${lastOrder}.`}`
          : `Starting at ${from}, every square along the way has just one unvisited neighbour, so each hop is forced: ${list.join(' → ')}${firstOrder === lastOrder ? ` — square ${firstOrder}.` : ` — squares ${firstOrder} to ${lastOrder}.`}`,
        hold: 3200,
      })
      continue
    }
    const move = chapter.moves[0]
    seen.push(move.to)
    push({
      phase: 'eliminate',
      path: pathFor(seen),
      numbers: numbersFor(seen),
      focus: move.from,
      crossed: move.rejected.map((x) => x.cell),
      caption: id
        ? `Dari ${cellName(move.from, lang)} ada ${move.optionCount} petak di sebelahnya yang belum didatangi. ${move.rejected.map((x) => rejectionSentence(x, total, lang)).join(' ')} Jadi wajib ke ${cellName(move.to, lang)} — petak ke-${move.order}.`
        : `From ${cellName(move.from, lang)} there are ${move.optionCount} unvisited squares beside it. ${move.rejected.map((x) => rejectionSentence(x, total, lang)).join(' ')} So it must take ${cellName(move.to, lang)} — square ${move.order}.`,
      hold: 3600,
    })
  }

  // ── Counting routes: the one real fork, then each branch in turn. ──────────
  if (p.ask === 'how-many-routes' && fork !== null) {
    push({
      phase: 'fork',
      path: pathFor(seen),
      numbers: numbersFor(seen),
      focus: fork.from,
      crossed: [],
      caption: id
        ? `Sampai ${cellName(fork.from, lang)} semua rute sama. Di sini ada ${tails.length} petak yang sama-sama masih bisa menghabiskan papan: ${listId(tails.map((t) => cellName(t.first, lang)))}.`
        : `Every route agrees as far as ${cellName(fork.from, lang)}. Here ${tails.length} squares can still finish the board: ${listEn(tails.map((t) => cellName(t.first, lang)))}.`,
      hold: 3400,
    })
    tails.forEach((tail, i) => {
      const rest = tail.route.slice(prefix + 1).map((cell) => cellName(cell, lang))
      push({
        phase: 'branch',
        path: pathFor(tail.route),
        numbers: numbersFor(tail.route),
        focus: tail.first,
        crossed: [],
        caption: id
          ? `Rute ${i + 1} — lewat ${cellName(tail.first, lang)}${rest.length === 0 ? ', dan papan langsung habis' : `, lalu sisanya wajib: ${rest.join(' → ')}`}. Satu rute utuh.`
          : `Route ${i + 1} — through ${cellName(tail.first, lang)}${rest.length === 0 ? ', and the board is done' : `, then the rest is forced: ${rest.join(' → ')}`}. One whole route.`,
        hold: 3200,
      })
    })
    push({
      phase: 'result',
      path: pathFor(tails[tails.length - 1]?.route ?? route),
      numbers: numbersFor(tails[tails.length - 1]?.route ?? route),
      focus: null,
      crossed: [],
      caption: T(
        `No other fork ever appears, so the routes number exactly the choices at that one square: ${answer}.`,
        `Tidak ada percabangan lain, jadi banyaknya rute persis sama dengan banyaknya pilihan di petak tadi: ${answer}.`,
      ),
      reveal: answer,
      hold: 0,
    })
    return {
      rows: p.rows,
      cols: p.cols,
      blocked: p.blocked.map((cell) => [cell.c, cell.r] as [number, number]),
      start: [p.start.c, p.start.r],
      marks,
      answer,
      steps,
      finalIndex: steps.length - 1,
    }
  }

  // ── The misstep each ask invites, drawn rather than told. ──────────────────
  if (p.ask === 'value-at-marked-cell') {
    const n = Number(answer)
    if (Number.isFinite(n) && n >= 2) {
      push({
        phase: 'trap',
        path: pathFor(route),
        numbers: numbersFor(route),
        focus: p.marks[0] ?? null,
        crossed: [],
        caption: T(
          `Careful: it takes ${n - 1} hops to reach the mark, and ${n - 1} is not the answer. The rabbit was already standing on square 1 before the first hop.`,
          `Hati-hati: menuju tanda itu perlu ${n - 1} lompatan, tapi ${n - 1} bukan jawabannya. Sebelum lompatan pertama pun kelinci sudah berdiri di petak ke-1.`,
        ),
        hold: 3400,
      })
    }
  } else if (p.ask === 'visit-order-of-marked-cells' && answer !== marks.map((m) => m.label).join('')) {
    push({
      phase: 'trap',
      path: pathFor(route),
      numbers: numbersFor(route),
      focus: null,
      crossed: [],
      caption: T(
        `Careful: reading the letters off the board left to right gives ${marks.map((m) => m.label).join('')}. That is where they are printed, not the order the rabbit reaches them.`,
        `Hati-hati: membaca hurufnya dari kiri ke kanan menghasilkan ${marks.map((m) => m.label).join('')}. Itu letak cetaknya, bukan urutan kelinci mendatanginya.`,
      ),
      hold: 3400,
    })
  }

  // ── What the question actually wanted. ────────────────────────────────────
  const closing =
    p.ask === 'value-at-marked-cell'
      ? T(
          `Counting along the route, the marked square comes out as square ${answer}.`,
          `Dihitung sepanjang rute, petak bertanda itu jatuh pada petak ke-${answer}.`,
        )
      : T(
          `${listEn(marks.map((m) => `${m.label} is square ${orderOf.get(key(m.cell)) ?? 0}`))}. Smallest first, that reads ${answer}.`,
          `${listId(marks.map((m) => `${m.label} petak ke-${orderOf.get(key(m.cell)) ?? 0}`))}. Urut dari yang paling awal: ${answer}.`,
        )
  push({
    phase: 'result',
    path: pathFor(route),
    numbers: numbersFor(route),
    focus: p.ask === 'value-at-marked-cell' ? (p.marks[0] ?? null) : null,
    crossed: [],
    caption: closing,
    reveal: answer,
    hold: 0,
  })

  return {
    rows: p.rows,
    cols: p.cols,
    blocked: p.blocked.map((cell) => [cell.c, cell.r] as [number, number]),
    start: [p.start.c, p.start.r],
    marks,
    answer,
    steps,
    finalIndex: steps.length - 1,
  }
}
