import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { analyse, type Cell, type Params } from './index.js'

const SEEDS = 320

/**
 * Independent re-measurement. Deliberately shares NO code with `analyse` — it
 * walks the assembled layout with its own set bookkeeping and counts, one cell
 * at a time, every cell edge that has empty space on the other side. A top or
 * bottom edge is one piece WIDE; a left or right edge is one piece TALL.
 *
 * If the drawn arrangement and the stated perimeter ever part company, these two
 * numbers part company first.
 */
function remeasure(p: Params): { perimeter: number; area: number; edges: number } {
  const grid = new Set(p.cells.map(([r, c]) => `${r}|${c}`))
  let acrossEdges = 0
  let downEdges = 0
  for (const [r, c] of p.cells) {
    if (!grid.has(`${r - 1}|${c}`)) acrossEdges += 1 // top
    if (!grid.has(`${r + 1}|${c}`)) acrossEdges += 1 // bottom
    if (!grid.has(`${r}|${c - 1}`)) downEdges += 1 // left
    if (!grid.has(`${r}|${c + 1}`)) downEdges += 1 // right
  }
  return {
    perimeter: acrossEdges * p.pieceW + downEdges * p.pieceH,
    area: p.cells.length * p.pieceW * p.pieceH,
    edges: acrossEdges + downEdges,
  }
}

/** Mirrors src/lib stripSectionLabels for the two labels we emit. */
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

