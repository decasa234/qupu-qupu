import { z } from 'zod'
import type { ConceptLogic, Rendered, Rng } from '../types.js'
import { buildMapRouteDistanceBreakdown } from './breakdown.js'

// A small map: towns joined by roads, each road with its length in km printed
// on it. The child walks from one town to another and has to ADD the roads.
//
// The two GE-PATH concepts that already exist (`grid-path-steps`,
// `maze-path-shortest`) are both UNWEIGHTED — there every step costs the same,
// so "shortest" means "fewest squares" and counting is enough. Here a road is
// worth 2..9 km, so the route with the fewest roads is routinely the LONGEST
// one, and counting hops gives the wrong answer. That is the whole point of the
// concept, and the generator enforces it (see `isWorthAsking`).
//
// The single fact this concept lives or dies on: with only a handful of towns
// there are only a handful of routes, so the honest method is EXHAUSTIVE — list
// every route, add each one up, then compare the totals. `hint_steps` walks
// exactly that: one line per route with its sum, then a comparison line. No
// route total is ever asserted without its addition shown.
//
// Because the child compares totals, a tie would make two different answers
// equally defensible. `solve` therefore reports `unique`, `paramsSchema` refuses
// params where the best total is shared, and `index.test.ts` re-checks by an
// independent path search written from the definition of the puzzle.
export const ASKS = ['shortest', 'shortest-via-C', 'longest-no-repeat', 'who-arrives-last'] as const
export type Ask = (typeof ASKS)[number]

/** Drawing box for the map. Shared verbatim with the figure and the explainer. */
export const MAP_WIDTH = 300
export const MAP_HEIGHT = 250
export const NODE_R = 18

const townSchema = z.object({
  /** The single capital letter drawn inside the circle. Unique within a map. */
  id: z.string().min(1).max(1),
  /** The town's real name, printed under its circle and used in all prose. */
  name: z.string().min(3).max(9),
  x: z.number().int().min(0).max(MAP_WIDTH),
  y: z.number().int().min(0).max(MAP_HEIGHT),
})

const roadSchema = z.object({
  a: z.string().min(1).max(1),
  b: z.string().min(1).max(1),
  /** Length of the road in km — the number printed on it. */
  km: z.number().int().min(2).max(9),
  /**
   * Bow of the drawn road, in pixels. Purely presentational, but stored so the
   * in-card figure and the explainer bow the same road the same way. Computed by
   * `roadCurve` so a road never runs through a town it does not touch.
   */
  curve: z.number().int().min(-60).max(60),
})

const walkerSchema = z.object({
  name: z.string().min(2).max(8),
  /** Town ids in walking order. */
  route: z.array(z.string().min(1).max(1)).min(2).max(7),
})

const paramsSchema = z
  .object({
    towns: z.array(townSchema).min(4).max(7),
    roads: z.array(roadSchema).min(4).max(14),
    ask: z.enum(ASKS),
    from: z.string().min(1).max(1),
    to: z.string().min(1).max(1),
    /** The town the route must pass through. `''` when the ask has no such town. */
    via: z.string().max(1),
    /** The three walkers. Empty unless the ask is `who-arrives-last`. */
    walkers: z.array(walkerSchema).max(3),
  })
  .refine((v) => new Set(v.towns.map((t) => t.id)).size === v.towns.length, {
    message: 'town letters must be distinct',
  })
  .refine((v) => new Set(v.towns.map((t) => t.name)).size === v.towns.length, {
    message: 'town names must be distinct',
  })
  .refine((v) => new Set(v.towns.map((t) => `${t.x},${t.y}`)).size === v.towns.length, {
    message: 'two towns may not sit on the same spot',
  })
  .refine(
    (v) => {
      const ids = new Set(v.towns.map((t) => t.id))
      return v.roads.every((r) => r.a !== r.b && ids.has(r.a) && ids.has(r.b))
    },
    { message: 'every road must join two different towns that exist' },
  )
  .refine(
    (v) => new Set(v.roads.map((r) => [r.a, r.b].sort().join('-'))).size === v.roads.length,
    { message: 'two towns may be joined by at most one road' },
  )
  .refine(
    (v) => {
      const ids = new Set(v.towns.map((t) => t.id))
      return v.from !== v.to && ids.has(v.from) && ids.has(v.to)
    },
    { message: 'the walk must start and end at two different towns that exist' },
  )
  .refine(
    (v) => {
      const ids = new Set(v.towns.map((t) => t.id))
      if (v.ask === 'shortest-via-C') return ids.has(v.via) && v.via !== v.from && v.via !== v.to
      return v.via === ''
    },
    { message: 'only the via ask carries a via town, and it is a third town' },
  )
  .refine((v) => v.walkers.length === (v.ask === 'who-arrives-last' ? 3 : 0), {
    message: 'the who-arrives-last ask carries exactly three walkers; the others carry none',
  })
  .refine((v) => new Set(v.walkers.map((w) => w.name)).size === v.walkers.length, {
    message: 'walkers must have distinct names',
  })
  .refine((v) => v.walkers.every((w) => isWalkable(v, w.route)), {
    message: 'each walker must follow real roads from start to finish without repeating a town',
  })
  .refine(
    (v) => new Set(v.walkers.map((w) => w.route.join(''))).size === v.walkers.length,
    { message: 'two walkers may not take the same route' },
  )
  // THE load-bearing rule. Everything above is shape; this is the promise that
  // exactly one route wins, so a child who compares correctly cannot be marked
  // wrong for picking the other member of a tie.
  .refine((v) => !structurallySound(v) || solve(v).unique, {
    message: 'exactly one route must win — a tie for best would make two answers defensible',
  })
