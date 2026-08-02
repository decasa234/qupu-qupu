import { describe, test, expect } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { mulberry32 } from '../rng.js'
import concept, {
  analyse,
  ASKS,
  cellKey,
  chaptersOf,
  freeCells,
  MARK_LETTERS,
  ROUTE_CAP,
  STEP_KINDS,
  trapAnswer,
  type Cell,
  type Params,
} from './index.js'
import Illustration from '../../../../../src/components/wmi/concepts/visit-all-cells-path/index.js'
import Explainer from '../../../../../src/components/wmi/concepts/explainers/VisitAllCellsPathExplainer.js'
import { buildVisitAllCellsPathSteps } from '../../../../../src/components/wmi/concepts/explainers/visitAllCellsPathSteps.js'

const SEEDS = 220

// ---------------------------------------------------------------------------
// Independent oracle. Written from the WORDING of the problem — "hop between
// squares that touch, land on every square that is not a stone exactly once" —
// with no shared code with the concept: no adjacency graph, no index arrays, no
// reachability pruning, just coordinates and a plain recursive walk.
//
// A board with two complete routes is the classic bug this concept has to
// avoid: two different numbers land on the marked square and a child cannot
// tell which one the paper wanted.
// ---------------------------------------------------------------------------

const eq = (a: Cell, b: Cell): boolean => a.r === b.r && a.c === b.c

function oracleFree(p: Params): Cell[] {
  const out: Cell[] = []
  for (let r = 0; r < p.rows; r++) {
    for (let c = 0; c < p.cols; c++) {
      if (!p.blocked.some((b) => b.r === r && b.c === c)) out.push({ r, c })
    }
  }
  return out
}

/** Does one hop obey the rule the stem states? Derived from the wording, not the code. */
function oracleLegalStep(p: Params, from: Cell, to: Cell): boolean {
  const dr = Math.abs(from.r - to.r)
  const dc = Math.abs(from.c - to.c)
  return p.step === 'knight' ? dr * dc === 2 : dr + dc === 1
}

/**
 * Every complete route from `prefix`'s last square, extending `prefix`.
 * Brute force: try each square that is free, unused and one legal hop away.
 */
function oracleRoutes(p: Params, prefix: Cell[] = [p.start], limit = 64): Cell[][] {
  const free = oracleFree(p)
  const out: Cell[][] = []
  const walk = (path: Cell[]): void => {
    if (out.length >= limit) return
    if (path.length === free.length) {
      out.push([...path])
      return
    }
    const here = path[path.length - 1]
    for (const cell of free) {
      if (path.some((x) => eq(x, cell))) continue
      if (!oracleLegalStep(p, here, cell)) continue
      path.push(cell)
      walk(path)
      path.pop()
    }
  }
  if (!free.some((cell) => eq(cell, p.start))) return []
  if (prefix.some((cell) => !free.some((f) => eq(f, cell)))) return []
  walk([...prefix])
  return out
}

