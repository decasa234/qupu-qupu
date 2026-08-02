import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, {
  isLegible,
  MAP_HEIGHT,
  MAP_WIDTH,
  pixelLength,
  solve,
  trapRoute,
  type Params,
} from './index.js'

const SEEDS = 340

/**
 * Independent oracle. Written from the DEFINITION of the puzzle — "a route is a
 * walk along drawn roads that never repeats a town, and it is worth the km on
 * those roads added together" — with no shared code with the generator's own
 * path search. Returns every route, so the test can compute the optimum, count
 * the ties, and compare route-for-route with what the concept believes.
 */
function oracleRoutes(p: Params): { towns: string[]; total: number }[] {
  const roads = p.roads
  const out: { towns: string[]; total: number }[] = []
  const walk = (at: string, visited: string[], total: number): void => {
    if (at === p.to) {
      out.push({ towns: [...visited], total })
      return
    }
    for (const road of roads) {
      let next: string | null = null
      if (road.a === at) next = road.b
      else if (road.b === at) next = road.a
      if (next === null || visited.includes(next)) continue
      walk(next, [...visited, next], total + road.km)
    }
  }
  walk(p.from, [p.from], 0)
  return out
}

/** The routes the ask actually allows, and what "best" means for it. */
function oracleEligible(p: Params): { towns: string[]; total: number }[] {
  if (p.ask === 'who-arrives-last') {
    return p.walkers.map((w) => {
      let total = 0
      for (let i = 0; i + 1 < w.route.length; i++) {
        const road = p.roads.find(
          (r) =>
            (r.a === w.route[i] && r.b === w.route[i + 1]) ||
            (r.b === w.route[i] && r.a === w.route[i + 1]),
        )
        total += road ? road.km : NaN
      }
      return { towns: [...w.route], total }
    })
  }
  const all = oracleRoutes(p)
  return p.ask === 'shortest-via-C' ? all.filter((r) => r.towns.includes(p.via)) : all
}

/** Mirrors src/lib/wmiBreakdown stripSectionLabels for the two labels we emit. */
function stripLabels(text: string): string {
  return text.replace(/\b(Find|Cari):\s*/g, '').replace(/\s{2,}/g, ' ').trim()
}

function expectNoOverlap(text: string, phrases: string[], where: string): void {
  const spans = phrases.map((phrase) => {
    const at = text.indexOf(phrase)
    return { phrase, at, end: at + phrase.length }
  })
  spans.sort((a, b) => a.at - b.at)
  for (let i = 1; i < spans.length; i++) {
    expect(
      spans[i].at >= spans[i - 1].end,
      `${where}: "${spans[i - 1].phrase}" overlaps "${spans[i].phrase}"`,
    ).toBe(true)
  }
}

/** A map whose two shortest routes tie at 9 km — the bug the schema must catch. */
const TIED: Params = {
  towns: [
    { id: 'B', name: 'Bogor', x: 56, y: 56 },
    { id: 'D', name: 'Depok', x: 252, y: 186 },
    { id: 'C', name: 'Ciawi', x: 246, y: 44 },
    { id: 'S', name: 'Sentul', x: 44, y: 176 },
  ],
  roads: [
    { a: 'B', b: 'C', km: 4, curve: 0 },
    { a: 'C', b: 'D', km: 5, curve: 0 },
    { a: 'B', b: 'S', km: 6, curve: 0 },
    { a: 'S', b: 'D', km: 3, curve: 0 },
  ],
  ask: 'shortest',
  from: 'B',
  to: 'D',
  via: '',
  walkers: [],
}