export type Params = z.infer<typeof paramsSchema>

export const meta = {
  slug: 'map-route-distance',
  name_en: 'Shortest route on a map',
  name_id: 'Jarak terdekat di peta',
  grades: [1, 2, 3] as const,
  description_id:
    'Menjumlahkan panjang jalan di sepanjang setiap rute yang mungkin, lalu membandingkan totalnya untuk menemukan rute terpendek, rute terpanjang, atau siapa yang sampai paling akhir.',
} as const

// ── Solving ──────────────────────────────────────────────────────────────────

/**
 * The minimum shape `solve` needs. Declared structurally rather than as
 * `Params`, because a schema refinement calls `solve()`: taking `Params` there
 * would make `Params = z.infer<typeof paramsSchema>` reference itself. Same
 * trick `row-column-sum-grid` uses for its `SolvableGrid`.
 */
export interface SolvableMap {
  towns: { id: string; name: string; x: number; y: number }[]
  roads: { a: string; b: string; km: number; curve: number }[]
  ask: Ask
  from: string
  to: string
  via: string
  walkers: { name: string; route: string[] }[]
}

/** One route a child might walk, and what it costs. */
export interface Route {
  /** Town ids in walking order, `from` first and `to` last. */
  towns: string[]
  /** The km on each road walked; `kms[i]` joins `towns[i]` to `towns[i + 1]`. */
  kms: number[]
  total: number
  /** The walker who takes it, for the `who-arrives-last` ask; `''` otherwise. */
  walker: string
}

export interface Solution {
  /** Every route the child is meant to write down, in a km-neutral order. */
  routes: Route[]
  /** The subset the ask actually allows (all of `routes` unless a via town). */
  eligible: Route[]
  /** The routes ruled out by the via town — named in the hints, never silently dropped. */
  rejected: Route[]
  /** Whether the ask wants the smallest or the biggest total. */
  wants: 'min' | 'max'
  best: Route
  /** True when exactly one eligible route reaches the best total. */
  unique: boolean
  answer: string
}

const kmBetween = (p: SolvableMap, a: string, b: string): number | null => {
  const road = p.roads.find((r) => (r.a === a && r.b === b) || (r.a === b && r.b === a))
  return road ? road.km : null
}

/** A list of towns is walkable when every consecutive pair has a road and no town repeats. */
function isWalkable(p: SolvableMap, route: string[]): boolean {
  if (route.length < 2) return false
  if (new Set(route).size !== route.length) return false
  if (route[0] !== p.from || route[route.length - 1] !== p.to) return false
  const ids = new Set(p.towns.map((t) => t.id))
  if (!route.every((id) => ids.has(id))) return false
  for (let i = 0; i + 1 < route.length; i++) {
    if (kmBetween(p, route[i], route[i + 1]) === null) return false
  }
  return true
}

/** Enough of a params object to be worth running the solver on at all. */
function structurallySound(v: SolvableMap): boolean {
  const ids = new Set(v.towns.map((t) => t.id))
  if (ids.size !== v.towns.length || v.towns.length < 2) return false
  if (!v.roads.every((r) => r.a !== r.b && ids.has(r.a) && ids.has(r.b))) return false
  if (v.from === v.to || !ids.has(v.from) || !ids.has(v.to)) return false
  if (v.ask === 'shortest-via-C' && !ids.has(v.via)) return false
  if (v.ask === 'who-arrives-last') {
    if (v.walkers.length !== 3) return false
    if (!v.walkers.every((w) => isWalkable(v, w.route))) return false
  }
  return true
}

/** Safety valve: a pathological map must never spin the enumeration forever. */
const PATH_CAP = 60

/**
 * Every route from `from` to `to` that never visits a town twice, in an order
 * that carries NO information about the answer: fewest roads first, then
 * alphabetical by the letters walked. (Sorting by total would put the winner at
 * a predictable end of the list.)
 */
