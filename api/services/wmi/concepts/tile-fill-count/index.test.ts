import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { analyse, type Cell, type Params } from './index.js'

const SEEDS = 340

/**
 * Independent recount. Deliberately shares NO code with `analyse` — it works
 * from the definition of the puzzle ("the shape is these squares; a square tile
 * covers one square, a triangle tile covers half of one") using its own set
 * bookkeeping, its own bounding box and its own multiplier read off the tile
 * name. If the drawn shape and the stated answer ever part company, these two
 * numbers part company first.
 */
function recount(p: Params): number {
  const shape = new Set(p.cells.map(([r, c]) => `${r}|${c}`))
  const covered = new Set(p.filled.map(([r, c]) => `${r}|${c}`))
  const perTile = p.tile === 'half-square-triangle' ? 2 : 1

  if (p.ask === 'total') return shape.size * perTile
  if (p.ask === 'how-many-more') {
    let waiting = 0
    for (const cell of shape) if (!covered.has(cell)) waiting += 1
    return waiting * perTile
  }
  // fewest-to-complete: the smallest square that can contain the shape has a
  // side equal to the larger of its width and height; the tiles to add are the
  // squares of that box the shape does not already own.
  let maxR = 0
  let maxC = 0
  for (const [r, c] of p.cells) {
    if (r > maxR) maxR = r
    if (c > maxC) maxC = c
  }
  const side = Math.max(maxR + 1, maxC + 1)
  let holes = 0
  for (let r = 0; r < side; r++) {
    for (let c = 0; c < side; c++) if (!shape.has(`${r}|${c}`)) holes += 1
  }
  return holes * perTile
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

describe('tile-fill-count', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(17))).toEqual(concept.generate(mulberry32(17)))
  })

  test('every generated params object parses', () => {
    for (const params of seeds()) {
      const parsed = concept.paramsSchema.safeParse(params)
      expect(parsed.success, `seed rejected: ${JSON.stringify(params)}`).toBe(true)
    }
  })

  test('the answer equals an independent recount of the drawn squares', () => {
    for (const params of seeds()) {
      const rendered = concept.render(params)
      expect(Number(rendered.answer), JSON.stringify(params)).toBe(recount(params))
    }
  })

  test('how-many-more is exactly total minus already covered', () => {
    let seen = 0
    for (const params of seeds()) {
      if (params.ask !== 'how-many-more') continue
      seen += 1
      const per = params.tile === 'half-square-triangle' ? 2 : 1
      const total = params.cells.length * per
      const done = params.filled.length * per
      expect(Number(concept.render(params).answer), JSON.stringify(params)).toBe(total - done)
      expect(params.filled.length).toBeGreaterThan(0)
      expect(params.filled.length).toBeLessThan(params.cells.length)
    }
    expect(seen).toBeGreaterThan(20)
  })

  test('two triangle tiles per square — the drawing and the arithmetic agree', () => {
    let seen = 0
    for (const params of seeds()) {
      const a = analyse(params)
      if (params.tile !== 'half-square-triangle') {
        expect(a.perSquare).toBe(1)
        expect(a.tiles).toBe(a.squares)
        continue
      }
      seen += 1
      // Two per square, from the tile name alone.
      expect(a.perSquare).toBe(2)
      expect(a.tiles).toBe(a.squares * 2)
      expect(a.tiles % 2).toBe(0)
      // The rule the arithmetic leans on has to be stated in the question and
      // walked in the hints, in both languages.
      const rendered = concept.render(params)
      expect(rendered.body_en).toContain('two tiles fit together to make one whole square')
      expect(rendered.body_id).toContain('dua keping disatukan menjadi satu kotak penuh')
      const lastEn = (rendered.hint_steps_en ?? []).join(' ')
      const lastId = (rendered.hint_steps_id ?? []).join(' ')
      expect(lastEn).toContain(`${a.squares} + ${a.squares} = ${a.tiles}`)
      expect(lastId).toContain(`${a.squares} + ${a.squares} = ${a.tiles}`)
      // A triangle question is never asked about growing into a full square.
      expect(params.ask).not.toBe('fewest-to-complete')
    }
    expect(seen).toBeGreaterThan(20)
  })

  test('fewest-to-complete: the box really is the smallest square, and holes are the answer', () => {
    let seen = 0
    for (const params of seeds()) {
      if (params.ask !== 'fewest-to-complete') continue
      seen += 1
      const a = analyse(params)
      const maxR = Math.max(...params.cells.map(([r]) => r))
      const maxC = Math.max(...params.cells.map(([, c]) => c))
      // As wide as it is tall — otherwise "the smallest square" is arguable.
      expect(maxR + 1).toBe(maxC + 1)
      expect(a.boxSide).toBe(maxR + 1)
      // A smaller square could not hold the shape at all.
      expect(params.cells.some(([r]) => r === a.boxSide - 1)).toBe(true)
      expect(params.cells.some(([, c]) => c === a.boxSide - 1)).toBe(true)
      expect(a.holes.length).toBe(a.boxSide * a.boxSide - params.cells.length)
      expect(a.holes.length).toBeGreaterThan(0)
      expect(Number(concept.render(params).answer)).toBe(a.holes.length)
    }
    expect(seen).toBeGreaterThan(10)
  })

  test('the row-by-row hint really adds up to the answer', () => {
    for (const params of seeds()) {
      const a = analyse(params)
      // Every counted square lands in exactly one row group, so the row tally is
      // a partition of the squares the child is asked for.
      const fromRows = a.targetRows.reduce((sum, row) => sum + row.cells.length, 0)
      expect(fromRows, JSON.stringify(params)).toBe(a.squares)
      expect(a.squares * a.perSquare).toBe(Number(concept.render(params).answer))
      // The running total the hints narrate ends on the counted number.
      const steps = concept.render(params).hint_steps_en ?? []
      expect(steps.join(' ')).toContain(`that makes ${a.squares}`)
      expect((concept.render(params).hint_steps_id ?? []).join(' ')).toContain(`jadi ${a.squares}`)
    }
  })

  test('shapes are one connected piece with no gap in any row', () => {
    for (const params of seeds()) {
      const cells = new Set(params.cells.map(([r, c]) => `${r}|${c}`))
      // Connectivity, walked independently of the concept's own flood fill.
      const stack: Cell[] = [params.cells[0]]
      const hit = new Set<string>([`${params.cells[0][0]}|${params.cells[0][1]}`])
      while (stack.length > 0) {
        const [r, c] = stack.pop() as Cell
        for (const [nr, nc] of [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]] as Cell[]) {
          const k = `${nr}|${nc}`
          if (cells.has(k) && !hit.has(k)) {
            hit.add(k)
            stack.push([nr, nc])
          }
        }
      }
      expect(hit.size, JSON.stringify(params)).toBe(cells.size)

      const perRow = new Map<number, number[]>()
      for (const [r, c] of params.cells) perRow.set(r, [...(perRow.get(r) ?? []), c])
      for (const cols of perRow.values()) {
        const sorted = [...cols].sort((x, y) => x - y)
        expect(sorted[sorted.length - 1] - sorted[0] + 1).toBe(sorted.length)
      }
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
        JSON.stringify(r.breakdown),
      ]
      for (const text of texts) {
        expect(text.length, JSON.stringify(params)).toBeGreaterThan(0)
        // `"trap":null` and `"unit":null` are legitimate JSON in the breakdown;
        // a stringified `null` inside PROSE is not, so guard the prose fields
        // separately from the serialised object.
        expect(text).not.toMatch(/undefined|NaN|\[object/)
      }
      for (const text of texts.slice(0, -1)) {
        expect(text, JSON.stringify(params)).not.toMatch(/\bnull\b/)
      }
      expect(Number.isInteger(Number(r.answer))).toBe(true)
      expect(Number(r.answer)).toBeGreaterThan(0)
      expect(r.hint_steps_en?.length).toBe(r.hint_steps_id?.length)
      expect((r.hint_steps_en ?? []).length).toBeGreaterThanOrEqual(3)
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
      // The trap, when there is one, must be a genuinely different number.
      if (breakdown.trap) expect(breakdown.trap.wrong).not.toBe(r.answer)
    }
  })

  test('all three asks and both tiles are actually produced', () => {
    const asks = new Set(seeds().map((p) => p.ask))
    const tiles = new Set(seeds().map((p) => p.tile))
    expect([...asks].sort()).toEqual(['fewest-to-complete', 'how-many-more', 'total'])
    expect([...tiles].sort()).toEqual(['half-square-triangle', 'unit-square'])
  })

  test('answers stay inside a six-year-old counting range', () => {
    for (const params of seeds()) {
      const n = Number(concept.render(params).answer)
      expect(n).toBeGreaterThanOrEqual(1)
      expect(n).toBeLessThanOrEqual(14)
    }
  })

  test('the schema rejects a shape whose smallest square is arguable', () => {
    // Two rows of three: 3 across but only 2 down, so "the smallest square" could
    // be read as 3 by 3 — the child would be guessing which square is meant.
    const wide: Params = {
      tile: 'unit-square',
      cells: [
        [0, 0], [0, 1], [0, 2],
        [1, 0], [1, 1], [1, 2],
      ],
      filled: [],
      ask: 'fewest-to-complete',
    }
    expect(concept.paramsSchema.safeParse(wide).success).toBe(false)
  })

  test('the schema rejects a shape that is two loose pieces', () => {
    const split: Params = {
      tile: 'unit-square',
      cells: [
        [0, 0], [0, 1],
        [2, 0], [2, 1],
      ],
      filled: [],
      ask: 'total',
    }
    expect(concept.paramsSchema.safeParse(split).success).toBe(false)
  })

  test('the schema rejects covered squares that are not part of the shape', () => {
    const stray: Params = {
      tile: 'unit-square',
      cells: [
        [0, 0], [0, 1],
        [1, 0], [1, 1],
      ],
      filled: [[5, 5]],
      ask: 'how-many-more',
    }
    expect(concept.paramsSchema.safeParse(stray).success).toBe(false)
  })

  test('a hand-built triangle question doubles exactly', () => {
    const p: Params = {
      tile: 'half-square-triangle',
      cells: [
        [0, 0], [0, 1],
        [1, 0], [1, 1],
        [2, 0],
      ],
      filled: [],
      ask: 'total',
    }
    expect(concept.paramsSchema.safeParse(p).success).toBe(true)
    const a = analyse(p)
    expect(a.squares).toBe(5)
    expect(concept.render(p).answer).toBe('10')
    expect(a.targetRows.map((row) => row.cells.length)).toEqual([2, 2, 1])
  })
})
