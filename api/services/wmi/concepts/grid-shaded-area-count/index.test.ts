import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, {
  analyse,
  analyseFigure,
  shadedCells,
  type Lattice,
  type Params,
  type Point,
} from './index.js'

const SEEDS = 340

// ── an area computed a completely different way ───────────────────────────────
//
// The concept derives its area with the shoelace formula and cross-checks it by
// clipping the polygon cell by cell. This file uses PICK'S THEOREM instead —
// A = I + B/2 − 1 over lattice points — which shares no line of code and no idea
// with either. If a drawn shape and its stated answer ever part company, the two
// numbers part company first.

function gcd(a: number, b: number): number {
  let x = Math.abs(a)
  let y = Math.abs(b)
  while (y !== 0) {
    const t = x % y
    x = y
    y = t
  }
  return x
}

/** Lattice points sitting exactly on the polygon's outline. */
function boundaryPoints(poly: Point[]): number {
  let total = 0
  for (let i = 0; i < poly.length; i++) {
    const [x1, y1] = poly[i]
    const [x2, y2] = poly[(i + 1) % poly.length]
    total += gcd(x2 - x1, y2 - y1)
  }
  return total
}

function onBoundary(poly: Point[], px: number, py: number): boolean {
  for (let i = 0; i < poly.length; i++) {
    const [x1, y1] = poly[i]
    const [x2, y2] = poly[(i + 1) % poly.length]
    const cross = (x2 - x1) * (py - y1) - (y2 - y1) * (px - x1)
    if (cross !== 0) continue
    if (px < Math.min(x1, x2) || px > Math.max(x1, x2)) continue
    if (py < Math.min(y1, y2) || py > Math.max(y1, y2)) continue
    return true
  }
  return false
}

/** Ray casting, straight out of the textbook. */
function insidePolygon(poly: Point[], px: number, py: number): boolean {
  let hit = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]
    const [xj, yj] = poly[j]
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) hit = !hit
  }
  return hit
}

function interiorPoints(poly: Point[]): number {
  const xs = poly.map((p) => p[0])
  const ys = poly.map((p) => p[1])
  let total = 0
  for (let x = Math.min(...xs); x <= Math.max(...xs); x++) {
    for (let y = Math.min(...ys); y <= Math.max(...ys); y++) {
      if (onBoundary(poly, x, y)) continue
      if (insidePolygon(poly, x, y)) total += 1
    }
  }
  return total
}

/**
 * Grid cells covered, by Pick's theorem. On the square lattice one fundamental
 * cell is one grid square; on the (unimodular) triangular lattice the
 * fundamental parallelogram holds two small triangles, so the count doubles.
 */