export function simplePaths(p: SolvableMap): Route[] {
  const adjacency = new Map<string, { to: string; km: number }[]>()
  for (const t of p.towns) adjacency.set(t.id, [])
  for (const r of p.roads) {
    adjacency.get(r.a)?.push({ to: r.b, km: r.km })
    adjacency.get(r.b)?.push({ to: r.a, km: r.km })
  }

  const out: Route[] = []
  const onPath = new Set<string>([p.from])
  const towns: string[] = [p.from]
  const kms: number[] = []

  const walk = (at: string): void => {
    if (out.length >= PATH_CAP) return
    if (at === p.to) {
      out.push({
        towns: [...towns],
        kms: [...kms],
        total: kms.reduce((sum, km) => sum + km, 0),
        walker: '',
      })
      return
    }
    for (const edge of adjacency.get(at) ?? []) {
      if (onPath.has(edge.to)) continue
      onPath.add(edge.to)
      towns.push(edge.to)
      kms.push(edge.km)
      walk(edge.to)
      onPath.delete(edge.to)
      towns.pop()
      kms.pop()
    }
  }
  walk(p.from)

  out.sort((a, b) => {
    if (a.towns.length !== b.towns.length) return a.towns.length - b.towns.length
    const ka = a.towns.join('')
    const kb = b.towns.join('')
    return ka < kb ? -1 : ka > kb ? 1 : 0
  })
  return out
}

/** Turns a walker's town list into a Route, reading the km off the roads. */
function walkerRoute(p: SolvableMap, walker: { name: string; route: string[] }): Route {
  const kms: number[] = []
  for (let i = 0; i + 1 < walker.route.length; i++) {
    kms.push(kmBetween(p, walker.route[i], walker.route[i + 1]) ?? 0)
  }
  return {
    towns: [...walker.route],
    kms,
    total: kms.reduce((sum, km) => sum + km, 0),
    walker: walker.name,
  }
}

const EMPTY_ROUTE: Route = { towns: [], kms: [], total: 0, walker: '' }

export function solve(p: SolvableMap): Solution {
  const wants: 'min' | 'max' =
    p.ask === 'shortest' || p.ask === 'shortest-via-C' ? 'min' : 'max'

  const routes =
    p.ask === 'who-arrives-last'
      ? p.walkers.map((w) => walkerRoute(p, w))
      : simplePaths(p)

  const eligible =
    p.ask === 'shortest-via-C' ? routes.filter((r) => r.towns.includes(p.via)) : routes
  const rejected = routes.filter((r) => !eligible.includes(r))

  if (eligible.length < 2) {
    // Nothing to compare: not a puzzle. Reported as not-unique so the schema
    // refuses it rather than shipping a question with a one-item comparison.
    return {
      routes,
      eligible,
      rejected,
      wants,
      best: eligible[0] ?? routes[0] ?? EMPTY_ROUTE,
      unique: false,
      answer: '',
    }
  }

  const bestTotal = eligible.reduce(
    (acc, r) => (wants === 'min' ? Math.min(acc, r.total) : Math.max(acc, r.total)),
    eligible[0].total,
  )
  const winners = eligible.filter((r) => r.total === bestTotal)
  const best = winners[0]
  const answer = p.ask === 'who-arrives-last' ? best.walker : String(best.total)

  return { routes, eligible, rejected, wants, best, unique: winners.length === 1, answer }
}

// ── The one tempting wrong answer ────────────────────────────────────────────

/**
 * The route a child gets by NOT adding: the one with the fewest roads when
 * hunting for the shortest walk, the one with the most roads when hunting for
 * the longest, and — for the via ask — the overall shortest route, which skips
 * the town the question insists on. `generate` guarantees each of these is a
 * single route and that it is NOT the answer, so the trap is always real.
 */
export function trapRoute(p: SolvableMap, s: Solution): Route | null {
  if (s.eligible.length === 0) return null
  if (p.ask === 'shortest-via-C') {
    const overall = s.routes.reduce((acc, r) => (r.total < acc.total ? r : acc), s.routes[0])
    const ties = s.routes.filter((r) => r.total === overall.total)
    if (ties.length !== 1 || overall.total === s.best.total) return null
    return overall
  }
  const hops = s.eligible.map((r) => r.kms.length)
  const extreme = s.wants === 'min' ? Math.min(...hops) : Math.max(...hops)
  const at = s.eligible.filter((r) => r.kms.length === extreme)
  if (at.length !== 1) return null
  if (at[0] === s.best) return null
  const wrong = p.ask === 'who-arrives-last' ? at[0].walker : String(at[0].total)
  return wrong === s.answer ? null : at[0]
}

// ── Geometry (drawing only, and the eyeball test) ────────────────────────────

