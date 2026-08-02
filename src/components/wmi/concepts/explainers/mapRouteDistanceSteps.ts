import type { Lang } from './makeTenSteps'

// `map-route-distance`. Towns joined by roads, each road worth a printed number
// of km, and a walk to be measured from one town to another.
//
// The move this storyboard has to teach is that the picture is not the answer:
// the route with the fewest roads, or the one drawn straightest, is routinely
// not the winner. So the beats do the only honest thing — light up ONE route at
// a time, add its roads out loud, park the total in a ledger, and only once
// every route has a total in the ledger does the comparison happen. Nothing is
// ever announced; every number arrives as a sum the child watched being made.
//
// Mirrors api/services/wmi/concepts/map-route-distance. Params arrive as
// `unknown` from the DB, so the map, the routes and the winner are all
// re-derived here rather than trusted.
export type MapRouteAsk = 'shortest' | 'shortest-via-C' | 'longest-no-repeat' | 'who-arrives-last'
export type MapRoutePhase = 'setup' | 'route' | 'filter' | 'trap' | 'result'

/** How a road is drawn on a given beat. */
export type RoadState = 'idle' | 'lit' | 'trap' | 'best'
/** How a town is drawn on a given beat. */
export type TownState = 'idle' | 'end' | 'lit' | 'must'

export interface MapRouteTown {
  id: string
  name: string
  x: number
  y: number
}

export interface MapRouteRoad {
  a: string
  b: string
  km: number
  curve: number
}

export interface MapRouteWalker {
  name: string
  route: string[]
}

export interface MapRouteParams {
  towns: MapRouteTown[]
  roads: MapRouteRoad[]
  ask: MapRouteAsk
  from: string
  to: string
  via: string
  walkers: MapRouteWalker[]
}

/** One row of the running totals ledger under the map. */
export interface LedgerRow {
  /** Short label: the town letters walked, or the walker's name. */
  label: string
  total: number
  tone: 'plain' | 'out' | 'trap' | 'best'
}

export interface MapRouteBeat {
  phase: MapRoutePhase
  caption: string
  /** Aligned with `roads`. */
  roadState: RoadState[]
  /** Aligned with `towns`. */
  townState: TownState[]
  ledger: LedgerRow[]
  /** The answer — non-null ONLY on the final beat. */
  reveal: string | null
  hold: number
}

export interface MapRouteStoryboard {
  towns: MapRouteTown[]
  roads: MapRouteRoad[]
  answer: string
  /** How many routes get a beat of their own — drives the "Route k of n" chip. */
  routeCount: number
  /** The town every route must pass through, or `''`. */
  via: string
  steps: MapRouteBeat[]
  finalIndex: number
}