/** The most squares any walk continuing `prefix` could ever cover. */
function oracleDeepest(p: Params, prefix: Cell[]): number {
  const free = oracleFree(p)
  let best = prefix.length
  const walk = (path: Cell[]): void => {
    if (path.length > best) best = path.length
    if (best === free.length) return
    const here = path[path.length - 1]
    for (const cell of free) {
      if (path.some((x) => eq(x, cell))) continue
      if (!oracleLegalStep(p, here, cell)) continue
      path.push(cell)
      walk(path)
      path.pop()
      if (best === free.length) return
    }
  }
  walk([...prefix])
  return best
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

describe('visit-all-cells-path', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(11))).toEqual(concept.generate(mulberry32(11)))
  })

  test('the brute-force oracle catches an ambiguous board the schema must reject', () => {
    // The eight squares around a blocked centre make a ring. From any square on
    // a ring there are always TWO ways round, so "which number lands here" has
    // two defensible answers and the board must be refused.
    const ring: Params = {
      rows: 3,
      cols: 3,
      blocked: [{ r: 1, c: 1 }],
      start: { r: 0, c: 0 },
      step: 'orthogonal',
      ask: 'value-at-marked-cell',
      marks: [{ r: 2, c: 2 }],
    }
    expect(oracleRoutes(ring).length).toBe(2)
    expect(analyse(ring).count).toBe(2)
    expect(() => concept.paramsSchema.parse(ring)).toThrow()

    // Break the ring with one more stone and the very same question is decided.
    const corridor: Params = {
      ...ring,
      blocked: [
        { r: 0, c: 1 },
        { r: 1, c: 1 },
      ],
      marks: [{ r: 1, c: 2 }],
    }
    expect(oracleRoutes(corridor).length).toBe(1)
    expect(() => concept.paramsSchema.parse(corridor)).not.toThrow()
    // (0,0) (1,0) (2,0) (2,1) (2,2) (1,2) (0,2) — the mark is the sixth square.
    expect(concept.render(corridor).answer).toBe('6')
  })

  test('a ring board is exactly what the count-the-routes ask wants', () => {
    const ring: Params = {
      rows: 3,
      cols: 3,
      blocked: [{ r: 1, c: 1 }],
      start: { r: 0, c: 0 },
      step: 'orthogonal',
      ask: 'how-many-routes',
      marks: [],
    }
    expect(() => concept.paramsSchema.parse(ring)).not.toThrow()
    expect(concept.render(ring).answer).toBe('2')
    const a = analyse(ring)
    // Both routes leave the corner immediately, so the fork is the very first hop.
    expect(a.prefixLength).toBe(1)
    expect(a.tails.length).toBe(2)
  })

  test(`${SEEDS} seeds: the route is the only route, and the answer is read off it`, () => {
    const seenAsk = new Set<string>()
    const seenStep = new Set<string>()
    const seenShape = new Set<string>()
    let seenEliminations = 0
    let seenTraps = 0

    for (let seed = 1; seed <= SEEDS; seed++) {
      const p = concept.generate(mulberry32(seed))
      const where = `seed ${seed} (${JSON.stringify(p)})`
      expect(() => concept.paramsSchema.parse(p), where).not.toThrow()
      seenAsk.add(p.ask)
      seenStep.add(p.step)
      seenShape.add(`${p.rows}x${p.cols}`)

      // ── Shape sanity ────────────────────────────────────────────────────
      const free = oracleFree(p)
      expect(free.length, where).toBeGreaterThanOrEqual(6)
      expect(p.blocked.length, where).toBeGreaterThanOrEqual(1)
      expect(new Set(p.blocked.map(cellKey)).size, where).toBe(p.blocked.length)
      expect(free.some((cell) => eq(cell, p.start)), where).toBe(true)
      expect(p.marks.length, where).toBe(p.ask === 'how-many-routes' ? 0 : p.ask === 'value-at-marked-cell' ? 1 : 3)
      for (const mark of p.marks) {
        expect(free.some((cell) => eq(cell, mark)), where).toBe(true)
        expect(eq(mark, p.start), where).toBe(false)
      }
      // Marks are stored in reading order, so MARK_LETTERS[i] names marks[i].
      expect(p.marks, where).toEqual([...p.marks].sort((a, b) => a.r - b.r || a.c - b.c))
      expect(freeCells(p).length, where).toBe(free.length)

      // ── The route count the generator claims is the count that exists ───
      const a = analyse(p)
      const oracle = oracleRoutes(p)
      expect(oracle.length, `${where}: the oracle and the generator disagree on how many routes exist`).toBe(
        a.count,
      )
      expect(oracle.length, where).toBeLessThan(ROUTE_CAP)
      if (p.ask === 'how-many-routes') {
        expect(oracle.length, where).toBeGreaterThanOrEqual(2)
        expect(a.tails.length, where).toBe(oracle.length)
        // Each branch of the fork completes in exactly one way — that is what
        // makes "count the choices at the fork" a proof rather than a guess.
        for (const tail of a.tails) {
          expect(oracleRoutes(p, tail.route.slice(0, a.prefixLength + 1)).length, where).toBe(1)
        }
      } else {
        expect(oracle.length, `${where}: two routes means two defensible answers`).toBe(1)
      }

      // ── Every route really is a legal visit-everything walk ─────────────
      for (const route of oracle) {
        expect(route.length, where).toBe(free.length)
        expect(new Set(route.map(cellKey)).size, where).toBe(free.length)
        expect(eq(route[0], p.start), where).toBe(true)
        for (const cell of route) {
          expect(p.blocked.some((b) => eq(b, cell)), where).toBe(false)
        }
        for (let i = 0; i + 1 < route.length; i++) {
          expect(oracleLegalStep(p, route[i], route[i + 1]), `${where}: illegal hop at ${i}`).toBe(true)
        }
      }
      // The concept's own route is one of the oracle's.
      expect(oracle.some((route) => route.map(cellKey).join('|') === a.route.map(cellKey).join('|')), where).toBe(
        true,
      )

      // ── The answer is read off that route, recomputed from scratch ──────
      const r = concept.render(p)
      const truth = oracle[0]
      const place = (cell: Cell): number => truth.findIndex((x) => eq(x, cell)) + 1
      if (p.ask === 'value-at-marked-cell') {
        expect(r.answer, where).toBe(String(place(p.marks[0])))
        expect(Number(r.answer), where).toBeGreaterThanOrEqual(4)
      } else if (p.ask === 'visit-order-of-marked-cells') {
        const expected = p.marks
          .map((cell, i) => ({ letter: MARK_LETTERS[i], at: place(cell) }))
          .sort((x, y) => x.at - y.at)
          .map((x) => x.letter)
          .join('')
        expect(r.answer, where).toBe(expected)
        expect(r.answer, `${where}: reading order would be the answer, so nothing is proved`).not.toBe(
          MARK_LETTERS.join(''),
        )
      } else {
        expect(r.answer, where).toBe(String(oracle.length))
      }
      expect(r.answer_type, where).toBe('fill_in')
      expect(r.choices_en, where).toBeNull()
      expect(r.choices_id, where).toBeNull()

      // ── Every narrated hop really is forced, and every refusal is true ──
      const chapters = chaptersOf(a.trace)
      expect(chapters.length, where).toBeLessThanOrEqual(4)
      if (p.ask !== 'how-many-routes') {
        expect(a.trace.length, where).toBe(free.length - 1)
        expect(chapters.some((ch) => ch.kind === 'eliminate'), where).toBe(true)
      }
      a.trace.forEach((step, i) => {
        const before = a.route.slice(0, i + 1)
        expect(eq(step.from, a.route[i]), where).toBe(true)
        expect(eq(step.to, a.route[i + 1]), where).toBe(true)
        expect(step.order, where).toBe(i + 2)
        // The hop the trail takes leads somewhere; the ones it refuses do not.
        expect(oracleRoutes(p, [...before, step.to]).length, where).toBeGreaterThanOrEqual(1)
        expect(step.rejected.length, where).toBe(step.options.length - 1)
        for (const bad of step.rejected) {
          expect(
            oracleRoutes(p, [...before, bad.cell]).length,
            `${where}: hint step ${i} crosses off a hop that actually works`,
          ).toBe(0)
          expect(oracleLegalStep(p, step.from, bad.cell), where).toBe(true)
          if (bad.reason === 'cut-off') {
            // The stranded square must be genuinely out of reach afterwards.
            const used = new Set([...before, bad.cell].map(cellKey))
            const seen = new Set([cellKey(bad.cell)])
            const stack: Cell[] = [bad.cell]
            while (stack.length > 0) {
              const cur = stack.pop() as Cell
              for (const cell of free) {
                if (used.has(cellKey(cell)) || seen.has(cellKey(cell))) continue
                if (!oracleLegalStep(p, cur, cell)) continue
                seen.add(cellKey(cell))
                stack.push(cell)
              }
            }
            expect(seen.has(cellKey(bad.stranded[0])), `${where}: "cut off" square is still reachable`).toBe(
              false,
            )
          } else if (bad.reason === 'two-dead-ends') {
            expect(bad.stranded.length, where).toBe(2)
            const used = new Set([...before, bad.cell].map(cellKey))
            for (const dead of bad.stranded) {
              expect(used.has(cellKey(dead)), where).toBe(false)
              const doors = free.filter(
                (cell) =>
                  oracleLegalStep(p, dead, cell) &&
                  (!used.has(cellKey(cell)) || eq(cell, bad.cell)),
              )
              expect(doors.length, `${where}: "single door" square has ${doors.length}`).toBe(1)
            }
          } else {
            expect(bad.best, where).toBe(oracleDeepest(p, [...before, bad.cell]))
            expect(bad.best, `${where}: a road that "runs out" must not cover the board`).toBeLessThan(
              free.length,
            )
          }
        }
        if (step.options.length > 1) seenEliminations += 1
      })

      // ── Nothing anywhere may leak an undefined / NaN into a child's screen ─
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
      expect(prose, where).not.toMatch(/undefined|NaN|\[object|Infinity|null/)

      // ── The steps end on the answer and never assert it early ───────────
      expect((r.hint_steps_en ?? []).length, where).toBe((r.hint_steps_id ?? []).length)
      expect((r.hint_steps_en ?? []).length, where).toBeGreaterThanOrEqual(3)
      expect((r.hint_steps_en ?? []).at(-1) as string, where).toContain(r.answer)
      expect((r.hint_steps_id ?? []).at(-1) as string, where).toContain(r.answer)
      // Each forced stretch has to name the square it lands on, so a child can
      // follow the count rather than take it on trust.
      const idSteps = (r.hint_steps_id ?? []).join(' ')
      for (const step of a.trace) {
        expect(idSteps, where).toContain(`baris ${step.to.r + 1} kolom ${step.to.c + 1}`)
      }

      // ── Breakdown ───────────────────────────────────────────────────────
      const display_en = stripLabels(r.body_en)
      const display_id = stripLabels(r.body_id)
      expect(bd.needsVisual, where).toBe(true)
      expect(bd.answer.value, where).toBe(r.answer)
      expect(bd.highlights.length, where).toBe(5)
      for (const h of bd.highlights) {
        expect(display_en, `${where} phrase_en=${h.phrase_en}`).toContain(h.phrase_en)
        expect(display_id, `${where} phrase_id=${h.phrase_id}`).toContain(h.phrase_id)
      }
      expectNoOverlap(display_en, bd.highlights.map((h) => h.phrase_en), where)
      expectNoOverlap(display_id, bd.highlights.map((h) => h.phrase_id), where)
      // The stem may only promise the move rule the board actually uses.
      expect(r.body_en.includes('chess knight'), where).toBe(p.step === 'knight')
      expect(r.body_id.includes('kuda catur'), where).toBe(p.step === 'knight')

      // The trap, when there is one, must be genuinely WRONG.
      const trap = trapAnswer(p, a)
      expect(bd.trap?.wrong ?? null, where).toBe(trap)
      if (trap !== null) {
        seenTraps += 1
        expect(trap, where).not.toBe(r.answer)
        expect(p.ask, where).not.toBe('how-many-routes')
      }

      // ── The picture shows the board and hides the route ─────────────────
      const html = renderToStaticMarkup(createElement(Illustration, { params: p }))
      expect(html, where).toContain('<svg')
      expect(html, `${where}: the figure drew the route`).not.toContain('<polyline')
      const label = html.match(/aria-label="([^"]*)"/)?.[1] ?? ''
      const named = new Set((label.match(/baris \d+ kolom \d+/g) ?? []))
      const allowed = new Set(
        [...p.blocked, p.start, ...p.marks].map((cell) => `baris ${cell.r + 1} kolom ${cell.c + 1}`),
      )
      expect([...named].sort(), `${where}: the label names a square that is not printed`).toEqual(
        [...allowed].sort(),
      )

      // ── The storyboard lands where the generator lands ──────────────────
      for (const lang of ['en', 'id'] as const) {
        const story = buildVisitAllCellsPathSteps(p, lang)
        expect(story.answer, `${where} ${lang}`).toBe(r.answer)
        expect(story.steps.at(-1)!.reveal, `${where} ${lang}`).toBe(r.answer)
        expect(story.steps.length, `${where} ${lang}`).toBeGreaterThanOrEqual(3)
        expect(story.steps[0].numbers.length, `${where} ${lang}`).toBe(0)
        expect(story.steps[0].reveal, `${where} ${lang}`).toBeNull()
        const captions = story.steps.map((b) => b.caption).join(' | ')
        expect(captions, `${where} ${lang}`).not.toMatch(/undefined|NaN|\[object|Infinity/)
        // A number only ever appears on a square the beat has already walked.
        for (const b of story.steps) {
          for (const n of b.numbers) {
            expect(a.count === 1 ? place({ r: n.r, c: n.c }) : n.n, `${where} ${lang}`).toBeGreaterThan(0)
            expect(p.blocked.some((x) => x.r === n.r && x.c === n.c), `${where} ${lang}`).toBe(false)
          }
        }
      }
    }

    expect([...seenAsk].sort()).toEqual([...ASKS].sort())
    expect([...seenStep].sort()).toEqual([...STEP_KINDS].sort())
    expect(seenShape.size).toBeGreaterThanOrEqual(3)
    expect(seenEliminations).toBeGreaterThan(SEEDS / 2)
    expect(seenTraps).toBeGreaterThan(SEEDS / 4)
  })

  test('the explainer renders every beat in both languages', () => {
    for (const seed of [2, 7, 13, 31, 64, 99, 150]) {
      const p = concept.generate(mulberry32(seed))
      const answer = concept.render(p).answer
      for (const lang of ['en', 'id'] as const) {
        const story = buildVisitAllCellsPathSteps(p, lang)
        for (let step = 0; step < story.steps.length; step++) {
          const html = renderToStaticMarkup(
            createElement(Explainer, { params: p, correctAnswer: answer, lang, step }),
          )
          expect(html, `seed ${seed} ${lang} step ${step}`).toContain('<svg')
          expect(html, `seed ${seed} ${lang} step ${step}`).not.toMatch(/undefined|NaN/)
        }
      }
    }
  })

  test('the frontend falls back rather than drawing a board nobody set', () => {
    for (const junk of [
      {},
      { rows: 99, cols: 'nope', blocked: 'stones', start: null, marks: 7 },
      { rows: 3, cols: 3, blocked: [{ r: 0, c: 0 }], start: { r: 0, c: 0 }, marks: [] },
    ]) {
      const html = renderToStaticMarkup(createElement(Illustration, { params: junk }))
      expect(html).toContain('<svg')
      expect(html).not.toMatch(/undefined|NaN/)
      const story = buildVisitAllCellsPathSteps(junk, 'id')
      expect(story.steps.length).toBeGreaterThanOrEqual(2)
      expect(story.steps.at(-1)!.reveal).not.toBeNull()
    }
  })

  test('the schema rejects the shapes that would break the concept', () => {
    const ok: Params = {
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
    expect(() => concept.paramsSchema.parse(ok)).not.toThrow()
    // a stone under the rabbit
    expect(() => concept.paramsSchema.parse({ ...ok, start: { r: 0, c: 1 } })).toThrow()
    // a stone under the mark
    expect(() => concept.paramsSchema.parse({ ...ok, marks: [{ r: 1, c: 1 }] })).toThrow()
    // no stones at all — the 3-by-3 then has many routes
    expect(() => concept.paramsSchema.parse({ ...ok, blocked: [] })).toThrow()
    // the wrong number of marks for the ask
    expect(() =>
      concept.paramsSchema.parse({ ...ok, ask: 'visit-order-of-marked-cells' }),
    ).toThrow()
    expect(() => concept.paramsSchema.parse({ ...ok, ask: 'how-many-routes' })).toThrow()
    // marks out of reading order
    expect(() =>
      concept.paramsSchema.parse({
        ...ok,
        ask: 'visit-order-of-marked-cells',
        marks: [
          { r: 2, c: 0 },
          { r: 1, c: 0 },
          { r: 1, c: 2 },
        ],
      }),
    ).toThrow()
    // knight jumps on this board reach nothing, so no route covers it
    expect(() => concept.paramsSchema.parse({ ...ok, step: 'knight' })).toThrow()
    // too few squares left to be worth asking about
    expect(() =>
      concept.paramsSchema.parse({
        ...ok,
        blocked: [
          { r: 0, c: 1 },
          { r: 1, c: 1 },
          { r: 2, c: 1 },
          { r: 2, c: 2 },
        ],
        marks: [{ r: 1, c: 2 }],
      }),
    ).toThrow()
  })
})