const pos = (p: SolvableMap, id: string): { x: number; y: number } => {
  const t = p.towns.find((x) => x.id === id)
  return t ? { x: t.x, y: t.y } : { x: 0, y: 0 }
}

/** Straight-line distance between two drawn town circles. */
function pixelGap(p: SolvableMap, a: string, b: string): number {
  const A = pos(p, a)
  const B = pos(p, b)
  return Math.hypot(B.x - A.x, B.y - A.y)
}

/**
 * How long a route LOOKS on the page — the sum of the straight-line gaps
 * between the circles it visits. Nothing in the question depends on it; it
 * exists only so `isWorthAsking` can refuse maps where the answer could be
 * eyeballed instead of added.
 */
export function pixelLength(p: SolvableMap, route: Route): number {
  let sum = 0
  for (let i = 0; i + 1 < route.towns.length; i++) {
    sum += pixelGap(p, route.towns[i], route.towns[i + 1])
  }
  return sum
}

/** Distance from a point to a line segment. */
function pointToSegment(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number {
  const dx = bx - ax
  const dy = by - ay
  const lenSq = dx * dx + dy * dy
  if (lenSq === 0) return Math.hypot(px - ax, py - ay)
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq))
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy))
}

/**
 * How far a drawn road must bow so it does not run straight through a town it
 * does not touch. Zero for a road with a clear line. The sign pushes the bow
 * AWAY from the town in the way (NodeGraph offsets its control point along
 * `(-dy, dx) * curve`, so a positive cross product means the town sits on the
 * positive side and the bow must be negative).
 */
export function roadCurve(
  towns: { id: string; x: number; y: number }[],
  a: string,
  b: string,
): number {
  const A = towns.find((t) => t.id === a)
  const B = towns.find((t) => t.id === b)
  if (!A || !B) return 0
  const dx = B.x - A.x
  const dy = B.y - A.y
  let worst: { d: number; cross: number } | null = null
  for (const t of towns) {
    if (t.id === a || t.id === b) continue
    const d = pointToSegment(t.x, t.y, A.x, A.y, B.x, B.y)
    if (d >= NODE_R + 14) continue
    if (worst === null || d < worst.d) {
      worst = { d, cross: dx * (t.y - A.y) - dy * (t.x - A.x) }
    }
  }
  if (worst === null) return 0
  return worst.cross > 0 ? -34 : 34
}

/**
 * Where NodeGraph prints a road's km. Mirrors its `edgeLabelPoint`: the midpoint
 * of the two circles, shifted half the bow along the perpendicular.
 */
function labelPoint(
  towns: { id: string; x: number; y: number }[],
  road: { a: string; b: string; curve: number },
): { x: number; y: number } {
  const A = towns.find((t) => t.id === road.a)
  const B = towns.find((t) => t.id === road.b)
  if (!A || !B) return { x: 0, y: 0 }
  const mx = (A.x + B.x) / 2
  const my = (A.y + B.y) / 2
  if (road.curve === 0) return { x: mx, y: my }
  const dx = B.x - A.x
  const dy = B.y - A.y
  const len = Math.hypot(dx, dy) || 1
  return {
    x: mx + (-dy / len) * road.curve * 0.5,
    y: my + (dx / len) * road.curve * 0.5,
  }
}

/**
 * Whether the map can actually be READ once drawn: no two km numbers printed on
 * top of each other, and no km number buried under a town circle or its printed
 * name. A child who cannot tell which number belongs to which road cannot add
 * anything up, so this is a correctness rule for the question, not a nicety.
 */
export function isLegible(
  towns: { id: string; x: number; y: number }[],
  roads: { a: string; b: string; curve: number }[],
): boolean {
  const points = roads.map((r) => labelPoint(towns, r))
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      if (Math.hypot(points[i].x - points[j].x, points[i].y - points[j].y) < 20) return false
    }
  }
  for (const point of points) {
    for (const t of towns) {
      // Clear of the circle...
      if (Math.hypot(point.x - t.x, point.y - t.y) < NODE_R + 8) return false
      // ...and clear of the town name printed under it.
      if (Math.abs(point.x - t.x) < 30 && Math.abs(point.y - (t.y + NODE_R + 12)) < 11) return false
    }
  }
  return true
}

// ── Generation ───────────────────────────────────────────────────────────────

/**
 * Where the circles sit, one table per town count. The layouts are FIXED and the
 * towns are shuffled into them, so a slot carries no meaning; and because the km
 * on a road is drawn independently of how far apart its two circles happen to
 * be, a long road can be drawn short and a short road long. `isWorthAsking` then
 * refuses any map where ranking the routes by how long they LOOK would pick the
 * same winner as ranking them by the printed km — so the picture can never be
 * read instead of added.
 */