function pickCells(lattice: Lattice, poly: Point[]): number {
  const area = interiorPoints(poly) + boundaryPoints(poly) / 2 - 1
  return lattice === 'square' ? area : area * 2
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

function seeds(): Params[] {
  return Array.from({ length: SEEDS }, (_, i) => concept.generate(mulberry32(i + 1)))
}

describe('grid-shaded-area-count', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(23))).toEqual(concept.generate(mulberry32(23)))
  })

  test('every generated params object parses', () => {
    for (const params of seeds()) {
      const parsed = concept.paramsSchema.safeParse(params)
      expect(parsed.success, `seed rejected: ${JSON.stringify(params)}`).toBe(true)
    }
  })

  test("every drawn figure's cell count matches Pick's theorem", () => {
    for (const params of seeds()) {
      for (const figure of params.figures) {
        const mine = analyseFigure(params.lattice, figure.verts, params.unitValue)
        expect(mine.units, JSON.stringify(figure.verts)).toBe(pickCells(params.lattice, figure.verts))
      }
    }
  })

  test('whole cells plus paired halves reconcile with the computed area', () => {
    for (const params of seeds()) {
      for (const figure of params.figures) {
        const cells = shadedCells(params.lattice, figure.verts)
        const whole = cells.filter((c) => !c.half).length
        const halves = cells.filter((c) => c.half).length
        // Halves always pair up, so the answer is a whole number of cells.
        expect(halves % 2, JSON.stringify(figure.verts)).toBe(0)
        expect(whole + halves / 2).toBe(pickCells(params.lattice, figure.verts))
        // Every half really is half: the piece that gets DRAWN covers exactly
        // half the cell it sits in, and every whole piece covers all of it.
        for (const cell of cells) {
          const piece = pickCells(params.lattice, cell.piece)
          const frame = pickCells(params.lattice, cell.frame)
          expect(frame).toBe(1)
          expect(piece, JSON.stringify(cell.piece)).toBe(cell.half ? 0.5 : 1)
        }
      }
    }
  })

  test('the stated answer is the area Pick computes (fill-in) or the right label (choice)', () => {
    for (const params of seeds()) {
      const a = analyse(params)
      const rendered = concept.render(params)
      const cells = pickCells(params.lattice, a.target.verts)

      if (params.ask === 'area') {
        expect(rendered.answer_type).toBe('fill_in')
        expect(Number(rendered.answer), JSON.stringify(params)).toBe(cells * params.unitValue)
        continue
      }

      expect(rendered.answer_type).toBe('multiple_choice')
      const labels = (rendered.choices_en ?? []).map((c) => c.label)
      expect(labels).toEqual(['A', 'B', 'C'])
      expect(labels).toContain(rendered.answer)

      const sizes = a.options.map((o) => pickCells(params.lattice, o.figure.verts))
      const answerAt = labels.indexOf(rendered.answer)
      if (params.ask === 'which-largest') {
        // Strictly the largest — no tie for the child to argue about.
        expect(Math.max(...sizes)).toBe(sizes[answerAt])
        expect(sizes.filter((s) => s === sizes[answerAt]).length).toBe(1)
      } else {
        const example = pickCells(params.lattice, (a.example as { verts: Point[] }).verts)
        expect(sizes[answerAt]).toBe(example)
        expect(sizes.filter((s) => s === example).length).toBe(1)
      }
    }
  })

  test('the hint steps force the answer instead of asserting it', () => {
    for (const params of seeds()) {
      const a = analyse(params)
      const r = concept.render(params)
      const en = (r.hint_steps_en ?? []).join(' ')
      const id = (r.hint_steps_id ?? []).join(' ')
      expect((r.hint_steps_en ?? []).length).toBeGreaterThanOrEqual(3)
      expect(r.hint_steps_en?.length).toBe(r.hint_steps_id?.length)

      if (params.ask === 'area') {
        // The running total is walked out loud and lands on the whole-cell count.
        expect(en, JSON.stringify(params)).toContain(`That is ${a.target.whole.length} whole`)
        expect(id).toContain(`Jadi ada ${a.target.whole.length}`)
        let running = 0
        for (const row of a.target.wholeRows) {
          running += row.cells.length
          expect(en).toContain(`row ${row.row + 1} has ${row.cells.length}, that makes ${running}`)
          expect(id).toContain(`baris ${row.row + 1} ada ${row.cells.length}, jadi ${running}`)
        }
        expect(running).toBe(a.target.whole.length)
        if (a.target.halves.length > 0) {
          const pairs = a.target.halves.length / 2
          expect(en).toContain(`${a.target.halves.length} halves = ${pairs} whole`)
          expect(en).toContain(`${a.target.whole.length} + ${pairs} = ${a.target.units}`)
          expect(id).toContain(`${a.target.whole.length} + ${pairs} = ${a.target.units}`)
        }
        if (params.unitValue > 1) {
          expect(en).toContain(`${a.target.units} × ${params.unitValue} = ${a.target.value}`)
          expect(id).toContain(`${a.target.units} × ${params.unitValue} = ${a.target.value}`)
        }
        continue
      }

      // Every option is counted out before any of them is picked.
      for (const option of a.options) {
        expect(en, JSON.stringify(params)).toContain(`${option.label} has ${option.figure.whole.length} whole`)
        expect(id).toContain(`${option.label} ada ${option.figure.whole.length}`)
        if (option.figure.halves.length > 0) {
          expect(en).toContain(
            `${option.figure.whole.length} + ${option.figure.halves.length / 2} = ${option.figure.units}`,
          )
        }
      }
      expect(en).toContain(`the answer is ${r.answer}`)
      expect(id).toContain(`jawabannya ${r.answer}`)
    }
  })

  test('rendered text is complete — no undefined, no NaN, no empty strings', () => {
    for (const params of seeds()) {
      const r = concept.render(params)
      const texts = [
        r.body_en,
        r.body_id,
        r.answer,
        r.hint_en ?? '',
        r.hint_id ?? '',
        ...(r.hint_steps_en ?? []),
        ...(r.hint_steps_id ?? []),
        ...(r.choices_en ?? []).map((c) => `${c.label} ${c.text}`),
        ...(r.choices_id ?? []).map((c) => `${c.label} ${c.text}`),
        JSON.stringify(r.breakdown),
      ]
      for (const text of texts) {
        expect(text.length, JSON.stringify(params)).toBeGreaterThan(0)
        expect(text).not.toMatch(/undefined|NaN|\[object/)
      }
      // `"trap":null` and `"unit":null` are legitimate JSON in the breakdown; a
      // stringified `null` inside PROSE is not.
      for (const text of texts.slice(0, -1)) {
        expect(text, JSON.stringify(params)).not.toMatch(/\bnull\b/)
      }
      if (params.ask === 'area') {
        expect(Number.isInteger(Number(r.answer))).toBe(true)
        expect(Number(r.answer)).toBeGreaterThan(0)
      }
    }
  })

  test('breakdown phrases are exact substrings of the displayed body, both languages', () => {
    for (const params of seeds()) {
      const r = concept.render(params)
      const breakdown = r.breakdown
      expect(breakdown).toBeTruthy()
      if (!breakdown) continue
      const en = stripLabels(r.body_en)
      const id = stripLabels(r.body_id)

      for (const h of breakdown.highlights) {
        expect(en.includes(h.phrase_en), `EN missing "${h.phrase_en}" in "${en}"`).toBe(true)
        expect(id.includes(h.phrase_id), `ID missing "${h.phrase_id}" in "${id}"`).toBe(true)
        expect(h.note_en.length).toBeGreaterThan(0)
        expect(h.note_id.length).toBeGreaterThan(0)
      }
      expectNoOverlap(en, breakdown.highlights.map((h) => h.phrase_en), 'en')
      expectNoOverlap(id, breakdown.highlights.map((h) => h.phrase_id), 'id')

      expect(breakdown.answer.value).toBe(r.answer)
      expect(breakdown.needsVisual).toBe(true)
      expect(breakdown.highlights.some((h) => h.category === 'question')).toBe(true)
      expect(breakdown.highlights.some((h) => h.category === 'object')).toBe(true)
      expect(breakdown.highlights.some((h) => h.category === 'fact')).toBe(true)
      if (breakdown.trap) expect(breakdown.trap.wrong).not.toBe(r.answer)
    }
  })

  test('the "slanting edge" sentence appears exactly when something is cut in half', () => {
    for (const params of seeds()) {
      const a = analyse(params)
      const r = concept.render(params)
      const cut = a.figures.some((f) => f.halves.length > 0)
      expect(r.body_en.includes('slanting edge'), JSON.stringify(params)).toBe(cut)
      expect(r.body_id.includes('sisi miring')).toBe(cut)
      // The triangular lattice runs all its edges along lattice lines, so a
      // small triangle is never sliced.
      if (params.lattice === 'triangle') expect(cut).toBe(false)
    }
  })

  test('all three asks and both lattices are actually produced', () => {
    const pool = seeds()
    expect([...new Set(pool.map((p) => p.ask))].sort()).toEqual([
      'area',
      'which-equals-example',
      'which-largest',
    ])
    expect([...new Set(pool.map((p) => p.lattice))].sort()).toEqual(['square', 'triangle'])
    expect([...new Set(pool.map((p) => p.unitValue))].sort()).toEqual([1, 5, 6])
    // Half cells are the point of the concept, so most square-lattice questions
    // must actually have some.
    const squares = pool.filter((p) => p.lattice === 'square' && p.ask === 'area')
    expect(squares.length).toBeGreaterThan(20)
    for (const p of squares) expect(analyse(p).target.halves.length).toBeGreaterThanOrEqual(2)
  })

  test('answers stay inside a grade-3 range', () => {
    for (const params of seeds()) {
      const a = analyse(params)
      for (const f of a.figures) {
        expect(f.units).toBeGreaterThanOrEqual(2)
        expect(f.value).toBeLessThanOrEqual(120)
      }
    }
  })

  // ── hand-worked cases ──────────────────────────────────────────────────────

  test('a hand-counted house: 10 whole squares and 4 halves make 12', () => {
    // A 4×4 block with a 45° gable: apex (2,0), eaves (0,2) and (4,2).
    // By hand, row by row:
    //   row 1 — the two roof cells either side of the apex are cut corner to
    //           corner:                              0 whole, 2 halves
    //   row 2 — the two middle cells are full, the outer two are cut:
    //                                                2 whole, 2 halves
    //   rows 3 and 4 — the body, untouched:          8 whole, 0 halves
    // 10 whole + 4 halves = 10 + 2 = 12 squares.
    const verts: Point[] = [[0, 2], [2, 0], [4, 2], [4, 4], [0, 4]]
    const params: Params = { lattice: 'square', unitValue: 5, ask: 'area', figures: [{ verts }] }
    expect(concept.paramsSchema.safeParse(params).success).toBe(true)

    const f = analyseFigure('square', verts, 5)
    expect(f.whole.length).toBe(10)
    expect(f.halves.length).toBe(4)
    expect(f.units).toBe(12)
    expect(f.value).toBe(60)
    expect(pickCells('square', verts)).toBe(12)
    expect(f.wholeRows.map((r) => `${r.row}:${r.cells.length}`)).toEqual(['1:2', '2:4', '3:4'])
    expect(concept.render(params).answer).toBe('60')
  })

  test('a hand-counted triangle-lattice trapezoid: 9 − 4 = 5 small triangles', () => {
    // The band of a side-3 triangle between rows 0 and 1: a side-3 triangle
    // holds 3² = 9 small triangles, the side-2 triangle left above row 1 holds
    // 2² = 4, so the band holds 5.
    const verts: Point[] = [[0, 0], [3, 0], [2, 1], [0, 1]]
    const f = analyseFigure('triangle', verts, 6)
    expect(f.whole.length).toBe(5)
    expect(f.halves.length).toBe(0)
    expect(f.units).toBe(5)
    expect(f.value).toBe(30)
    expect(pickCells('triangle', verts)).toBe(5)
  })

  test('the schema rejects a figure whose edge slices a cell somewhere other than in half', () => {
    // (0,0) → (2,1) is neither axis-parallel nor a 45° diagonal, so it cuts one
    // cell into a quarter and three quarters — an area no child can read off.
    const skew: Params = {
      lattice: 'square',
      unitValue: 1,
      ask: 'area',
      figures: [{ verts: [[0, 0], [2, 1], [2, 3], [0, 3]] }],
    }
    expect(concept.paramsSchema.safeParse(skew).success).toBe(false)
  })

  test('the schema rejects a figure with an odd number of half cells', () => {
    // A 3×3 square with ONE corner sliced by a leg-1 cut: exactly one half cell,
    // so the area would be 8.5 squares and the halves would not pair up.
    const odd: Params = {
      lattice: 'square',
      unitValue: 1,
      ask: 'area',
      figures: [{ verts: [[1, 0], [3, 0], [3, 3], [0, 3], [0, 1]] }],
    }
    expect(concept.paramsSchema.safeParse(odd).success).toBe(false)
    // …and the shape itself really does hold 8 whole squares and 1 half.
    const f = analyseFigure('square', odd.figures[0].verts, 1)
    expect(f.whole.length).toBe(8)
    expect(f.halves.length).toBe(1)
  })

  test('the schema rejects a which-largest set with a tie at the top', () => {
    const square: Point[] = [[0, 0], [2, 0], [2, 2], [0, 2]]
    const tied: Params = {
      lattice: 'square',
      unitValue: 1,
      ask: 'which-largest',
      figures: [
        { verts: square },
        { verts: [[0, 0], [2, 0], [2, 2], [0, 2]] },
        { verts: [[0, 0], [1, 0], [1, 1], [0, 1]] },
      ],
    }
    expect(concept.paramsSchema.safeParse(tied).success).toBe(false)
  })

  test('the schema rejects a figure that is not normalised to its own frame', () => {
    const floating: Params = {
      lattice: 'square',
      unitValue: 1,
      ask: 'area',
      figures: [{ verts: [[1, 1], [3, 1], [3, 3], [1, 3]] }],
    }
    expect(concept.paramsSchema.safeParse(floating).success).toBe(false)
  })
})
