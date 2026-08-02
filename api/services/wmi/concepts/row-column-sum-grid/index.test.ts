import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { printedLines, solve, SYMBOLS, trapAnswer, type Params } from './index.js'

const SEEDS = 320

/**
 * Independent oracle. Written from the DEFINITION of the puzzle — "each covered
 * square holds a number from 1 to 9, and every printed total is the sum of its
 * line" — with no shared code with the forcing solver. It tries every possible
 * filling of the covered squares and counts the ones that survive.
 *
 * A grid with two survivors is the classic bug this concept has to avoid: the
 * child would have to guess, and either guess would be defensible.
 */
function countCompletions(p: Params): number {
  const lines = printedLines(p)
  const values = new Array(p.hidden.length).fill(0)
  let found = 0

  const consistent = (): boolean => {
    const board = p.grid.map((row) => [...row])
    p.hidden.forEach((h, i) => {
      board[h.r][h.c] = values[i]
    })
    return lines.every((line) => line.cells.reduce((sum, x) => sum + board[x.r][x.c], 0) === line.sum)
  }

  const walk = (at: number): void => {
    if (at === p.hidden.length) {
      if (consistent()) found += 1
      return
    }
    for (let v = 1; v <= 9; v++) {
      values[at] = v
      walk(at + 1)
    }
  }
  walk(0)
  return found
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

describe('row-column-sum-grid', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(11))).toEqual(concept.generate(mulberry32(11)))
  })

  test('the brute-force oracle catches an ambiguous grid the schema must reject', () => {
    // Two covers on the SAME row, and that row's total is the only evidence
    // about either of them: 6 + ★ + ● = 17 has many solutions in 1..9.
    const ambiguous: Params = {
      rows: 3,
      cols: 3,
      grid: [
        [6, 4, 7],
        [3, 5, 1],
        [8, 2, 9],
      ],
      hidden: [
        { r: 0, c: 1 },
        { r: 0, c: 2 },
      ],
      rowSumShown: [true, false, false],
      colSumShown: [false, false, false],
      ask: 'sum-of-two',
      targets: [0, 1],
    }
    expect(countCompletions(ambiguous)).toBeGreaterThan(1)
    expect(solve(ambiguous).forced).toBe(false)
    expect(() => concept.paramsSchema.parse(ambiguous)).toThrow()

    // Print the column totals too and the very same covers become forced.
    const forced: Params = { ...ambiguous, colSumShown: [false, true, true] }
    expect(countCompletions(forced)).toBe(1)
    expect(solve(forced).forced).toBe(true)
    expect(() => concept.paramsSchema.parse(forced)).not.toThrow()
    expect(solve(forced).answer).toBe(String(4 + 7))
  })

  test('a chain of two lines: filling the first hands the second its single blank', () => {
    const p: Params = {
      rows: 3,
      cols: 3,
      grid: [
        [4, 2, 9],
        [3, 5, 1],
        [7, 6, 8],
      ],
      hidden: [
        { r: 0, c: 2 },
        { r: 2, c: 2 },
      ],
      rowSumShown: [true, false, false],
      colSumShown: [false, false, true],
      ask: 'sum-of-two',
      targets: [0, 1],
    }
    const s = solve(p)
    expect(s.forced).toBe(true)
    expect(countCompletions(p)).toBe(1)
    // Row 1 must go first — column 3 still has two blanks at that moment.
    expect(s.steps.map((x) => `${x.kind}${x.index}`)).toEqual(['row0', 'col2'])
    expect(s.steps[0].value).toBe(9)
    expect(s.steps[1].value).toBe(8)
    expect(s.answer).toBe('17')
  })

  test(`${SEEDS} seeds: forced, unique by brute force, and clean to render`, () => {
    const seenAsk = new Set<string>()
    const seenShape = new Set<string>()
    const seenHiddenCount = new Set<number>()
    let seenChains = 0
    let seenTraps = 0

    for (let seed = 1; seed <= SEEDS; seed++) {
      const p = concept.generate(mulberry32(seed))
      const where = `seed ${seed} (${JSON.stringify(p)})`
      expect(() => concept.paramsSchema.parse(p), where).not.toThrow()
      seenAsk.add(p.ask)
      seenShape.add(`${p.rows}x${p.cols}`)
      seenHiddenCount.add(p.hidden.length)

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
      expect(p.rows * p.cols, where).toBeGreaterThanOrEqual(6)
      expect(new Set(p.hidden.map((h) => `${h.r},${h.c}`)).size, where).toBe(p.hidden.length)
      expect(p.hidden.length, where).toBeLessThan(p.rows * p.cols)
      expect(p.targets.length, where).toBe(p.ask === 'one-cell' ? 1 : 2)
      expect(new Set(p.targets).size, where).toBe(p.targets.length)
      for (const t of p.targets) expect(t, where).toBeLessThan(p.hidden.length)
      // Covers are stored in reading order, so SYMBOLS[i] names hidden[i].
      const reading = [...p.hidden].sort((a, b) => a.r - b.r || a.c - b.c)
      expect(p.hidden, where).toEqual(reading)

      // ── Every printed total really is its line's total ──────────────────
      const lines = printedLines(p)
      expect(lines.length, where).toBeGreaterThanOrEqual(1)
      for (const line of lines) {
        expect(line.cells.reduce((sum, x) => sum + p.grid[x.r][x.c], 0), where).toBe(line.sum)
      }

      // ── The completion is FORCED, and it is the ONLY one ────────────────
      const s = solve(p)
      expect(s.forced, where).toBe(true)
      expect(s.steps.length, where).toBe(p.hidden.length)
      expect(countCompletions(p), `${where}: more than one grid fits the printed totals`).toBe(1)

      // Each step is a real deduction: the line it uses had exactly one blank
      // at that moment, and its arithmetic lands on the covered value.
      const uncovered = new Set<string>()
      const stillCovered = new Set(p.hidden.map((h) => `${h.r},${h.c}`))
      for (const step of s.steps) {
        const line = lines.find((l) => l.kind === step.kind && l.index === step.index)
        expect(line, where).toBeTruthy()
        const blanks = (line as (typeof lines)[number]).cells.filter(
          (x) => stillCovered.has(`${x.r},${x.c}`) && !uncovered.has(`${x.r},${x.c}`),
        )
        expect(blanks.length, `${where}: step used a line with ${blanks.length} blanks`).toBe(1)
        expect(blanks[0], where).toEqual(step.cell)
        expect(step.known.length, where).toBe((line as (typeof lines)[number]).cells.length - 1)
        expect(
          step.known.reduce((rest, k) => rest - k.value, step.sum),
          where,
        ).toBe(step.value)
        expect(step.value, where).toBe(p.grid[step.cell.r][step.cell.c])
        expect(step.symbol, where).toBe(SYMBOLS[step.hiddenIndex])
        uncovered.add(`${step.cell.r},${step.cell.c}`)
      }
      if (s.steps.length >= 2) seenChains += 1

      // ── The ask really is what the answer is ────────────────────────────
      const tv = s.targetValues
      if (p.ask === 'one-cell') {
        expect(s.answer, where).toBe(String(tv[0]))
      } else if (p.ask === 'sum-of-two') {
        expect(s.answer, where).toBe(String(tv[0] + tv[1]))
      } else {
        expect(s.answer, where).toBe(String(tv[0] * 10 + tv[1]))
        expect(Number(s.answer), where).toBeGreaterThanOrEqual(10)
        expect(tv[0], where).not.toBe(tv[1])
      }
      // The targets fall LAST, so a child cannot read the answer off step one.
      const order = s.steps.map((x) => x.hiddenIndex)
      for (const t of p.targets) {
        expect(order.indexOf(t), where).toBeGreaterThanOrEqual(order.length - p.targets.length)
      }

      // ── Rendering ───────────────────────────────────────────────────────
      const r = concept.render(p)
      expect(r.answer, where).toBe(s.answer)
      expect(r.answer_type, where).toBe('fill_in')
      expect(r.choices_en, where).toBeNull()
      expect(r.choices_id, where).toBeNull()

      // Nothing anywhere may leak an undefined / NaN into a child's screen.
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

      // Steps must END on the answer, and every covered value must be DERIVED
      // in a step before the closing line uses it.
      expect((r.hint_steps_en ?? []).length, where).toBe((r.hint_steps_id ?? []).length)
      expect((r.hint_steps_en ?? []).length, where).toBe(p.hidden.length + 2)
      expect((r.hint_steps_en ?? []).at(-1) as string, where).toContain(s.answer)
      expect((r.hint_steps_id ?? []).at(-1) as string, where).toContain(s.answer)
      // No decoys: every cover on the figure is a cover the answer leans on.
      expect(s.neededSteps, where).toEqual(s.steps)
      for (const step of s.steps) {
        const line_en = (r.hint_steps_en ?? [])[s.steps.indexOf(step) + 1]
        const line_id = (r.hint_steps_id ?? [])[s.steps.indexOf(step) + 1]
        expect(line_en, where).toContain(`= ${step.value}`)
        expect(line_id, where).toContain(`= ${step.value}`)
        expect(line_en, where).toContain(String(step.sum))
        expect(line_id, where).toContain(String(step.sum))
      }

      // ── Breakdown ───────────────────────────────────────────────────────
      const display_en = stripLabels(r.body_en)
      const display_id = stripLabels(r.body_id)
      expect(bd.needsVisual, where).toBe(true)
      expect(bd.answer.value, where).toBe(s.answer)
      expect(bd.highlights.length, where).toBeGreaterThanOrEqual(4)
      for (const h of bd.highlights) {
        expect(display_en, `${where} phrase_en=${h.phrase_en}`).toContain(h.phrase_en)
        expect(display_id, `${where} phrase_id=${h.phrase_id}`).toContain(h.phrase_id)
      }
      expectNoOverlap(display_en, bd.highlights.map((h) => h.phrase_en), where)
      expectNoOverlap(display_id, bd.highlights.map((h) => h.phrase_id), where)

      // The stem must never mention a rule the paper does not actually print.
      expect(r.body_en.includes('whole row'), where).toBe(p.rowSumShown.some(Boolean))
      expect(r.body_en.includes('whole column'), where).toBe(p.colSumShown.some(Boolean))
      expect(r.body_id.includes('seluruh baris'), where).toBe(p.rowSumShown.some(Boolean))
      expect(r.body_id.includes('seluruh kolom'), where).toBe(p.colSumShown.some(Boolean))

      // The trap, when there is one, must be genuinely WRONG and wrong in the
      // one way this ask invites: the right digits, the wrong way round.
      const trap = trapAnswer(p, s)
      expect(bd.trap?.wrong ?? null, where).toBe(trap)
      if (trap !== null) {
        seenTraps += 1
        expect(p.ask, where).toBe('two-digit-number-formed')
        expect(trap, where).not.toBe(s.answer)
        expect(trap, where).toBe(String(tv[1] * 10 + tv[0]))
      }
    }

    expect([...seenAsk].sort()).toEqual(['one-cell', 'sum-of-two', 'two-digit-number-formed'])
    expect([...seenShape].sort()).toEqual(['2x3', '3x2', '3x3'])
    expect([...seenHiddenCount].sort()).toEqual([1, 2, 3])
    expect(seenChains).toBeGreaterThan(SEEDS / 4)
    expect(seenTraps).toBeGreaterThan(10)
  })

  test('the schema rejects the shapes that would break the concept', () => {
    const ok: Params = {
      rows: 3,
      cols: 3,
      grid: [
        [4, 2, 9],
        [3, 5, 1],
        [7, 6, 8],
      ],
      hidden: [{ r: 0, c: 2 }],
      rowSumShown: [true, false, false],
      colSumShown: [false, false, false],
      ask: 'one-cell',
      targets: [0],
    }
    expect(() => concept.paramsSchema.parse(ok)).not.toThrow()
    // no printed total at all → nothing is knowable
    expect(() =>
      concept.paramsSchema.parse({ ...ok, rowSumShown: [false, false, false] }),
    ).toThrow()
    // a cover on a line with no printed total is not forced
    expect(() => concept.paramsSchema.parse({ ...ok, hidden: [{ r: 1, c: 2 }] })).toThrow()
    // grid smaller than 2 by 3
    expect(() =>
      concept.paramsSchema.parse({
        ...ok,
        rows: 2,
        cols: 2,
        grid: [
          [4, 2],
          [3, 5],
        ],
        rowSumShown: [true, false],
        colSumShown: [false, false],
        hidden: [{ r: 0, c: 1 }],
      }),
    ).toThrow()
    // grid does not match the declared shape
    expect(() => concept.paramsSchema.parse({ ...ok, rows: 2 })).toThrow()
    // two-target asks need two targets
    expect(() => concept.paramsSchema.parse({ ...ok, ask: 'sum-of-two' })).toThrow()
    // duplicate covers
    expect(() =>
      concept.paramsSchema.parse({
        ...ok,
        hidden: [
          { r: 0, c: 2 },
          { r: 0, c: 2 },
        ],
        ask: 'sum-of-two',
        targets: [0, 1],
      }),
    ).toThrow()
    // a target that points past the covers
    expect(() => concept.paramsSchema.parse({ ...ok, targets: [2] })).toThrow()
  })
})