const LAYOUTS: Record<number, { x: number; y: number }[]> = {
  4: [
    { x: 56, y: 56 },
    { x: 246, y: 44 },
    { x: 44, y: 176 },
    { x: 252, y: 186 },
  ],
  5: [
    { x: 48, y: 62 },
    { x: 152, y: 38 },
    { x: 256, y: 70 },
    { x: 76, y: 186 },
    { x: 230, y: 188 },
  ],
  6: [
    { x: 46, y: 52 },
    { x: 150, y: 36 },
    { x: 258, y: 60 },
    { x: 44, y: 170 },
    { x: 154, y: 196 },
    { x: 262, y: 166 },
  ],
  7: [
    { x: 44, y: 48 },
    { x: 148, y: 34 },
    { x: 260, y: 56 },
    { x: 152, y: 116 },
    { x: 42, y: 172 },
    { x: 150, y: 198 },
    { x: 262, y: 176 },
  ],
}

/**
 * Real Indonesian towns, grouped so one map's towns plausibly belong to the same
 * corner of the country. Within a cluster every name starts with a different
 * letter, which is what lets the circle carry a single-letter label while the
 * prose uses the full name.
 */
const CLUSTERS: string[][] = [
  ['Bogor', 'Depok', 'Ciawi', 'Sentul', 'Garut', 'Anyer', 'Karawang', 'Tasik'],
  ['Kudus', 'Malang', 'Ngawi', 'Pati', 'Rembang', 'Tegal', 'Jepara', 'Blitar'],
  ['Ubud', 'Ende', 'Bima', 'Maumere', 'Kuta', 'Negara', 'Ruteng', 'Sape'],
]

const WALKER_NAMES = ['Sinta', 'Bayu', 'Rani', 'Dika', 'Nadia', 'Fajar', 'Tio', 'Lala']

/** Deals the middle towns into route-sized groups of one or two. */
function dealGroups(rng: Rng, middles: string[]): string[][] {
  const pool = [...middles]
  const groups: string[][] = []
  while (pool.length > 0) {
    const take = Math.min(pool.length, rng.int(1, 2))
    groups.push(pool.splice(0, take))
  }
  return groups
}

function draft(rng: Rng): Params | null {
  const size = rng.int(4, 7)
  const names = rng.shuffle(rng.pick(CLUSTERS)).slice(0, size)
  const ids = names.map((name) => name.charAt(0))

  const from = ids[0]
  const to = ids[1]
  const middles = rng.shuffle(ids.slice(2))

  // Seed routes: an optional direct road plus one route per group of middles.
  // Every middle town lands on some route, so no town is drawn as scenery.
  const groups = dealGroups(rng, middles)
  const seeds: string[][] = groups.map((group) => [from, ...group, to])
  if (rng.int(0, 1) === 1) seeds.unshift([from, to])
  // A crossing route stitches two of those chains together. Without it the
  // chains are disjoint and every middle town sits on exactly one route, which
  // would make "the route must pass through C" just another name for one route
  // instead of a restriction the child has to apply.
  if (groups.length >= 2 && rng.int(0, 3) > 0) {
    const order = rng.shuffle(groups.map((_, i) => i))
    seeds.push([from, rng.pick(groups[order[0]]), rng.pick(groups[order[1]]), to])
  }
  if (seeds.length < 2) return null
  if (new Set(seeds.map((s) => s.join(''))).size !== seeds.length) return null

  const kmOf = new Map<string, number>()
  const pairKey = (a: string, b: string): string => [a, b].sort().join('-')
  for (const seed of seeds) {
    for (let i = 0; i + 1 < seed.length; i++) {
      const key = pairKey(seed[i], seed[i + 1])
      if (!kmOf.has(key)) kmOf.set(key, rng.int(2, 9))
    }
  }
  const pairs = [...kmOf.entries()].map(([key, km]) => {
    const [a, b] = key.split('-')
    return { a, b, km }
  })

  // WIRING the towns and PLACING them are two separate draws, and this is the
  // placing one: the roads and their km are already fixed, so where a town ends
  // up on the page cannot change any answer. Slot permutations are tried until
  // one draws legibly — every km number clear of every other km number, of every
  // circle, and of every printed town name.
  let towns: { id: string; name: string; x: number; y: number }[] | null = null
  let roads: { a: string; b: string; km: number; curve: number }[] | null = null
  for (let tries = 0; tries < 14; tries++) {
    const slots = rng.shuffle(LAYOUTS[size])
    const laid = names.map((name, i) => ({
      id: name.charAt(0),
      name,
      x: slots[i].x,
      y: slots[i].y,
    }))
    const wired = pairs.map((r) => ({ ...r, curve: roadCurve(laid, r.a, r.b) }))
    if (!isLegible(laid, wired)) continue
    towns = laid
    roads = wired
    break
  }
  if (towns === null || roads === null) return null

  const skeleton: SolvableMap = {
    towns,
    roads,
    ask: 'shortest',
    from,
    to,
    via: '',
    walkers: [],
  }
  const paths = simplePaths(skeleton)
  // Three routes is the fewest that makes "compare them all" a real habit;
  // beyond five the hint list stops being something a child would ever write.
  if (paths.length < 3 || paths.length > 5) return null
  // Every town must be walked on by somebody, or the map carries dead scenery.
  const walked = new Set(paths.flatMap((r) => r.towns))
  if (walked.size !== towns.length) return null

  const ask = rng.pick(ASKS)
  if (ask === 'who-arrives-last') {
    const chosen = rng.shuffle(paths).slice(0, 3)
    const who = rng.shuffle(WALKER_NAMES).slice(0, 3)
    const walkers = chosen.map((r, i) => ({ name: who[i], route: [...r.towns] }))
    return { towns, roads, ask, from, to, via: '', walkers }
  }
  if (ask === 'shortest-via-C') {
    // The via town has to actually bite: at least two routes go through it, and
    // at least one does not (otherwise "via" adds nothing to the question).
    const candidates = middles.filter((id) => {
      const through = paths.filter((r) => r.towns.includes(id)).length
      return through >= 2 && through < paths.length
    })
    if (candidates.length === 0) return null
    return { towns, roads, ask, from, to, via: rng.pick(candidates), walkers: [] }
  }
  return { towns, roads, ask, from, to, via: '', walkers: [] }
}