const FALLBACK: MapRouteParams = {
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

const int = (v: unknown, fallback: number): number =>
  typeof v === 'number' && Number.isFinite(v) ? Math.round(v) : fallback

const str = (v: unknown): string => (typeof v === 'string' ? v : '')

function read(raw: unknown): MapRouteParams {
  const p = (raw ?? {}) as Partial<MapRouteParams>
  const towns = (Array.isArray(p.towns) ? p.towns : [])
    .map((t) => ({
      id: str((t as MapRouteTown)?.id).slice(0, 1),
      name: str((t as MapRouteTown)?.name),
      x: int((t as MapRouteTown)?.x, -1),
      y: int((t as MapRouteTown)?.y, -1),
    }))
    .filter((t) => t.id !== '' && t.name !== '' && t.x >= 0 && t.y >= 0)
  if (towns.length < 2 || new Set(towns.map((t) => t.id)).size !== towns.length) return FALLBACK

  const ids = new Set(towns.map((t) => t.id))
  const roads = (Array.isArray(p.roads) ? p.roads : [])
    .map((r) => ({
      a: str((r as MapRouteRoad)?.a).slice(0, 1),
      b: str((r as MapRouteRoad)?.b).slice(0, 1),
      km: int((r as MapRouteRoad)?.km, 0),
      curve: Math.max(-60, Math.min(60, int((r as MapRouteRoad)?.curve, 0))),
    }))
    .filter((r) => r.a !== r.b && ids.has(r.a) && ids.has(r.b) && r.km > 0)
  if (roads.length === 0) return FALLBACK

  const from = ids.has(str(p.from)) ? str(p.from) : towns[0].id
  const to = ids.has(str(p.to)) && str(p.to) !== from ? str(p.to) : towns[1].id

  const asked = str(p.ask)
  const ask: MapRouteAsk =
    asked === 'shortest-via-C' || asked === 'longest-no-repeat' || asked === 'who-arrives-last'
      ? asked
      : 'shortest'

  const via = ask === 'shortest-via-C' && ids.has(str(p.via)) && str(p.via) !== from && str(p.via) !== to
    ? str(p.via)
    : ''

  const walkers = (Array.isArray(p.walkers) ? p.walkers : [])
    .map((w) => ({
      name: str((w as MapRouteWalker)?.name),
      route: (Array.isArray((w as MapRouteWalker)?.route) ? (w as MapRouteWalker).route : []).map(
        (id) => str(id).slice(0, 1),
      ),
    }))
    .filter((w) => w.name !== '' && isWalkable({ roads, from, to }, w.route))

  // An ask whose data did not survive the re-derivation cannot be narrated
  // honestly; drop back to the question the map can always answer.
  if (ask === 'shortest-via-C' && via === '') {
    return { towns, roads, ask: 'shortest', from, to, via: '', walkers: [] }
  }
  if (ask === 'who-arrives-last' && walkers.length < 2) {
    return { towns, roads, ask: 'shortest', from, to, via: '', walkers: [] }
  }
  return { towns, roads, ask, from, to, via, walkers }
}

interface Route {
  towns: string[]
  kms: number[]
  total: number
  walker: string
}

const kmBetween = (
  roads: MapRouteRoad[],
  a: string,
  b: string,
): number | null => {
  const road = roads.find((r) => (r.a === a && r.b === b) || (r.a === b && r.b === a))
  return road ? road.km : null
}

function isWalkable(
  m: { roads: MapRouteRoad[]; from: string; to: string },
  route: string[],
): boolean {
  if (route.length < 2) return false
  if (new Set(route).size !== route.length) return false
  if (route[0] !== m.from || route[route.length - 1] !== m.to) return false
  for (let i = 0; i + 1 < route.length; i++) {
    if (kmBetween(m.roads, route[i], route[i + 1]) === null) return false
  }
  return true
}

const PATH_CAP = 60

/** Every route that never repeats a town, ordered exactly as the backend orders them. */
function simplePaths(p: MapRouteParams): Route[] {
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

function walkerRoute(p: MapRouteParams, w: MapRouteWalker): Route {
  const kms: number[] = []
  for (let i = 0; i + 1 < w.route.length; i++) {
    kms.push(kmBetween(p.roads, w.route[i], w.route[i + 1]) ?? 0)
  }
  return {
    towns: [...w.route],
    kms,
    total: kms.reduce((sum, km) => sum + km, 0),
    walker: w.name,
  }
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

export function buildMapRouteDistanceSteps(raw: unknown, lang: Lang): MapRouteStoryboard {
  const p = read(raw)
  const T = (en: string, id: string) => (lang === 'id' ? id : en)
  const nameOf = (id: string): string => p.towns.find((t) => t.id === id)?.name ?? id
  const routeText = (r: Route): string => r.towns.map(nameOf).join('–')
  const routeTag = (r: Route): string => (r.walker === '' ? r.towns.join('–') : r.walker)
  const sumText = (r: Route): string =>
    r.kms.length <= 1 ? String(r.total) : `${r.kms.join(' + ')} = ${r.total}`

  const routes = p.ask === 'who-arrives-last' ? p.walkers.map((w) => walkerRoute(p, w)) : simplePaths(p)
  const eligible = p.ask === 'shortest-via-C' ? routes.filter((r) => r.towns.includes(p.via)) : routes
  const rejected = routes.filter((r) => !eligible.includes(r))
  const wants: 'min' | 'max' = p.ask === 'shortest' || p.ask === 'shortest-via-C' ? 'min' : 'max'

  const pool = eligible.length > 0 ? eligible : routes
  const best =
    pool.length === 0
      ? { towns: [], kms: [], total: 0, walker: '' }
      : pool.reduce((acc, r) =>
          wants === 'min' ? (r.total < acc.total ? r : acc) : r.total > acc.total ? r : acc,
        )
  const answer = p.ask === 'who-arrives-last' ? best.walker : String(best.total)

  // The route a child gets by counting roads instead of adding km — the one the
  // trap beat draws in rose. Null when no single route stands out that way.
  const trapRoute = ((): Route | null => {
    if (pool.length === 0) return null
    if (p.ask === 'shortest-via-C') {
      const overall = routes.reduce((acc, r) => (r.total < acc.total ? r : acc), routes[0])
      const ties = routes.filter((r) => r.total === overall.total)
      return ties.length === 1 && overall !== best && overall.total !== best.total ? overall : null
    }
    const hops = pool.map((r) => r.kms.length)
    const extreme = wants === 'min' ? Math.min(...hops) : Math.max(...hops)
    const at = pool.filter((r) => r.kms.length === extreme)
    if (at.length !== 1 || at[0] === best || at[0].total === best.total) return null
    return at[0]
  })()

  const roadIndex = new Map<string, number>()
  p.roads.forEach((r, i) => roadIndex.set([r.a, r.b].sort().join('-'), i))
  const roadsOf = (r: Route): number[] => {
    const out: number[] = []
    for (let i = 0; i + 1 < r.towns.length; i++) {
      const at = roadIndex.get([r.towns[i], r.towns[i + 1]].sort().join('-'))
      if (at !== undefined) out.push(at)
    }
    return out
  }

  const baseTowns = (): TownState[] =>
    p.towns.map((t) => (t.id === p.from || t.id === p.to ? 'end' : t.id === p.via ? 'must' : 'idle'))

  const paint = (route: Route | null, tone: RoadState): { roadState: RoadState[]; townState: TownState[] } => {
    const roadState: RoadState[] = p.roads.map(() => 'idle')
    const townState = baseTowns()
    if (route === null) return { roadState, townState }
    for (const i of roadsOf(route)) roadState[i] = tone
    for (const id of route.towns) {
      const at = p.towns.findIndex((t) => t.id === id)
      if (at >= 0 && townState[at] === 'idle') townState[at] = 'lit'
    }
    return { roadState, townState }
  }

  const steps: MapRouteBeat[] = []
  const ledger: LedgerRow[] = []
  const push = (beat: Omit<MapRouteBeat, 'reveal' | 'hold'> & { reveal?: string | null; hold?: number }) => {
    steps.push({ reveal: null, hold: 2800, ...beat })
  }

  // ── Beat 1 — the map, and the rule that makes the list of routes finite. ──
  {
    const { roadState, townState } = paint(null, 'idle')
    push({
      phase: 'setup',
      roadState,
      townState,
      ledger: [],
      caption:
        p.ask === 'who-arrives-last'
          ? T(
              `${listEn(routes.map((r) => r.walker))} all walk at the same speed, so whoever arrives last is simply whoever walks the most km. Add each route up.`,
              `${listId(routes.map((r) => r.walker))} berjalan sama cepat, jadi yang sampai paling akhir adalah yang menempuh km paling banyak. Jumlahkan tiap rute.`,
            )
          : T(
              `A route is worth the numbers on its roads added together. You may not pass a town twice, so there are only ${routes.length} routes from ${nameOf(p.from)} to ${nameOf(p.to)} — add up every one of them.`,
              `Panjang rute adalah jumlah angka pada jalan-jalannya. Karena tidak boleh melewati kota yang sama dua kali, dari ${nameOf(p.from)} ke ${nameOf(p.to)} hanya ada ${routes.length} rute — jumlahkan semuanya.`,
            ),
      hold: 3200,
    })
  }

  // ── Beats 2.. — one route at a time, added out loud into the ledger. ──────
  for (const route of routes) {
    ledger.push({ label: routeTag(route), total: route.total, tone: 'plain' })
    const { roadState, townState } = paint(route, 'lit')
    push({
      phase: 'route',
      roadState,
      townState,
      ledger: ledger.map((row) => ({ ...row })),
      caption:
        route.walker === ''
          ? T(`Route ${routeText(route)}: ${sumText(route)} km.`, `Rute ${routeText(route)}: ${sumText(route)} km.`)
          : T(
              `${route.walker} goes ${routeText(route)}: ${sumText(route)} km.`,
              `${route.walker} lewat ${routeText(route)}: ${sumText(route)} km.`,
            ),
      hold: 3000,
    })
  }

  // ── The via town throws routes out, and it says which and why. ───────────
  if (p.ask === 'shortest-via-C' && rejected.length > 0) {
    for (const row of ledger) {
      if (rejected.some((r) => routeTag(r) === row.label)) row.tone = 'out'
    }
    const { roadState, townState } = paint(null, 'idle')
    push({
      phase: 'filter',
      roadState,
      townState,
      ledger: ledger.map((row) => ({ ...row })),
      caption: T(
        `The route has to pass through ${nameOf(p.via)}, so ${listEn(rejected.map(routeText))} ${rejected.length === 1 ? 'is' : 'are'} out — ${rejected.length === 1 ? 'it misses' : 'they miss'} ${nameOf(p.via)} altogether.`,
        `Rutenya wajib lewat ${nameOf(p.via)}, jadi ${listId(rejected.map(routeText))} dicoret karena tidak melewati ${nameOf(p.via)} sama sekali.`,
      ),
      hold: 3200,
    })
  }

  // ── The tempting route, drawn instead of told. ───────────────────────────
  if (trapRoute !== null) {
    for (const row of ledger) {
      if (row.label === routeTag(trapRoute)) row.tone = 'trap'
    }
    const { roadState, townState } = paint(trapRoute, 'trap')
    push({
      phase: 'trap',
      roadState,
      townState,
      ledger: ledger.map((row) => ({ ...row })),
      caption:
        p.ask === 'shortest-via-C'
          ? T(
              `${routeText(trapRoute)} is the shortest way of all at ${trapRoute.total} km, which is why it is tempting — but it never touches ${nameOf(p.via)}, so it cannot be the answer.`,
              `${routeText(trapRoute)} memang paling pendek dari semuanya, ${trapRoute.total} km, jadi menggoda — tapi rute itu tidak lewat ${nameOf(p.via)}, jadi tidak boleh jadi jawaban.`,
            )
          : wants === 'min'
            ? T(
                `Careful: ${routeTag(trapRoute)} uses the fewest roads, so it looks like the quick way — but its roads add up to ${trapRoute.total} km, and that is not the smallest total in the list.`,
                `Hati-hati: ${routeTag(trapRoute)} memakai jalan paling sedikit sehingga terlihat paling cepat — padahal jalan-jalannya berjumlah ${trapRoute.total} km, dan itu bukan total terkecil di daftar.`,
              )
            : T(
                `Careful: ${routeTag(trapRoute)} passes the most towns, so it looks like the long way round — but its roads only add up to ${trapRoute.total} km.`,
                `Hati-hati: ${routeTag(trapRoute)} melewati paling banyak kota sehingga terlihat paling jauh — padahal jalan-jalannya hanya berjumlah ${trapRoute.total} km.`,
              ),
      hold: 3400,
    })
  }

  // ── The comparison, with every total already on the table. ───────────────
  {
    for (const row of ledger) {
      if (row.tone === 'out') continue
      row.tone = row.label === routeTag(best) ? 'best' : 'plain'
    }
    const { roadState, townState } = paint(best, 'best')
    const totals = eligible.map((r) => `${routeTag(r)} ${r.total} km`)
    push({
      phase: 'result',
      roadState,
      townState,
      ledger: ledger.map((row) => ({ ...row })),
      caption:
        p.ask === 'who-arrives-last'
          ? T(
              `Side by side: ${listEn(totals)}. ${best.total} km is the biggest, so ${best.walker} arrives last.`,
              `Berdampingan: ${listId(totals)}. ${best.total} km yang paling besar, jadi ${best.walker} sampai paling akhir.`,
            )
          : wants === 'min'
            ? T(
                `Side by side: ${listEn(totals)}. ${best.total} km is the smallest, along ${routeText(best)}.`,
                `Berdampingan: ${listId(totals)}. ${best.total} km yang paling kecil, yaitu lewat ${routeText(best)}.`,
              )
            : T(
                `Side by side: ${listEn(totals)}. ${best.total} km is the biggest, along ${routeText(best)}.`,
                `Berdampingan: ${listId(totals)}. ${best.total} km yang paling besar, yaitu lewat ${routeText(best)}.`,
              ),
      reveal: answer,
      hold: 0,
    })
  }

  return {
    towns: p.towns,
    roads: p.roads,
    answer,
    routeCount: routes.length,
    via: p.via === '' ? '' : nameOf(p.via),
    steps,
    finalIndex: steps.length - 1,
  }
}
