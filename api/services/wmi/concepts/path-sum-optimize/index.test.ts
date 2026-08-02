import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { divergence, solve, type Cell, type Params } from './index.js'

const SEEDS = 320

/**
 * Independent oracle. Written from the DEFINITION of the puzzle — "walk from the
 * top-left square to the bottom-right one, taking only the allowed steps, never
 * standing on a square twice, and add up what you step on" — with no shared code
 * with the backward table the concept reasons by. It returns EVERY legal route,
 * so the test can check the stated optimum, the uniqueness of the winner, and
 * the no-reuse rule without trusting a single line of `index.ts`.
 *
 * Deliberately written as a breadth-of-partial-walks queue rather than the
 * recursion `enumerateRoutes` uses, so a bug in one would not hide in the other.
 */
function everyRoute(p: Params): Cell[][] {
  const finish = `${p.rows - 1},${p.cols - 1}`
  const done: Cell[][] = []
  let frontier: Cell[][] = [[{ r: 0, c: 0 }]]

  while (frontier.length > 0) {
    const next: Cell[][] = []
    for (const walk of frontier) {
      const at = walk[walk.length - 1]
      if (`${at.r},${at.c}` === finish) {
        done.push(walk)
        continue
      }
      const used = new Set(walk.map((x) => `${x.r},${x.c}`))
      const candidates: Cell[] = [
        { r: at.r, c: at.c + 1 },
        { r: at.r + 1, c: at.c },
      ]
      if (p.moves === 'left-right-down') candidates.push({ r: at.r, c: at.c - 1 })
      for (const step of candidates) {
        if (step.r < 0 || step.r >= p.rows || step.c < 0 || step.c >= p.cols) continue
        if (used.has(`${step.r},${step.c}`)) continue
        next.push([...walk, step])
      }
    }
    frontier = next
  }
  return done
}

const total = (p: Params, route: Cell[]): number =>
  route.reduce((sum, x) => sum + p.grid[x.r][x.c], 0)

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