/**
 * Quality filter, not a correctness rule — `paramsSchema` already refuses maps
 * whose best route is tied. This rejects the maps that are technically fine but
 * pedagogically bad: the ones a child could answer by LOOKING.
 */
function isWorthAsking(p: Params): boolean {
  const s = solve(p)
  if (!s.unique) return false
  if (s.eligible.length < 2) return false

  // 1. The eye must lose. Ranking the routes by how far apart their circles are
  //    drawn has to pick a different winner from ranking them by printed km.
  const byPixel = s.eligible.reduce((acc, r) => {
    const better = s.wants === 'min'
      ? pixelLength(p, r) < pixelLength(p, acc)
      : pixelLength(p, r) > pixelLength(p, acc)
    return better ? r : acc
  }, s.eligible[0])
  if (byPixel === s.best) return false

  // 2. Counting roads must lose too — the classic unweighted-path reflex the
  //    two existing GE-PATH concepts train. `trapRoute` is exactly that route,
  //    and it must exist, be the only one of its kind, and be wrong.
  const trap = trapRoute(p, s)
  if (trap === null) return false
  if (trap === s.best) return false
  if (p.ask !== 'shortest-via-C') {
    const hops = s.eligible.map((r) => r.kms.length)
    if (new Set(hops).size < 2) return false
  }

  // 3. Some pairs of towns must stay unjoined. On a complete map every ordering
  //    of the towns is a route, which is a different (and much longer) puzzle.
  if (p.roads.length >= (p.towns.length * (p.towns.length - 1)) / 2) return false

  // 4. Every road drawn on the map must be walked by some route the child
  //    compares, so the picture holds nothing that is never accounted for.
  const used = new Set<string>()
  for (const r of s.routes) {
    for (let i = 0; i + 1 < r.towns.length; i++) used.add([r.towns[i], r.towns[i + 1]].sort().join('-'))
  }
  if (used.size !== p.roads.length) return false

  return true
}

/**
 * A hand-built map used only if every draft misses (vanishingly unlikely).
 * Checked by `index.test.ts` against the same rules as a generated one.
 *
 *   B(Bogor) —4— C(Ciawi) —3— D(Depok)      total 7
 *   B —9— D                                 total 9   ← fewest roads, longest
 *   B —2— S(Sentul) —2— C —3— D             total 7 ... would tie, so S sits
 *                                            on a 5 instead:
 *   B —5— S —2— C —3— D                     total 10
 */
const FALLBACK: Params = {
  towns: [
    { id: 'B', name: 'Bogor', x: 56, y: 56 },
    { id: 'D', name: 'Depok', x: 252, y: 186 },
    { id: 'C', name: 'Ciawi', x: 246, y: 44 },
    { id: 'S', name: 'Sentul', x: 44, y: 176 },
  ],
  roads: [
    { a: 'B', b: 'C', km: 4, curve: 0 },
    { a: 'C', b: 'D', km: 3, curve: 0 },
    { a: 'B', b: 'D', km: 9, curve: 0 },
    { a: 'B', b: 'S', km: 5, curve: 0 },
    { a: 'S', b: 'C', km: 2, curve: 0 },
  ],
  ask: 'shortest',
  from: 'B',
  to: 'D',
  via: '',
  walkers: [],
}