describe('map-route-distance', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('the oracle catches a tie the schema must reject', () => {
    const totals = oracleEligible(TIED).map((r) => r.total).sort((a, b) => a - b)
    expect(totals).toEqual([9, 9])
    expect(solve(TIED).unique).toBe(false)
    expect(() => concept.paramsSchema.parse(TIED)).toThrow()

    // Nudge one road by a single km and the very same map becomes answerable.
    const clean: Params = {
      ...TIED,
      roads: TIED.roads.map((r) => (r.a === 'S' && r.b === 'D' ? { ...r, km: 2 } : r)),
    }
    expect(solve(clean).unique).toBe(true)
    expect(() => concept.paramsSchema.parse(clean)).not.toThrow()
    expect(solve(clean).answer).toBe('8')
  })

  test('fewest roads is not the same as fewest km', () => {
    const p: Params = {
      towns: [
        { id: 'B', name: 'Bogor', x: 56, y: 56 },
        { id: 'D', name: 'Depok', x: 252, y: 186 },
        { id: 'C', name: 'Ciawi', x: 246, y: 44 },
        { id: 'S', name: 'Sentul', x: 44, y: 176 },
      ],
      roads: [
        { a: 'B', b: 'D', km: 9, curve: 0 },
        { a: 'B', b: 'C', km: 4, curve: 0 },
        { a: 'C', b: 'D', km: 3, curve: 0 },
        { a: 'B', b: 'S', km: 5, curve: 0 },
        { a: 'S', b: 'C', km: 2, curve: 0 },
      ],
      ask: 'shortest',
      from: 'B',
      to: 'D',
      via: '',
      walkers: [],
    }
    expect(() => concept.paramsSchema.parse(p)).not.toThrow()
    const s = solve(p)
    // The single-road route B–D is the only 1-road route and costs 9 km; the
    // 2-road route B–C–D costs 7 km and wins.
    expect(s.answer).toBe('7')
    expect(trapRoute(p, s)?.total).toBe(9)
    expect(concept.render(p).hint_steps_id?.at(-1)).toContain('7')
  })

  test(`${SEEDS} seeds: unique optimum, verified by an independent path search`, () => {
    const seenAsk = new Set<string>()
    const seenSize = new Set<number>()
    const seenRouteCount = new Set<number>()

    for (let seed = 1; seed <= SEEDS; seed++) {
      const p = concept.generate(mulberry32(seed))
      const where = `seed ${seed} (${JSON.stringify(p)})`
      expect(() => concept.paramsSchema.parse(p), where).not.toThrow()
      seenAsk.add(p.ask)
      seenSize.add(p.towns.length)

      // ── Shape sanity ────────────────────────────────────────────────────
      expect(p.towns.length, where).toBeGreaterThanOrEqual(4)
      expect(p.towns.length, where).toBeLessThanOrEqual(7)
      const ids = p.towns.map((t) => t.id)
      expect(new Set(ids).size, where).toBe(ids.length)
      for (const t of p.towns) {
        expect(t.id, where).toBe(t.name.charAt(0))
        expect(t.name.length, where).toBeGreaterThanOrEqual(3)
        expect(Number.isInteger(t.x) && Number.isInteger(t.y), where).toBe(true)
        expect(t.x, where).toBeGreaterThanOrEqual(20)
        expect(t.x, where).toBeLessThanOrEqual(MAP_WIDTH - 20)
        expect(t.y, where).toBeGreaterThanOrEqual(20)
        expect(t.y, where).toBeLessThanOrEqual(MAP_HEIGHT - 40)
      }
      expect(new Set(p.towns.map((t) => `${t.x},${t.y}`)).size, where).toBe(p.towns.length)
      // A child who cannot tell which km belongs to which road cannot add.
      expect(
        isLegible(p.towns, p.roads),
        `${where}: two km numbers land on top of each other, a circle, or a name`,
      ).toBe(true)

      const pairs = p.roads.map((r) => [r.a, r.b].sort().join('-'))
      expect(new Set(pairs).size, where).toBe(p.roads.length)
      for (const r of p.roads) {
        expect(r.a, where).not.toBe(r.b)
        expect(ids, where).toContain(r.a)
        expect(ids, where).toContain(r.b)
        expect(Number.isInteger(r.km), where).toBe(true)
        expect(r.km, where).toBeGreaterThanOrEqual(2)
        expect(r.km, where).toBeLessThanOrEqual(9)
        expect(Math.abs(r.curve), where).toBeLessThanOrEqual(60)
      }
      // Some pairs of towns are deliberately NOT joined — a complete graph
      // would make every ordering of the towns a route.
      const maxRoads = (p.towns.length * (p.towns.length - 1)) / 2
      expect(p.roads.length, where).toBeLessThan(maxRoads)

      expect(p.from, where).not.toBe(p.to)
      if (p.ask === 'shortest-via-C') {
        expect(ids, where).toContain(p.via)
        expect(p.via, where).not.toBe(p.from)
        expect(p.via, where).not.toBe(p.to)
      } else {
        expect(p.via, where).toBe('')
      }
      expect(p.walkers.length, where).toBe(p.ask === 'who-arrives-last' ? 3 : 0)

      // ── The independent search agrees, and the optimum is the ONLY one ──
      const all = oracleRoutes(p)
      expect(all.length, `${where}: the endpoints are not joined at all`).toBeGreaterThanOrEqual(3)
      expect(all.length, where).toBeLessThanOrEqual(5)
      seenRouteCount.add(all.length)

      const s = solve(p)
      // Route-for-route agreement between the concept and the oracle.
      const mine = new Set(s.routes.map((r) => r.towns.join('')))
      if (p.ask !== 'who-arrives-last') {
        expect(mine, where).toEqual(new Set(all.map((r) => r.towns.join(''))))
      }
      for (const r of s.routes) {
        const twin = all.find((x) => x.towns.join('') === r.towns.join(''))
        expect(twin, `${where}: ${r.towns.join('')} is not a real route`).toBeTruthy()
        expect(r.total, where).toBe((twin as { total: number }).total)
        expect(r.total, where).toBe(r.kms.reduce((sum, km) => sum + km, 0))
      }

      const eligible = oracleEligible(p)
      expect(eligible.length, where).toBeGreaterThanOrEqual(2)
      const wants = p.ask === 'shortest' || p.ask === 'shortest-via-C' ? 'min' : 'max'
      const totals = eligible.map((r) => r.total)
      const bestTotal = wants === 'min' ? Math.min(...totals) : Math.max(...totals)
      expect(
        totals.filter((t) => t === bestTotal).length,
        `${where}: two routes tie for best, so two answers would be right`,
      ).toBe(1)
      expect(s.unique, where).toBe(true)
      expect(s.best.total, where).toBe(bestTotal)

      const r = concept.render(p)
      if (p.ask === 'who-arrives-last') {
        const winner = eligible.find((x) => x.total === bestTotal) as { towns: string[] }
        const walker = p.walkers.find((w) => w.route.join('') === winner.towns.join(''))
        expect(r.answer, where).toBe(walker?.name)
      } else {
        expect(r.answer, where).toBe(String(bestTotal))
      }
      expect(r.answer_type, where).toBe('fill_in')
      expect(r.choices_en, where).toBeNull()
      expect(r.choices_id, where).toBeNull()

      // ── The picture must not give the answer away ───────────────────────
      // The route that LOOKS best (shortest / longest drawn line) is never the
      // one that IS best, and neither is the route with the fewest / most roads.
      const byPixel = s.eligible.reduce((acc, x) => {
        const better =
          wants === 'min'
            ? pixelLength(p, x) < pixelLength(p, acc)
            : pixelLength(p, x) > pixelLength(p, acc)
        return better ? x : acc
      }, s.eligible[0])
      expect(
        byPixel.towns.join(''),
        `${where}: the route that looks best on the page is also the answer`,
      ).not.toBe(s.best.towns.join(''))

      const trap = trapRoute(p, s)
      expect(trap, where).toBeTruthy()
      const trapValue =
        (trap as { walker: string; total: number }).walker === ''
          ? String((trap as { total: number }).total)
          : (trap as { walker: string }).walker
      expect(trapValue, `${where}: the trap answer is the right one`).not.toBe(r.answer)

      // ── Nothing leaks into a child's screen ─────────────────────────────
      const bd = r.breakdown!
      const prose = [
        r.body_en,
        r.body_id,
        r.hint_en ?? '',
        r.hint_id ?? '',
        ...(r.hint_steps_en ?? []),
        ...(r.hint_steps_id ?? []),
        ...bd.highlights.flatMap((h) => [h.phrase_en, h.phrase_id, h.note_en, h.note_id]),
        ...bd.quantities.flatMap((q) => [q.label_en, q.label_id, q.value]),
        bd.strategy.name_en,
        bd.strategy.name_id,
        bd.trap?.why_en ?? '',
        bd.trap?.why_id ?? '',
      ].join(' | ')
      expect(prose, where).not.toMatch(/undefined|NaN|\[object|null/)

      // ── The hints FORCE the answer: every route is added up out loud ────
      const extra = p.ask === 'shortest-via-C' ? 1 : 0
      expect((r.hint_steps_en ?? []).length, where).toBe(s.routes.length + 2 + extra)
      expect((r.hint_steps_id ?? []).length, where).toBe(s.routes.length + 2 + extra)
      for (let i = 0; i < s.routes.length; i++) {
        const route = s.routes[i]
        const names = route.towns
          .map((id) => p.towns.find((t) => t.id === id)?.name)
          .join('–')
        expect((r.hint_steps_en ?? [])[i + 1], where).toContain(names)
        expect((r.hint_steps_id ?? [])[i + 1], where).toContain(names)
        expect((r.hint_steps_en ?? [])[i + 1], where).toContain(`${route.total} km`)
        if (route.kms.length > 1) {
          expect((r.hint_steps_id ?? [])[i + 1], where).toContain(route.kms.join(' + '))
        }
      }
      // The closing line lines the totals up and reads the winner off them.
      const lastEn = (r.hint_steps_en ?? []).at(-1) as string
      const lastId = (r.hint_steps_id ?? []).at(-1) as string
      expect(lastEn, where).toContain(r.answer)
      expect(lastId, where).toContain(r.answer)
      for (const route of s.eligible) {
        expect(lastEn, where).toContain(`${route.total} km`)
        expect(lastId, where).toContain(`${route.total} km`)
      }

      // ── Breakdown ───────────────────────────────────────────────────────
      const display_en = stripLabels(r.body_en)
      const display_id = stripLabels(r.body_id)
      expect(bd.needsVisual, where).toBe(true)
      expect(bd.answer.value, where).toBe(r.answer)
      expect(bd.highlights.length, where).toBeGreaterThanOrEqual(5)
      for (const h of bd.highlights) {
        expect(display_en, `${where} phrase_en=${h.phrase_en}`).toContain(h.phrase_en)
        expect(display_id, `${where} phrase_id=${h.phrase_id}`).toContain(h.phrase_id)
      }
      expectNoOverlap(display_en, bd.highlights.map((h) => h.phrase_en), where)
      expectNoOverlap(display_id, bd.highlights.map((h) => h.phrase_id), where)
      expect(bd.trap?.wrong ?? null, where).toBe(trapValue)

      // The walkers, when there are any, must be named in the stem with the
      // exact route they take — a child cannot answer what is not printed.
      if (p.ask === 'who-arrives-last') {
        for (const w of p.walkers) {
          const names = w.route.map((id) => p.towns.find((t) => t.id === id)?.name).join('–')
          expect(r.body_id, where).toContain(w.name)
          expect(r.body_id, where).toContain(names)
          expect(r.body_en, where).toContain(names)
        }
      }
    }

    expect([...seenAsk].sort()).toEqual([
      'longest-no-repeat',
      'shortest',
      'shortest-via-C',
      'who-arrives-last',
    ])
    expect([...seenSize].sort()).toEqual([4, 5, 6, 7])
    expect(seenRouteCount.size).toBeGreaterThan(1)
  })

  test('the schema rejects the shapes that would break the concept', () => {
    const ok: Params = {
      towns: [
        { id: 'B', name: 'Bogor', x: 56, y: 56 },
        { id: 'D', name: 'Depok', x: 252, y: 186 },
        { id: 'C', name: 'Ciawi', x: 246, y: 44 },
        { id: 'S', name: 'Sentul', x: 44, y: 176 },
      ],
      roads: [
        { a: 'B', b: 'D', km: 9, curve: 0 },
        { a: 'B', b: 'C', km: 4, curve: 0 },
        { a: 'C', b: 'D', km: 3, curve: 0 },
        { a: 'B', b: 'S', km: 5, curve: 0 },
        { a: 'S', b: 'C', km: 2, curve: 0 },
      ],
      ask: 'shortest',
      from: 'B',
      to: 'D',
      via: '',
      walkers: [],
    }
    expect(() => concept.paramsSchema.parse(ok)).not.toThrow()
    // a road to a town that is not on the map
    expect(() =>
      concept.paramsSchema.parse({ ...ok, roads: [...ok.roads, { a: 'B', b: 'Z', km: 3, curve: 0 }] }),
    ).toThrow()
    // the same two towns joined twice
    expect(() =>
      concept.paramsSchema.parse({ ...ok, roads: [...ok.roads, { a: 'C', b: 'B', km: 8, curve: 0 }] }),
    ).toThrow()
    // start and finish are the same town
    expect(() => concept.paramsSchema.parse({ ...ok, to: 'B' })).toThrow()
    // a via town on an ask that has none
    expect(() => concept.paramsSchema.parse({ ...ok, via: 'C' })).toThrow()
    // the via ask with no via town
    expect(() => concept.paramsSchema.parse({ ...ok, ask: 'shortest-via-C' })).toThrow()
    // via must be a third town, not an endpoint
    expect(() =>
      concept.paramsSchema.parse({ ...ok, ask: 'shortest-via-C', via: 'B' }),
    ).toThrow()
    // walkers on an ask that has none
    expect(() =>
      concept.paramsSchema.parse({ ...ok, walkers: [{ name: 'Sinta', route: ['B', 'D'] }] }),
    ).toThrow()
    // a walker who steps between two towns with no road between them
    expect(() =>
      concept.paramsSchema.parse({
        ...ok,
        ask: 'who-arrives-last',
        walkers: [
          { name: 'Sinta', route: ['B', 'D'] },
          { name: 'Bayu', route: ['B', 'C', 'D'] },
          { name: 'Rani', route: ['B', 'S', 'D'] },
        ],
      }),
    ).toThrow()
    // two walkers on the same route
    expect(() =>
      concept.paramsSchema.parse({
        ...ok,
        ask: 'who-arrives-last',
        walkers: [
          { name: 'Sinta', route: ['B', 'D'] },
          { name: 'Bayu', route: ['B', 'D'] },
          { name: 'Rani', route: ['B', 'C', 'D'] },
        ],
      }),
    ).toThrow()
    // a route that doubles back through a town it already used
    expect(() =>
      concept.paramsSchema.parse({
        ...ok,
        ask: 'who-arrives-last',
        walkers: [
          { name: 'Sinta', route: ['B', 'D'] },
          { name: 'Bayu', route: ['B', 'C', 'D'] },
          { name: 'Rani', route: ['B', 'S', 'C', 'B', 'D'] },
        ],
      }),
    ).toThrow()
    // two towns drawn on the same spot
    expect(() =>
      concept.paramsSchema.parse({
        ...ok,
        towns: ok.towns.map((t) => (t.id === 'S' ? { ...t, x: 56, y: 56 } : t)),
      }),
    ).toThrow()
  })
})