describe('compose-shape-perimeter', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(23))).toEqual(concept.generate(mulberry32(23)))
  })

  test('every generated params object parses', () => {
    for (const params of seeds()) {
      const parsed = concept.paramsSchema.safeParse(params)
      expect(parsed.success, `seed rejected: ${JSON.stringify(params)}`).toBe(true)
    }
  })

  test('the stated perimeter equals an independent edge count over the assembled pieces', () => {
    for (const params of seeds()) {
      const a = analyse(params)
      const mine = remeasure(params)
      expect(a.shapePerimeter, JSON.stringify(params)).toBe(mine.perimeter)
      expect(a.outlineEdges).toBe(mine.edges)
      // …and the number the child is graded against is that same measurement.
      const rendered = concept.render(params)
      if (params.ask === 'perimeter') expect(Number(rendered.answer)).toBe(mine.perimeter)
    }
  })

  test('area is the piece count times one piece, and never touched by the joins', () => {
    for (const params of seeds()) {
      const a = analyse(params)
      const mine = remeasure(params)
      expect(a.shapeArea, JSON.stringify(params)).toBe(mine.area)
      expect(a.shapeArea).toBe(params.cells.length * params.pieceW * params.pieceH)
      if (params.ask === 'area') expect(Number(concept.render(params).answer)).toBe(mine.area)
    }
  })

  test('joining hides edges: the outline is always shorter than the pieces added up', () => {
    for (const params of seeds()) {
      const a = analyse(params)
      // Two edges per join, and the books balance against the loose-piece count.
      expect(a.hiddenEdges).toBe(2 * a.joins)
      expect(a.outlineEdges).toBe(a.count * 4 - a.hiddenEdges)
      expect(a.joins).toBeGreaterThanOrEqual(2)
      expect(a.shapePerimeter).toBeLessThan(a.count * a.piecePerimeter)
      // Solid rows and solid columns are what make "2 per column, 2 per row"
      // true — the sentence the hints say out loud. Re-derived here from the
      // shape's width and height alone.
      expect(a.horizontalEdges).toBe(2 * a.width)
      expect(a.verticalEdges).toBe(2 * a.height)
    }
  })

  test('the side ask really is the string shared over the counted edges', () => {
    let seen = 0
    for (const params of seeds()) {
      if (params.ask !== 'side') continue
      seen += 1
      const a = analyse(params)
      expect(params.piece).toBe('square')
      expect(params.given).toBe('shape-perimeter')
      expect(a.shapePerimeter % a.outlineEdges).toBe(0)
      expect(a.shapePerimeter / a.outlineEdges).toBe(params.pieceW)
      expect(Number(concept.render(params).answer)).toBe(params.pieceW)
    }
    expect(seen).toBeGreaterThan(10)
  })

  test('every stated and derived measurement is a whole number', () => {
    for (const params of seeds()) {
      const a = analyse(params)
      const numbers = [
        a.pieceW,
        a.pieceH,
        a.piecePerimeter,
        a.pieceArea,
        a.shapePerimeter,
        a.shapeArea,
        a.givenValue,
        a.answerValue,
        // Both back-derivations a child performs, but only a square piece is
        // ever described by a single number, so only then are they asked for.
        ...(params.piece === 'square'
          ? [
              a.piecePerimeter / 4, // the side recovered from the piece's perimeter
              a.shapePerimeter / a.outlineEdges, // …and the side recovered from the string
            ]
          : []),
      ]
      for (const n of numbers) {
        expect(Number.isInteger(n), `${n} is not whole in ${JSON.stringify(params)}`).toBe(true)
        expect(n).toBeGreaterThan(0)
      }
      // The square root a `piece-area` stem asks a child to take is exact.
      if (params.given === 'piece-area') expect(a.pieceW * a.pieceW).toBe(a.pieceArea)
    }
  })

  test('the trap is the pieces-keep-their-outlines mistake, and never the right answer', () => {
    let withTrap = 0
    let withoutTrap = 0
    for (const params of seeds()) {
      const r = concept.render(params)
      const trap = r.breakdown?.trap ?? null
      if (trap === null) {
        withoutTrap += 1
        continue
      }
      withTrap += 1
      expect(trap.wrong, JSON.stringify(params)).not.toBe(r.answer)
      expect(Number(trap.wrong)).not.toBe(Number(r.answer))
      expect(Number.isInteger(Number(trap.wrong))).toBe(true)
      if (params.ask !== 'side') {
        // n × (one piece's perimeter) — the miss the concept exists to catch.
        expect(Number(trap.wrong)).toBe(params.cells.length * 2 * (params.pieceW + params.pieceH))
      }
      expect(trap.why_en.length).toBeGreaterThan(0)
      expect(trap.why_id.length).toBeGreaterThan(0)
    }
    // A perimeter ask can never dodge it, so most seeds carry one…
    expect(withTrap).toBeGreaterThan(50)
    // …and the coincidences (a 4 cm square: area 16 = perimeter 16) drop it.
    expect(withTrap + withoutTrap).toBe(SEEDS)
  })

  test('every perimeter question carries the trap, because a join always hides edges', () => {
    let seen = 0
    for (const params of seeds()) {
      if (params.ask !== 'perimeter') continue
      seen += 1
      const trap = concept.render(params).breakdown?.trap
      expect(trap, JSON.stringify(params)).toBeTruthy()
      expect(Number(trap?.wrong)).toBeGreaterThan(analyse(params).shapePerimeter)
    }
    expect(seen).toBeGreaterThan(50)
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
        JSON.stringify(r.breakdown),
      ]
      for (const text of texts) {
        expect(text.length, JSON.stringify(params)).toBeGreaterThan(0)
        expect(text).not.toMatch(/undefined|NaN|\[object/)
      }
      // `"trap":null` is legitimate JSON in the breakdown; a stringified `null`
      // inside PROSE is not, so guard the prose fields separately.
      for (const text of texts.slice(0, -1)) {
        expect(text, JSON.stringify(params)).not.toMatch(/\bnull\b/)
      }
      expect(Number.isInteger(Number(r.answer))).toBe(true)
      expect(Number(r.answer)).toBeGreaterThan(0)
      expect(r.hint_steps_en?.length).toBe(r.hint_steps_id?.length)
      expect((r.hint_steps_en ?? []).length).toBeGreaterThanOrEqual(3)
    }
  })

  test('the hint steps force the answer instead of asserting it', () => {
    for (const params of seeds()) {
      const a = analyse(params)
      const en = (concept.render(params).hint_steps_en ?? []).join(' ')
      const id = (concept.render(params).hint_steps_id ?? []).join(' ')
      // The last line lands on the number the child must type.
      expect(en, JSON.stringify(params)).toContain(`= ${a.answer} ${a.unit}`)
      expect(id, JSON.stringify(params)).toContain(`= ${a.answer} ${a.unit}`)
      if (params.ask === 'area') {
        // The multiplication that makes the area, spelled out.
        expect(en).toContain(`${a.count} × ${a.pieceArea} = ${a.shapeArea}`)
        expect(id).toContain(`${a.count} × ${a.pieceArea} = ${a.shapeArea}`)
      } else {
        // The edge bookkeeping, spelled out: loose count, buried count, remainder.
        expect(en).toContain(`${a.count} × 4 = ${a.count * 4}`)
        expect(en).toContain(`2 × ${a.width} = ${a.horizontalEdges}`)
        expect(en).toContain(`2 × ${a.height} = ${a.verticalEdges}`)
        expect(en).toContain(`${a.count * 4} − ${a.hiddenEdges} = ${a.outlineEdges}`)
        expect(id).toContain(`2 × ${a.width} = ${a.horizontalEdges}`)
        expect(id).toContain(`2 × ${a.height} = ${a.verticalEdges}`)
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
        // A phrase that appears twice would highlight the wrong span.
        expect(en.indexOf(h.phrase_en)).toBe(en.lastIndexOf(h.phrase_en))
        expect(id.indexOf(h.phrase_id)).toBe(id.lastIndexOf(h.phrase_id))
        expect(h.note_en.length).toBeGreaterThan(0)
        expect(h.note_id.length).toBeGreaterThan(0)
      }
      expectNoOverlap(en, breakdown.highlights.map((h) => h.phrase_en), 'en')
      expectNoOverlap(id, breakdown.highlights.map((h) => h.phrase_id), 'id')

      expect(breakdown.answer.value).toBe(r.answer)
      expect(breakdown.answer.unit).toBe(params.ask === 'area' ? 'cm²' : 'cm')
      expect(breakdown.needsVisual).toBe(true)
      for (const category of ['object', 'fact', 'condition', 'question'] as const) {
        expect(breakdown.highlights.some((h) => h.category === category)).toBe(true)
      }
    }
  })

  test('all asks, givens, pieces and arrangements are actually produced', () => {
    const all = seeds()
    expect([...new Set(all.map((p) => p.ask))].sort()).toEqual(['area', 'perimeter', 'side'])
    expect([...new Set(all.map((p) => p.given))].sort()).toEqual([
      'piece-area',
      'piece-perimeter',
      'piece-side',
      'shape-perimeter',
    ])
    expect([...new Set(all.map((p) => p.piece))].sort()).toEqual(['rectangle', 'square'])
    expect([...new Set(all.map((p) => p.arrangement))].sort()).toEqual([
      'ell',
      'rectangle',
      'row',
      'staircase',
    ])
    expect([...new Set(all.map((p) => p.cells.length))].sort((x, y) => x - y)).toEqual([3, 4, 6, 9])
  })

  test('answers stay inside a grade-3 range', () => {
    for (const params of seeds()) {
      const a = analyse(params)
      expect(a.shapePerimeter).toBeLessThanOrEqual(120)
      expect(a.shapeArea).toBeLessThanOrEqual(240)
    }
  })

  test('every layout is one joined-up shape with no gap in any row or column', () => {
    for (const params of seeds()) {
      const grid = new Set(params.cells.map(([r, c]) => `${r}|${c}`))
      const stack: Cell[] = [params.cells[0]]
      const hit = new Set<string>([`${params.cells[0][0]}|${params.cells[0][1]}`])
      while (stack.length > 0) {
        const [r, c] = stack.pop() as Cell
        for (const [nr, nc] of [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]] as Cell[]) {
          const k = `${nr}|${nc}`
          if (grid.has(k) && !hit.has(k)) {
            hit.add(k)
            stack.push([nr, nc])
          }
        }
      }
      expect(hit.size, JSON.stringify(params)).toBe(grid.size)

      const runs = (groups: Map<number, number[]>) => {
        for (const line of groups.values()) {
          const sorted = [...line].sort((x, y) => x - y)
          expect(sorted[sorted.length - 1] - sorted[0] + 1).toBe(sorted.length)
        }
      }
      const rows = new Map<number, number[]>()
      const cols = new Map<number, number[]>()
      for (const [r, c] of params.cells) {
        rows.set(r, [...(rows.get(r) ?? []), c])
        cols.set(c, [...(cols.get(c) ?? []), r])
      }
      runs(rows)
      runs(cols)
    }
  })

  test('a hand-built 2-by-2 block of 5 cm squares', () => {
    const p: Params = {
      piece: 'square',
      pieceW: 5,
      pieceH: 5,
      cells: [
        [0, 0], [0, 1],
        [1, 0], [1, 1],
      ],
      arrangement: 'rectangle',
      given: 'piece-perimeter',
      ask: 'perimeter',
    }
    expect(concept.paramsSchema.safeParse(p).success).toBe(true)
    const a = analyse(p)
    // Four joins bury 8 of the 16 loose edges; a 10 cm by 10 cm square is left.
    expect(a.joins).toBe(4)
    expect(a.outlineEdges).toBe(8)
    expect(concept.render(p).answer).toBe('40')
    expect(concept.render(p).body_en).toContain('The perimeter of one piece is 20 cm')
    // The trap is 4 × 20 = 80, twice the truth.
    expect(concept.render(p).breakdown?.trap?.wrong).toBe('80')
  })

  test('a hand-built staircase of 3 cm squares', () => {
    const p: Params = {
      piece: 'square',
      pieceW: 3,
      pieceH: 3,
      cells: [
        [0, 0],
        [1, 0], [1, 1],
        [2, 0], [2, 1], [2, 2],
      ],
      arrangement: 'staircase',
      given: 'piece-side',
      ask: 'perimeter',
    }
    expect(concept.paramsSchema.safeParse(p).success).toBe(true)
    const a = analyse(p)
    // The staircase's outline is 12 piece-edges — the same as the 3-by-3 box it
    // sits in, which is the surprise this shape exists to show.
    expect(a.outlineEdges).toBe(12)
    expect(concept.render(p).answer).toBe('36')
  })

  test('the schema rejects a layout that is two loose shapes', () => {
    const split: Params = {
      piece: 'square',
      pieceW: 3,
      pieceH: 3,
      cells: [
        [0, 0], [0, 1],
        [2, 0], [2, 1],
      ],
      arrangement: 'rectangle',
      given: 'piece-side',
      ask: 'perimeter',
    }
    expect(concept.paramsSchema.safeParse(split).success).toBe(false)
  })

  test('the schema rejects asking for a rectangular piece from one number', () => {
    const ambiguous: Params = {
      piece: 'rectangle',
      pieceW: 4,
      pieceH: 2,
      cells: [
        [0, 0], [0, 1],
        [1, 0], [1, 1],
      ],
      arrangement: 'rectangle',
      given: 'shape-perimeter',
      ask: 'area',
    }
    expect(concept.paramsSchema.safeParse(ambiguous).success).toBe(false)
  })

  test('the schema rejects a given that is already the answer', () => {
    const circular: Params = {
      piece: 'square',
      pieceW: 3,
      pieceH: 3,
      cells: [
        [0, 0], [0, 1],
        [1, 0], [1, 1],
      ],
      arrangement: 'rectangle',
      given: 'shape-perimeter',
      ask: 'perimeter',
    }
    expect(concept.paramsSchema.safeParse(circular).success).toBe(false)
  })

  test('the schema rejects a layout whose named arrangement is not what is drawn', () => {
    const mislabelled: Params = {
      piece: 'square',
      pieceW: 3,
      pieceH: 3,
      cells: [
        [0, 0], [0, 1],
        [1, 0], [1, 1],
      ],
      arrangement: 'staircase',
      given: 'piece-side',
      ask: 'perimeter',
    }
    expect(concept.paramsSchema.safeParse(mislabelled).success).toBe(false)
  })
})