export function generate(rng: Rng): Params {
  let first: Params | null = null
  for (let attempt = 0; attempt < 400; attempt++) {
    const candidate = draft(rng)
    if (candidate === null) continue
    if (!solve(candidate).unique) continue
    if (first === null) first = candidate
    if (isWorthAsking(candidate)) return candidate
  }
  return first ?? FALLBACK
}

// ── Rendering ────────────────────────────────────────────────────────────────

const nameOf = (p: SolvableMap, id: string): string =>
  p.towns.find((t) => t.id === id)?.name ?? id

/** "Bogor–Ciawi–Depok" — how every route is named, in prose and in the hints. */
export function routeText(p: SolvableMap, route: Route): string {
  return route.towns.map((id) => nameOf(p, id)).join('–')
}

/** "4 + 7 = 11" for a multi-road route, just "9" for a single road. */
export function sumText(route: Route): string {
  if (route.kms.length <= 1) return String(route.total)
  return `${route.kms.join(' + ')} = ${route.total}`
}

/** "A, B and C" / "A, B, dan C". */
export function listEn(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

export function listId(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  if (items.length === 2) return `${items[0]} dan ${items[1]}`
  return `${items.slice(0, -1).join(', ')}, dan ${items[items.length - 1]}`
}

/** The question sentence, ending in "?". Exported so the breakdown can quote it. */
export function askClause(p: SolvableMap, lang: 'en' | 'id'): string {
  const a = nameOf(p, p.from)
  const b = nameOf(p, p.to)
  if (p.ask === 'shortest') {
    return lang === 'id'
      ? `Berapa km panjang rute terpendek dari ${a} ke ${b}?`
      : `How many km long is the shortest route from ${a} to ${b}?`
  }
  if (p.ask === 'shortest-via-C') {
    const c = nameOf(p, p.via)
    return lang === 'id'
      ? `Berapa km panjang rute terpendek dari ${a} ke ${b} yang melewati ${c}?`
      : `How many km long is the shortest route from ${a} to ${b} that passes through ${c}?`
  }
  if (p.ask === 'longest-no-repeat') {
    return lang === 'id'
      ? `Berapa km panjang rute terpanjang dari ${a} ke ${b}?`
      : `How many km long is the longest route from ${a} to ${b}?`
  }
  return lang === 'id' ? `Siapa yang sampai di ${b} paling akhir?` : `Who arrives at ${b} last?`
}

/** The sentences that introduce the three walkers. Empty for the other asks. */
export function walkerClause(p: SolvableMap, lang: 'en' | 'id'): string {
  if (p.ask !== 'who-arrives-last' || p.walkers.length === 0) return ''
  const a = nameOf(p, p.from)
  const b = nameOf(p, p.to)
  const who = p.walkers.map((w) => w.name)
  const legs = p.walkers.map((w) => {
    const text = routeText(p, walkerRoute(p, w))
    return lang === 'id' ? `${w.name} lewat ${text}.` : `${w.name} goes ${text}.`
  })
  const opener =
    lang === 'id'
      ? `${listId(who)} berjalan sama cepat dari ${a} ke ${b}.`
      : `${listEn(who)} walk from ${a} to ${b} at the same speed.`
  return `${opener} ${legs.join(' ')}`
}

export function render(params: Params): Rendered {
  const s = solve(params)
  const breakdown = buildMapRouteDistanceBreakdown(params)
  const fromName = nameOf(params, params.from)
  const toName = nameOf(params, params.to)
  const viaName = params.via === '' ? '' : nameOf(params, params.via)
  const walkersText_en = walkerClause(params, 'en')
  const walkersText_id = walkerClause(params, 'id')

  // The `Find:` / `Cari:` markers are stripped before display; every breakdown
  // phrase is built against the stripped text, never across the marker.
  const body_en = [
    'This map joins some towns with roads.',
    'The number on each road is how long that road is, in km.',
    'You may only walk along the roads drawn, and you may not pass through the same town twice.',
    ...(walkersText_en === '' ? [] : [walkersText_en]),
    `Find: ${askClause(params, 'en')}`,
  ].join(' ')
  const body_id = [
    'Peta ini menghubungkan beberapa kota dengan jalan.',
    'Angka pada setiap jalan adalah panjang jalan itu dalam km.',
    'Kamu hanya boleh berjalan lewat jalan yang tergambar, dan tidak boleh melewati kota yang sama dua kali.',
    ...(walkersText_id === '' ? [] : [walkersText_id]),
    `Cari: ${askClause(params, 'id')}`,
  ].join(' ')

  // ── hint_steps: the exhaustive comparison, done in front of the child.
  // One line frames the method, one line per route DOES its addition, one line
  // (for the via ask) throws out the routes that miss the required town, and the
  // last line lines the totals up side by side and reads the winner off them.
  // No total is ever announced without the sum that produced it.
  const steps_en: string[] = []
  const steps_id: string[] = []

  if (params.ask === 'who-arrives-last') {
    steps_en.push(
      `They all walk at the same speed, so the one who arrives last is simply the one whose route is longest. Add up each route and compare.`,
    )
    steps_id.push(
      `Mereka berjalan sama cepat, jadi yang sampai paling akhir adalah yang rutenya paling panjang. Jumlahkan panjang tiap rute, lalu bandingkan.`,
    )
  } else {
    steps_en.push(
      `A route is as long as the numbers on the roads it uses added together. Because you may not pass through a town twice, there are only ${s.routes.length} routes from ${fromName} to ${toName} — so write down every one of them and add it up.`,
    )
    steps_id.push(
      `Panjang sebuah rute adalah jumlah angka pada jalan-jalan yang dilewatinya. Karena tidak boleh melewati kota yang sama dua kali, dari ${fromName} ke ${toName} hanya ada ${s.routes.length} rute — jadi tulis semuanya dan jumlahkan satu per satu.`,
    )
  }

  for (const route of s.routes) {
    const text = routeText(params, route)
    if (route.walker !== '') {
      steps_en.push(`${route.walker} goes ${text}: ${sumText(route)} km.`)
      steps_id.push(`${route.walker} lewat ${text}: ${sumText(route)} km.`)
    } else {
      steps_en.push(`Route ${text}: ${sumText(route)} km.`)
      steps_id.push(`Rute ${text}: ${sumText(route)} km.`)
    }
  }

  if (params.ask === 'shortest-via-C') {
    const out = s.rejected.map((r) => routeText(params, r))
    const keep = s.eligible.map((r) => routeText(params, r))
    steps_en.push(
      `The route has to pass through ${viaName}, so cross out ${listEn(out)} — ${out.length === 1 ? 'it misses' : 'they miss'} ${viaName}. That leaves ${listEn(keep)}.`,
    )
    steps_id.push(
      `Rutenya wajib lewat ${viaName}, jadi coret ${listId(out)} karena tidak lewat ${viaName}. Yang tersisa: ${listId(keep)}.`,
    )
  }

  const totalsEn = s.eligible.map((r) =>
    r.walker === '' ? `${routeText(params, r)} ${r.total} km` : `${r.walker} ${r.total} km`,
  )
  const totalsId = s.eligible.map((r) =>
    r.walker === '' ? `${routeText(params, r)} ${r.total} km` : `${r.walker} ${r.total} km`,
  )
  const bestText = routeText(params, s.best)
  if (params.ask === 'who-arrives-last') {
    steps_en.push(
      `Line the totals up: ${listEn(totalsEn)}. The biggest is ${s.best.total} km, so ${s.best.walker} walks the farthest and arrives last.`,
    )
    steps_id.push(
      `Sejajarkan totalnya: ${listId(totalsId)}. Yang paling besar ${s.best.total} km, jadi ${s.best.walker} berjalan paling jauh dan sampai paling akhir.`,
    )
  } else if (s.wants === 'min') {
    steps_en.push(
      `Line the totals up: ${listEn(totalsEn)}. The smallest is ${s.best.total} km, along ${bestText}. So the answer is ${s.answer}.`,
    )
    steps_id.push(
      `Sejajarkan totalnya: ${listId(totalsId)}. Yang paling kecil ${s.best.total} km, yaitu lewat ${bestText}. Jadi jawabannya ${s.answer}.`,
    )
  } else {
    steps_en.push(
      `Line the totals up: ${listEn(totalsEn)}. The biggest is ${s.best.total} km, along ${bestText}. So the answer is ${s.answer}.`,
    )
    steps_id.push(
      `Sejajarkan totalnya: ${listId(totalsId)}. Yang paling besar ${s.best.total} km, yaitu lewat ${bestText}. Jadi jawabannya ${s.answer}.`,
    )
  }

  return {
    body_en,
    body_id,
    answer_type: 'fill_in',
    choices_en: null,
    choices_id: null,
    answer: s.answer,
    hint_en:
      'There are only a few routes, so write them all down and add each one up. The route with the fewest roads is often not the shortest one — the numbers decide, not the picture.',
    hint_id:
      'Rutenya hanya sedikit, jadi tulis semuanya lalu jumlahkan satu per satu. Rute dengan jalan paling sedikit sering kali bukan yang terpendek — yang menentukan angkanya, bukan gambarnya.',
    hint_steps_en: steps_en,
    hint_steps_id: steps_id,
    breakdown,
  }
}

const concept: ConceptLogic<Params> = { meta, paramsSchema, generate, render }
export default concept