describe('path-sum-optimize', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('the oracle catches a tied optimum the schema must reject', () => {
    // Mirror-symmetric grid: the route across-then-down and the route
    // down-then-across collect the same numbers, so "the best route" is not a
    // thing and no figure could honestly draw one.
    const tied: Params = {
      rows: 4,
      cols: 4,
      grid: [
        [1, 2, 3, 4],
        [2, 5, 6, 3],
        [3, 6, 5, 2],
        [4, 3, 2, 1],
      ],
      moves: 'right-or-down',
      ask: 'max',
    }
    const routes = everyRoute(tied)
    const best = Math.max(...routes.map((r) => total(tied, r)))
    expect(routes.filter((r) => total(tied, r) === best).length).toBeGreaterThan(1)
    expect(solve(tied).uniqueBest).toBe(false)
    expect(() => concept.paramsSchema.parse(tied)).toThrow()
  })

  test('a largest-total ask with sideways steps is refused outright', () => {
    // With left steps allowed and no bound on how much of the grid a route may
    // swallow, "the largest total" stops being a small piece of reasoning.
    const p: Params = {
      rows: 4,
      cols: 4,
      grid: [
        [3, 9, 1, 2],
        [8, 2, 7, 1],
        [1, 6, 3, 9],
        [4, 5, 8, 2],
      ],
      moves: 'left-right-down',
      ask: 'max',
    }
    expect(() => concept.paramsSchema.parse(p)).toThrow()
  })

  test('sideways steps never help the smallest total, and are still enumerated', () => {
    const p: Params = {
      rows: 4,
      cols: 4,
      grid: [
        [3, 9, 1, 2],
        [8, 2, 7, 1],
        [1, 6, 3, 9],
        [4, 5, 8, 2],
      ],
      moves: 'left-right-down',
      ask: 'min',
    }
    const routes = everyRoute(p)
    // cols^(rows-1): once a row is entered it can only be crossed one way, so a
    // route is settled by the column it drops from in each of the first 3 rows.
    expect(routes.length).toBe(4 ** 3)
    expect(routes.some((r) => r.length > p.rows + p.cols - 1)).toBe(true)
    const best = Math.min(...routes.map((r) => total(p, r)))
    expect(solve(p).best).toBe(best)
    // The winner is monotone: not one of its steps goes left.
    const winner = routes.find((r) => total(p, r) === best) as Cell[]
    expect(winner.every((cell, i) => i === 0 || cell.c >= winner[i - 1].c)).toBe(true)
  })

  test(`${SEEDS} seeds: the optimum is exhaustively confirmed and uniquely reached`, () => {
    const seenMoves = new Set<string>()
    const seenAsk = new Set<string>()
    const seenShape = new Set<string>()
    let seenTraps = 0
    let seenSideways = 0

    for (let seed = 1; seed <= SEEDS; seed++) {
      const p = concept.generate(mulberry32(seed))
      const where = `seed ${seed} (${JSON.stringify(p)})`
      expect(() => concept.paramsSchema.parse(p), where).not.toThrow()
      seenMoves.add(p.moves)
      seenAsk.add(p.ask)
      seenShape.add(`${p.rows}x${p.cols}`)

      // ── Shape sanity ────────────────────────────────────────────────────
      expect(p.grid.length, where).toBe(p.rows)
      for (const row of p.grid) {
        expect(row.length, where).toBe(p.cols)
        for (const v of row) {
          expect(Number.isInteger(v), where).toBe(true)
          expect(v, where).toBeGreaterThanOrEqual(1)
          expect(v, where).toBeLessThanOrEqual(9)
        }
      }
      if (p.moves === 'left-right-down') expect(p.ask, where).toBe('min')

      // ── Every legal route, walked independently ─────────────────────────
      const routes = everyRoute(p)
      expect(routes.length, where).toBeGreaterThan(1)
      for (const route of routes) {
        // Starts at the start, ends at the finish, never repeats a square, and
        // only ever uses steps the rule allows.
        expect(route[0], where).toEqual({ r: 0, c: 0 })
        expect(route[route.length - 1], where).toEqual({ r: p.rows - 1, c: p.cols - 1 })
        expect(new Set(route.map((x) => `${x.r},${x.c}`)).size, `${where}: a route reused a square`).toBe(
          route.length,
        )
        for (let i = 1; i < route.length; i++) {
          const from = route[i - 1]
          const to = route[i]
          const dr = to.r - from.r
          const dc = to.c - from.c
          const legal =
            (dr === 1 && dc === 0) ||
            (dr === 0 && dc === 1) ||
            (p.moves === 'left-right-down' && dr === 0 && dc === -1)
          expect(legal, `${where}: illegal step ${JSON.stringify(from)}→${JSON.stringify(to)}`).toBe(true)
        }
        // Only the finish may appear as the last square — a walk that passed
        // through it and carried on would not be answering this question.
        for (let i = 0; i + 1 < route.length; i++) {
          expect(route[i].r === p.rows - 1 && route[i].c === p.cols - 1, where).toBe(false)
        }
      }

      const totals = routes.map((route) => total(p, route))
      const optimum = p.ask === 'max' ? Math.max(...totals) : Math.min(...totals)
      const winners = totals.filter((t) => t === optimum).length

      const s = solve(p)
      expect(s.best, `${where}: the backward table disagrees with an exhaustive walk`).toBe(optimum)
      expect(winners, `${where}: ${winners} routes tie for the best total`).toBe(1)
      expect(s.uniqueBest, where).toBe(true)
      // The route the concept shows really is the one winner.
      expect(total(p, s.route), where).toBe(optimum)
      expect(s.route[0], where).toEqual({ r: 0, c: 0 })
      expect(s.route[s.route.length - 1], where).toEqual({ r: p.rows - 1, c: p.cols - 1 })
      expect(new Set(s.route.map((x) => `${x.r},${x.c}`)).size, where).toBe(s.route.length)
      expect(s.route.length, where).toBe(p.rows + p.cols - 1)

      // The sideways option is a red herring for a smallest total, and the
      // hint says so out loud — so it had better be true on this very grid.
      if (p.moves === 'left-right-down') {
        seenSideways += 1
        expect(
          routes.some((route) => route.length > p.rows + p.cols - 1),
          `${where}: no sideways route was even available`,
        ).toBe(true)
        expect(
          s.route.every((cell, i) => i === 0 || cell.c >= s.route[i - 1].c),
          `${where}: the smallest route stepped left`,
        ).toBe(true)
      }

      // ── The backward table is a real deduction, square by square ────────
      for (let r = 0; r < p.rows; r++) {
        for (let c = 0; c < p.cols; c++) {
          const cell = s.table[r][c]
          expect(cell.value, where).toBe(p.grid[r][c])
          const options = [cell.right, cell.down].filter((x): x is number => x !== null)
          if (options.length === 0) {
            expect(cell.best, where).toBe(cell.value)
          } else {
            const pick = p.ask === 'max' ? Math.max(...options) : Math.min(...options)
            expect(cell.best, where).toBe(cell.value + pick)
          }
          if (c + 1 < p.cols) expect(cell.right, where).toBe(s.table[r][c + 1].best)
          else expect(cell.right, where).toBeNull()
          if (r + 1 < p.rows) expect(cell.down, where).toBe(s.table[r + 1][c].best)
          else expect(cell.down, where).toBeNull()
        }
      }

      // ── Rendering ───────────────────────────────────────────────────────
      const rendered = concept.render(p)
      expect(rendered.answer, where).toBe(String(optimum))
      expect(rendered.answer_type, where).toBe('fill_in')
      expect(rendered.choices_en, where).toBeNull()
      expect(rendered.choices_id, where).toBeNull()

      const bd = rendered.breakdown!
      const prose = [
        rendered.body_en,
        rendered.body_id,
        rendered.hint_en ?? '',
        rendered.hint_id ?? '',
        ...(rendered.hint_steps_en ?? []),
        ...(rendered.hint_steps_id ?? []),
        ...bd.highlights.flatMap((h) => [h.phrase_en, h.phrase_id, h.note_en, h.note_id]),
        ...bd.quantities.flatMap((q) => [q.label_en, q.label_id, q.value]),
        bd.strategy.name_en,
        bd.strategy.name_id,
        bd.trap?.why_en ?? '',
        bd.trap?.why_id ?? '',
      ].join(' | ')
      expect(prose, where).not.toMatch(/undefined|NaN|\[object|null/)

      // The steps walk the table from the bottom row upwards and land on the
      // answer; the sideways rule adds exactly one opening line.
      const lead = p.moves === 'left-right-down' ? 1 : 0
      const stepsEn = rendered.hint_steps_en ?? []
      const stepsId = rendered.hint_steps_id ?? []
      expect(stepsEn.length, where).toBe(stepsId.length)
      expect(stepsEn.length, where).toBe(lead + p.rows + 1)
      expect(stepsEn.at(-1) as string, where).toContain(String(optimum))
      expect(stepsId.at(-1) as string, where).toContain(String(optimum))
      // Every square of the table must be derived somewhere before the close.
      for (let r = 0; r < p.rows; r++) {
        // Bottom row is narrated first, then rows upward, so row r is at
        // lead + (rows - 1 - r) + ... — bottom row at index `lead`.
        const line_en = stepsEn[lead + (p.rows - 1 - r)]
        const line_id = stepsId[lead + (p.rows - 1 - r)]
        for (let c = 0; c < p.cols; c++) {
          expect(line_en, `${where}: row ${r} col ${c} missing from the English steps`).toContain(
            String(s.table[r][c].best),
          )
          expect(line_id, `${where}: row ${r} col ${c} missing from the Indonesian steps`).toContain(
            String(s.table[r][c].best),
          )
        }
      }

      // ── Breakdown ───────────────────────────────────────────────────────
      const display_en = stripLabels(rendered.body_en)
      const display_id = stripLabels(rendered.body_id)
      expect(bd.needsVisual, where).toBe(true)
      expect(bd.answer.value, where).toBe(String(optimum))
      expect(bd.highlights.length, where).toBeGreaterThanOrEqual(5)
      for (const h of bd.highlights) {
        expect(display_en, `${where} phrase_en=${h.phrase_en}`).toContain(h.phrase_en)
        expect(display_id, `${where} phrase_id=${h.phrase_id}`).toContain(h.phrase_id)
      }
      expectNoOverlap(display_en, bd.highlights.map((h) => h.phrase_en), where)
      expectNoOverlap(display_id, bd.highlights.map((h) => h.phrase_id), where)

      // The stem must word the movement rule the paper actually set.
      expect(rendered.body_en.includes('step left, right or down'), where).toBe(
        p.moves === 'left-right-down',
      )
      expect(rendered.body_id.includes('ke kiri, ke kanan, atau ke bawah'), where).toBe(
        p.moves === 'left-right-down',
      )
      expect(rendered.body_en.includes('largest total'), where).toBe(p.ask === 'max')
      expect(rendered.body_id.includes('terbesar'), where).toBe(p.ask === 'max')

      // The trap is the greedy walk's real total, and it really is wrong.
      const gap = divergence(p, s)
      if (bd.trap !== null) {
        seenTraps += 1
        expect(gap, where).not.toBeNull()
        expect(bd.trap.wrong, where).toBe(String(s.greedy.total))
        expect(bd.trap.wrong, where).not.toBe(String(optimum))
        expect(totals, `${where}: the trap total is not even reachable`).toContain(s.greedy.total)
        if (p.ask === 'max') expect(s.greedy.total, where).toBeLessThan(optimum)
        else expect(s.greedy.total, where).toBeGreaterThan(optimum)
      }
    }

    expect([...seenMoves].sort()).toEqual(['left-right-down', 'right-or-down'])
    expect([...seenAsk].sort()).toEqual(['max', 'min'])
    expect([...seenShape].sort()).toEqual(['4x4', '4x5', '5x4', '5x5'])
    expect(seenSideways).toBeGreaterThan(SEEDS / 8)
    // Greedy failing is a generation requirement, so every seed should trap.
    expect(seenTraps).toBe(SEEDS)
    // Walking every route of every seed by hand is the whole point of this
    // suite, and 5x5 with sideways steps has 625 of them.
  }, 120_000)

  test('the schema rejects the shapes that would break the concept', () => {
    const ok: Params = {
      rows: 4,
      cols: 4,
      grid: [
        [6, 8, 3, 9],
        [7, 4, 3, 7],
        [9, 9, 7, 9],
        [8, 9, 2, 1],
      ],
      moves: 'right-or-down',
      ask: 'max',
    }
    expect(() => concept.paramsSchema.parse(ok)).not.toThrow()
    // grid does not match the declared shape
    expect(() => concept.paramsSchema.parse({ ...ok, rows: 5 })).toThrow()
    // a square outside 1..9
    expect(() =>
      concept.paramsSchema.parse({
        ...ok,
        grid: [
          [0, 8, 3, 9],
          [7, 4, 3, 7],
          [9, 9, 7, 9],
          [8, 9, 2, 1],
        ],
      }),
    ).toThrow()
    // too small to be worth a table
    expect(() =>
      concept.paramsSchema.parse({
        ...ok,
        rows: 3,
        cols: 3,
        grid: [
          [6, 8, 3],
          [7, 4, 3],
          [9, 9, 7],
        ],
      }),
    ).toThrow()
    // sideways steps with a largest-total ask
    expect(() => concept.paramsSchema.parse({ ...ok, moves: 'left-right-down' })).toThrow()
  })
})
