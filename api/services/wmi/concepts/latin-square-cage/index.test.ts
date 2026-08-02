import { describe, test, expect } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { mulberry32 } from '../rng.js'
import concept, {
  BOX_SIZE,
  cageClue,
  countCompletions,
  LETTERS,
  solve,
  trapAnswer,
  type Cage,
  type Cell,
  type Params,
} from './index.js'
import LatinSquareCageIllustration from '@/components/wmi/concepts/latin-square-cage'
import LatinSquareCageExplainer from '@/components/wmi/concepts/explainers/LatinSquareCageExplainer'
import { buildLatinSquareCageSteps } from '@/components/wmi/concepts/explainers/latinSquareCageSteps'

const SEEDS = 220

// ── Independent oracles ──────────────────────────────────────────────────────

/**
 * Counts completions ROW BY ROW — a different search order and a different
 * pruning story from the concept's own cell-by-cell `countCompletions`, and
 * written straight from the definition: each row is a permutation of 1..n, no
 * column (or bold box) repeats, every given stands, every frame clue holds.
 *
 * Two survivors is the classic bug this concept has to avoid: the child would
 * have to guess, and either guess would be defensible.
 */
function countByRows(p: Params, cap = 2): number {
  const { n } = p
  const perms: number[][] = []
  const build = (cur: number[], left: number[]): void => {
    if (left.length === 0) {
      perms.push([...cur])
      return
    }
    for (let i = 0; i < left.length; i++) {
      build([...cur, left[i]], [...left.slice(0, i), ...left.slice(i + 1)])
    }
  }
  build([], Array.from({ length: n }, (_, i) => i + 1))

  const givenAt = new Map(p.givens.map((g) => [`${g.r},${g.c}`, p.solution[g.r][g.c]]))
  const grid: number[][] = []
  let found = 0

  const cagesDoneAt = (row: number): Cage[] =>
    p.cages.filter((cage) => cage.cells.every((x) => x.r <= row))

  const rowFits = (row: number, values: number[]): boolean => {
    for (let c = 0; c < n; c++) {
      const fixed = givenAt.get(`${row},${c}`)
      if (fixed !== undefined && fixed !== values[c]) return false
      for (let r = 0; r < row; r++) if (grid[r][c] === values[c]) return false
    }
    if (p.clueSystem === 'thick-box') {
      // Earlier rows of the SAME band of boxes may not already carry this
      // number anywhere inside the box this square falls in.
      const bandTop = Math.floor(row / BOX_SIZE) * BOX_SIZE
      for (let c = 0; c < n; c++) {
        const boxLeft = Math.floor(c / BOX_SIZE) * BOX_SIZE
        for (let r = bandTop; r < row; r++) {
          for (let cc = boxLeft; cc < boxLeft + BOX_SIZE; cc++) {
            if (grid[r][cc] === values[c]) return false
          }
        }
      }
    }
    grid[row] = values
    const ok = cagesDoneAt(row).every((cage) => {
      const vals = cage.cells.map((x) => grid[x.r][x.c])
      const got =
        cage.op === '+'
          ? vals.reduce((a, b) => a + b, 0)
          : cage.op === 'x'
            ? vals.reduce((a, b) => a * b, 1)
            : Math.abs(vals[0] - vals[1])
      return got === cage.target
    })
    grid.length = row
    return ok
  }

  const walk = (row: number): void => {
    if (found >= cap) return
    if (row === n) {
      found += 1
      return
    }
    for (const values of perms) {
      if (!rowFits(row, values)) continue
      grid[row] = values
      walk(row + 1)
      grid.length = row
      if (found >= cap) return
    }
  }
  walk(0)
  return found
}

/** Every unit a square belongs to, rebuilt from the definition in the test. */
function unitsFor(p: Params, cell: Cell): Cell[][] {
  const { n } = p
  const out: Cell[][] = [
    Array.from({ length: n }, (_, c) => ({ r: cell.r, c })),
    Array.from({ length: n }, (_, r) => ({ r, c: cell.c })),
  ]
  if (p.clueSystem === 'thick-box') {
    const br = Math.floor(cell.r / BOX_SIZE) * BOX_SIZE
    const bc = Math.floor(cell.c / BOX_SIZE) * BOX_SIZE
    const box: Cell[] = []
    for (let dr = 0; dr < BOX_SIZE; dr++) for (let dc = 0; dc < BOX_SIZE; dc++) box.push({ r: br + dr, c: bc + dc })
    out.push(box)
  }
  return out
}

/** Numbers no line through `cell` already carries, given what is known so far. */
function lineAllowed(p: Params, known: (number | null)[][], cell: Cell): number[] {
  const banned = new Set<number>()
  for (const unit of unitsFor(p, cell)) {
    for (const x of unit) {
      if (x.r === cell.r && x.c === cell.c) continue
      const v = known[x.r][x.c]
      if (v !== null) banned.add(v)
    }
  }
  return Array.from({ length: p.n }, (_, i) => i + 1).filter((v) => !banned.has(v))
}

function subsetsWithOp(pool: number[], k: number, op: Cage['op'], target: number): number[][] {
  const out: number[][] = []
  const cur: number[] = []
  const walk = (start: number): void => {
    if (cur.length === k) {
      const got =
        op === '+'
          ? cur.reduce((a, b) => a + b, 0)
          : op === 'x'
            ? cur.reduce((a, b) => a * b, 1)
            : cur.length === 2
              ? Math.abs(cur[0] - cur[1])
              : NaN
      if (got === target) out.push([...cur])
      return
    }
    for (let i = start; i < pool.length; i++) {
      cur.push(pool[i])
      walk(i + 1)
      cur.pop()
    }
  }
  walk(0)
  return out
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

/** Everything the figure actually prints, in document order. */
function textNodes(markup: string): string[] {
  return [...markup.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map((m) => m[1])
}

// ── Fixtures ─────────────────────────────────────────────────────────────────

const SYMMETRIC_SOLUTION = [
  [1, 2, 3, 4],
  [2, 1, 4, 3],
  [3, 4, 1, 2],
  [4, 3, 2, 1],
]
const rowPair = (r: number, c: number): Cell[] => [
  { r, c },
  { r, c: c + 1 },
]
const SYMMETRIC_CAGES: Cage[] = [
  { cells: rowPair(0, 0), op: '+', target: 3 },
  { cells: rowPair(0, 2), op: '+', target: 7 },
  { cells: rowPair(1, 0), op: '+', target: 3 },
  { cells: rowPair(1, 2), op: '+', target: 7 },
  { cells: rowPair(2, 0), op: '+', target: 7 },
  { cells: rowPair(2, 2), op: '+', target: 3 },
  { cells: rowPair(3, 0), op: '+', target: 7 },
  { cells: rowPair(3, 2), op: '+', target: 3 },
]
const AMBIGUOUS: Params = {
  n: 4,
  clueSystem: 'cage-op',
  solution: SYMMETRIC_SOLUTION,
  cages: SYMMETRIC_CAGES,
  givens: [],
  letters: [
    { r: 1, c: 1 },
    { r: 1, c: 2 },
  ],
  ask: 'letters-sum',
} as Params
const FORCED: Params = {
  ...AMBIGUOUS,
  givens: [
    { r: 0, c: 0 },
    { r: 0, c: 2 },
    { r: 2, c: 0 },
    { r: 2, c: 2 },
  ],
}

describe('latin-square-cage', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(11))).toEqual(concept.generate(mulberry32(11)))
  })

  test('the brute-force oracle catches an ambiguous puzzle the schema must reject', () => {
    // Every frame is a horizontal pair, so each row splits into {1,2} and {3,4}
    // with the order inside each half free: sixteen different grids satisfy
    // every printed clue, and a child "solving" it has really only guessed.
    expect(countByRows(AMBIGUOUS, 99)).toBe(16)
    expect(countCompletions(AMBIGUOUS, 99)).toBe(16)
    expect(solve(AMBIGUOUS).forced).toBe(false)
    expect(() => concept.paramsSchema.parse(AMBIGUOUS)).toThrow()

    // Print one square of each free half and the very same frames become forced.
    expect(countByRows(FORCED, 99)).toBe(1)
    expect(countCompletions(FORCED, 99)).toBe(1)
    const s = solve(FORCED)
    expect(s.forced).toBe(true)
    expect(() => concept.paramsSchema.parse(FORCED)).not.toThrow()
    // The frame's unique pair opens it, its partner falls to the frame total,
    // and the line rule closes the last square.
    expect(s.neededSteps.map((x) => x.rule)).toEqual([
      'frame-combo',
      'frame-last-square',
      'only-number-left',
    ])
    expect(s.answer).toBe(String(1 + 4))
  })

  test(`${SEEDS} seeds: forced, unique by two independent brute forces, clean to render`, () => {
    const seenAsk = new Set<string>()
    const seenShape = new Set<string>()
    const seenRule = new Set<string>()
    let seenTraps = 0
    let seenLongChains = 0

    for (let seed = 1; seed <= SEEDS; seed++) {
      const p = concept.generate(mulberry32(seed))
      const where = `seed ${seed} (${JSON.stringify(p)})`
      expect(() => concept.paramsSchema.parse(p), where).not.toThrow()
      seenAsk.add(p.ask)
      seenShape.add(`${p.n}-${p.clueSystem}`)

      // ── The completed square really is a Latin square ───────────────────
      const full = Array.from({ length: p.n }, (_, i) => i + 1).join()
      expect(p.solution.length, where).toBe(p.n)
      for (let r = 0; r < p.n; r++) {
        expect(p.solution[r].length, where).toBe(p.n)
        expect([...p.solution[r]].sort((a, b) => a - b).join(), `${where}: row ${r}`).toBe(full)
      }
      for (let c = 0; c < p.n; c++) {
        expect(
          p.solution.map((row) => row[c]).sort((a, b) => a - b).join(),
          `${where}: column ${c}`,
        ).toBe(full)
      }
      if (p.clueSystem === 'thick-box') {
        expect(p.n, where).toBe(4)
        expect(p.cages.length, where).toBe(0)
        for (let br = 0; br < p.n / BOX_SIZE; br++) {
          for (let bc = 0; bc < p.n / BOX_SIZE; bc++) {
            const vals: number[] = []
            for (let dr = 0; dr < BOX_SIZE; dr++) {
              for (let dc = 0; dc < BOX_SIZE; dc++) {
                vals.push(p.solution[br * BOX_SIZE + dr][bc * BOX_SIZE + dc])
              }
            }
            expect(vals.sort((a, b) => a - b).join(), `${where}: box ${br},${bc}`).toBe(full)
          }
        }
      }

      // ── Every frame is a straight run, tiles the grid, and tells the truth ─
      if (p.clueSystem === 'cage-op') {
        const covered = new Set<string>()
        for (const cage of p.cages) {
          expect(cage.cells.length, where).toBeGreaterThanOrEqual(2)
          expect(cage.cells.length, where).toBeLessThanOrEqual(3)
          if (cage.op === '-') expect(cage.cells.length, where).toBe(2)
          const cells = [...cage.cells].sort((a, b) => a.r - b.r || a.c - b.c)
          const straightRow = cells.every((x) => x.r === cells[0].r)
          const straightCol = cells.every((x) => x.c === cells[0].c)
          expect(straightRow || straightCol, `${where}: frame not a straight run`).toBe(true)
          for (let i = 1; i < cells.length; i++) {
            const step = straightRow ? cells[i].c - cells[i - 1].c : cells[i].r - cells[i - 1].r
            expect(step, where).toBe(1)
          }
          for (const x of cage.cells) {
            expect(covered.has(`${x.r},${x.c}`), `${where}: frames overlap`).toBe(false)
            covered.add(`${x.r},${x.c}`)
          }
          const vals = cage.cells.map((x) => p.solution[x.r][x.c])
          // A straight run shares a row or a column, so its numbers are all
          // different — the premise the hints lean on when they say "the only
          // pair of DIFFERENT numbers that adds to 7".
          expect(new Set(vals).size, `${where}: frame repeats a number`).toBe(vals.length)
          const got =
            cage.op === '+'
              ? vals.reduce((a, b) => a + b, 0)
              : cage.op === 'x'
                ? vals.reduce((a, b) => a * b, 1)
                : Math.abs(vals[0] - vals[1])
          expect(got, `${where}: frame ${cageClue(cage)} does not hold`).toBe(cage.target)
        }
        expect(covered.size, `${where}: frames do not tile the grid`).toBe(p.n * p.n)
      }

      // ── Givens and letters ──────────────────────────────────────────────
      expect(new Set(p.givens.map((g) => `${g.r},${g.c}`)).size, where).toBe(p.givens.length)
      expect(new Set(p.letters.map((l) => `${l.r},${l.c}`)).size, where).toBe(p.letters.length)
      for (const l of p.letters) {
        expect(p.givens.some((g) => g.r === l.r && g.c === l.c), `${where}: letter on a given`).toBe(false)
      }
      expect(p.letters.length, where).toBe(p.ask === 'single-letter' ? 1 : p.letters.length)
      if (p.ask !== 'single-letter') expect(p.letters.length, where).toBeGreaterThanOrEqual(2)
      // Letters are stored in reading order, so LETTERS[i] names letters[i].
      expect(p.letters, where).toEqual([...p.letters].sort((a, b) => a.r - b.r || a.c - b.c))

      // ── EXACTLY ONE completion, checked twice, two different ways ────────
      expect(countCompletions(p, 9), `${where}: cell-by-cell search disagrees`).toBe(1)
      expect(countByRows(p, 9), `${where}: row-by-row search disagrees`).toBe(1)

      // ── The trail is forced, and each step really is forced when it runs ──
      const s = solve(p)
      expect(s.forced, where).toBe(true)
      expect(s.steps.length, where).toBe(p.n * p.n - p.givens.length)

      const known: (number | null)[][] = Array.from({ length: p.n }, () =>
        Array.from({ length: p.n }, () => null),
      )
      for (const g of p.givens) known[g.r][g.c] = p.solution[g.r][g.c]
      for (const step of s.steps) {
        seenRule.add(step.rule)
        expect(known[step.cell.r][step.cell.c], `${where}: square filled twice`).toBeNull()
        const allowed = lineAllowed(p, known, step.cell)
        expect(allowed, `${where}: ${step.rule} pinned a banned number`).toContain(step.value)

        if (step.rule === 'only-number-left') {
          // Re-derived from scratch: the lines alone leave one number.
          expect(allowed, `${where}: only-number-left had ${allowed.length} choices`).toEqual([step.value])
        } else if (step.rule === 'only-home-in-line') {
          const unit = (step.unit as { cells: Cell[] }).cells
          expect(
            unit.some((x) => x.r === step.cell.r && x.c === step.cell.c),
            `${where}: the cited line does not contain the square`,
          ).toBe(true)
          expect(
            unit.some((x) => known[x.r][x.c] === step.value),
            `${where}: the cited line already holds that number`,
          ).toBe(false)
          const homes = unit.filter(
            (x) => known[x.r][x.c] === null && lineAllowed(p, known, x).includes(step.value),
          )
          expect(homes.length, `${where}: ${step.value} had ${homes.length} homes`).toBe(1)
          expect(homes[0], where).toEqual(step.cell)
        } else {
          const cage = step.cage as Cage
          expect(cage, where).toBeTruthy()
          expect(
            cage.cells.some((x) => x.r === step.cell.r && x.c === step.cell.c),
            `${where}: the cited frame does not contain the square`,
          ).toBe(true)
          const blanks = cage.cells.filter((x) => known[x.r][x.c] === null)
          const seen = cage.cells
            .filter((x) => known[x.r][x.c] !== null)
            .map((x) => known[x.r][x.c] as number)
          if (step.rule === 'frame-last-square') {
            expect(blanks.length, where).toBe(1)
            let arith: number[] = []
            if (cage.op === '+') arith = [cage.target - seen.reduce((a, b) => a + b, 0)]
            else if (cage.op === 'x') {
              const prod = seen.reduce((a, b) => a * b, 1)
              arith = cage.target % prod === 0 ? [cage.target / prod] : []
            } else arith = [seen[0] + cage.target, seen[0] - cage.target]
            const feasible = arith.filter((v) => v >= 1 && v <= p.n && allowed.includes(v))
            expect(feasible, `${where}: frame-last-square was not forced`).toEqual([step.value])
          } else {
            expect(blanks.length, where).toBeGreaterThanOrEqual(2)
            let residual: number | null = null
            if (cage.op === '+') residual = cage.target - seen.reduce((a, b) => a + b, 0)
            else if (cage.op === 'x') {
              const prod = seen.reduce((a, b) => a * b, 1)
              residual = cage.target % prod === 0 ? cage.target / prod : null
            } else residual = seen.length === 0 ? cage.target : null
            expect(residual, where).not.toBeNull()
            const pool = Array.from({ length: p.n }, (_, i) => i + 1).filter((v) => !seen.includes(v))
            const combos = subsetsWithOp(pool, blanks.length, cage.op, residual as number)
            expect(combos.length, `${where}: frame-combo cited a frame with ${combos.length} fillings`).toBe(1)
            const feasible = combos[0].filter((v) => allowed.includes(v))
            expect(feasible, `${where}: frame-combo was not forced`).toEqual([step.value])
          }
        }
        known[step.cell.r][step.cell.c] = step.value
      }
      // Replaying the whole trail must rebuild the very square it came from.
      expect(known, `${where}: the trail does not rebuild the solution`).toEqual(p.solution)

      // ── The ask really is what the answer is ────────────────────────────
      const values = p.letters.map((l) => p.solution[l.r][l.c])
      expect(s.letterValues, where).toEqual(values)
      if (p.ask === 'single-letter') expect(s.answer, where).toBe(String(values[0]))
      else if (p.ask === 'letters-sum') {
        expect(s.answer, where).toBe(String(values.reduce((a, b) => a + b, 0)))
      } else {
        expect(s.answer, where).toBe(values.join(''))
        expect([...values].reverse().join(), where).not.toBe(values.join())
      }
      // The chain has to be a real puzzle, and short enough to read.
      expect(s.neededSteps.length, where).toBeGreaterThanOrEqual(2)
      expect(s.neededSteps.length, where).toBeLessThanOrEqual(7)
      if (s.neededSteps.length >= 4) seenLongChains += 1
      if (p.clueSystem === 'cage-op') {
        expect(
          s.neededSteps.some((x) => x.cage !== null),
          `${where}: the frames never mattered`,
        ).toBe(true)
      }

      // ── Rendering ───────────────────────────────────────────────────────
      const r = concept.render(p)
      expect(r.answer, where).toBe(s.answer)
      expect(r.answer_type, where).toBe('fill_in')
      expect(r.choices_en, where).toBeNull()
      expect(r.choices_id, where).toBeNull()

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
      // A dangling connective is the tell that a clause list came back empty.
      for (const line of [...(r.hint_steps_en ?? []), ...(r.hint_steps_id ?? [])]) {
        expect(line, `${where}: dangling connective in "${line}"`).not.toMatch(
          /(,\s*(and|dan)\s*[.,]|\s(so|jadi)\s+(is|adalah)\s|\.\s+(so|jadi)\s)/,
        )
      }

      // Steps must END on the answer, and every needed square must be DERIVED
      // in a line of its own before the closing line uses it.
      expect((r.hint_steps_en ?? []).length, where).toBe((r.hint_steps_id ?? []).length)
      expect((r.hint_steps_en ?? []).length, where).toBe(s.neededSteps.length + 2)
      expect((r.hint_steps_en ?? []).at(-1) as string, where).toContain(s.answer)
      expect((r.hint_steps_id ?? []).at(-1) as string, where).toContain(s.answer)
      s.neededSteps.forEach((step, i) => {
        const line_en = (r.hint_steps_en ?? [])[i + 1]
        const line_id = (r.hint_steps_id ?? [])[i + 1]
        expect(line_en, where).toContain(String(step.value))
        expect(line_id, where).toContain(String(step.value))
        // Every line has to say WHICH square it is talking about.
        expect(line_en, where).toContain(`row ${step.cell.r + 1}, column ${step.cell.c + 1}`)
        expect(line_id, where).toContain(`baris ke-${step.cell.r + 1} kolom ke-${step.cell.c + 1}`)
      })

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

      // The stem must never state a rule the paper does not actually print.
      expect(r.body_en.includes('bold frame'), where).toBe(p.clueSystem === 'cage-op')
      expect(r.body_en.includes('bold 2 by 2 box'), where).toBe(p.clueSystem === 'thick-box')
      expect(r.body_id.includes('Bingkai bergaris tebal'), where).toBe(p.clueSystem === 'cage-op')
      expect(r.body_id.includes('kotak tebal 2 kali 2'), where).toBe(p.clueSystem === 'thick-box')
      for (const op of ['+', '-', 'x'] as const) {
        const glyph = op === '+' ? '5+' : op === '-' ? '2−' : '6×'
        expect(r.body_en.includes(glyph), `${where}: rule for ${op}`).toBe(
          p.cages.some((cage) => cage.op === op),
        )
      }

      // The trap, when there is one, must be genuinely WRONG and wrong in the
      // one way this ask invites: the right digits, the wrong way round.
      const trap = trapAnswer(p, s)
      expect(bd.trap?.wrong ?? null, where).toBe(trap)
      if (trap !== null) {
        seenTraps += 1
        expect(p.ask, where).toBe('letters-number')
        expect(trap, where).not.toBe(s.answer)
        expect(trap, where).toBe([...values].reverse().join(''))
      }

      // ── The figure prints the CLUES and nothing else ─────────────────────
      const svg = renderToStaticMarkup(createElement(LatinSquareCageIllustration, { params: p }))
      expect(svg.startsWith('<div'), where).toBe(true)
      expect(svg.includes('<svg'), where).toBe(true)
      const printed = textNodes(svg).sort()
      const expected = [
        ...p.cages.map((cage) => cageClue(cage)),
        ...p.givens.map((g) => String(p.solution[g.r][g.c])),
        ...p.letters.map((_, i) => LETTERS[i]),
      ].sort()
      expect(printed, `${where}: the figure printed something it should not`).toEqual(expected)

      // …and the aria-label speaks a number for the givens only.
      const aria = (svg.match(/aria-label="([^"]*)"/) as RegExpMatchArray)[1]
      expect((aria.match(/sudah berisi/g) ?? []).length, where).toBe(p.givens.length)
      expect((aria.match(/masih kosong/g) ?? []).length, where).toBe(p.letters.length)

      // ── The storyboard walks the same trail, in both languages ───────────
      for (const lang of ['en', 'id'] as const) {
        const story = buildLatinSquareCageSteps(p, lang)
        const w = `${where} lang=${lang}`
        expect(story.n, w).toBe(p.n)
        expect(story.answer, w).toBe(s.answer)
        // Setup + one beat per needed square + optional trap + result.
        expect(story.steps.length, w).toBe(s.neededSteps.length + (trap ? 3 : 2))
        expect(story.finalIndex, w).toBe(story.steps.length - 1)
        // The frontend re-derives the trail; if it ever drifts from the
        // backend's, the animation would argue for a different square.
        const focused = story.steps
          .filter((b) => b.phase === 'fill')
          .map((b) => {
            const at = b.cells.indexOf('focus')
            return `${Math.floor(at / p.n)},${at % p.n}`
          })
        expect(focused, w).toEqual(s.neededSteps.map((x) => `${x.cell.r},${x.cell.c}`))
        expect(story.steps.at(-1)?.reveal, w).toBe(s.answer)
        for (const beat of story.steps.slice(0, -1)) expect(beat.reveal, w).toBeNull()
        for (const beat of story.steps) {
          expect(beat.caption, w).not.toMatch(/undefined|NaN|\[object/)
          expect(beat.cells.length, w).toBe(p.n * p.n)
          expect(beat.labels.length, w).toBe(p.n * p.n)
        }
        // The opening beat may show the givens and the letters — nothing else.
        const opening = story.steps[0].labels
        const allowedOpening = new Set<string>([
          '',
          ...p.givens.map((g) => String(p.solution[g.r][g.c])),
          ...p.letters.map((_, i) => LETTERS[i]),
        ])
        for (let at = 0; at < opening.length; at++) {
          const cell = { r: Math.floor(at / p.n), c: at % p.n }
          const isGiven = p.givens.some((g) => g.r === cell.r && g.c === cell.c)
          const isLetter = p.letters.some((l) => l.r === cell.r && l.c === cell.c)
          expect(allowedOpening.has(opening[at]), `${w}: beat 1 leaked "${opening[at]}"`).toBe(true)
          if (!isGiven && !isLetter) expect(opening[at], w).toBe('')
        }
        // The bold outlines must cover the whole grid exactly once.
        const outlined = story.cageGroups.flatMap((g) => g.cells.map(([r, c]) => `${r},${c}`))
        expect(new Set(outlined).size, w).toBe(p.n * p.n)
        expect(outlined.length, w).toBe(p.n * p.n)
      }
    }

    expect([...seenAsk].sort()).toEqual(['letters-number', 'letters-sum', 'single-letter'])
    expect(seenShape.has('4-cage-op')).toBe(true)
    expect(seenShape.has('4-thick-box')).toBe(true)
    expect(seenShape.has('5-cage-op')).toBe(true)
    // All four deduction rules must actually earn their place.
    expect([...seenRule].sort()).toEqual([
      'frame-combo',
      'frame-last-square',
      'only-home-in-line',
      'only-number-left',
    ])
    expect(seenTraps).toBeGreaterThan(10)
    expect(seenLongChains).toBeGreaterThan(SEEDS / 4)
  })

  test('the explainer component itself renders in both languages, first beat blank', () => {
    for (const seed of [7, 21, 44]) {
      const p = concept.generate(mulberry32(seed))
      const answer = solve(p).answer
      for (const lang of ['en', 'id'] as const) {
        const story = buildLatinSquareCageSteps(p, lang)
        expect(story.steps.length, `seed ${seed}`).toBeGreaterThanOrEqual(3)
        expect(story.steps[0].caption.length, `seed ${seed}`).toBeGreaterThan(20)
        expect(story.steps.at(-1)?.caption, `seed ${seed}`).toContain(answer)

        // Beat 0 is what a child sees before pressing play: it must be the
        // puzzle as printed, never a square the animation is about to prove.
        const opening = renderToStaticMarkup(
          createElement(LatinSquareCageExplainer, {
            params: p,
            correctAnswer: answer,
            lang,
            step: 0,
          }),
        )
        expect(opening.includes('<svg'), `seed ${seed} ${lang}`).toBe(true)
        expect(opening.includes(answer.length > 1 ? `Answer ${answer}` : 'Answer '), `seed ${seed} ${lang}`).toBe(
          false,
        )
        const inGrid = textNodes(opening).filter((t) => !/^\d+[+−×]$/.test(t))
        const allowed = new Set<string>([
          ...p.givens.map((g) => String(p.solution[g.r][g.c])),
          ...p.letters.map((_, i) => LETTERS[i]),
        ])
        for (const t of inGrid) {
          expect(allowed.has(t), `seed ${seed} ${lang}: beat 1 printed "${t}"`).toBe(true)
        }

        // …and the last beat does show the answer chip.
        const closing = renderToStaticMarkup(
          createElement(LatinSquareCageExplainer, {
            params: p,
            correctAnswer: answer,
            lang,
            step: story.finalIndex,
          }),
        )
        expect(closing.includes(answer), `seed ${seed} ${lang}`).toBe(true)
      }
    }
  })

  test('the schema rejects the shapes that would break the concept', () => {
    expect(() => concept.paramsSchema.parse(FORCED)).not.toThrow()
    // a frame clue that is not true of the solution
    expect(() =>
      concept.paramsSchema.parse({
        ...FORCED,
        cages: [{ ...FORCED.cages[0], target: 5 }, ...FORCED.cages.slice(1)],
      }),
    ).toThrow()
    // frames that do not tile the grid
    expect(() => concept.paramsSchema.parse({ ...FORCED, cages: FORCED.cages.slice(1) })).toThrow()
    // a bent frame, whose numbers would not all have to differ
    expect(() =>
      concept.paramsSchema.parse({
        ...FORCED,
        cages: [
          { cells: [{ r: 0, c: 0 }, { r: 1, c: 1 }], op: '+' as const, target: 2 },
          ...FORCED.cages.slice(1),
        ],
      }),
    ).toThrow()
    // a solution that is not a Latin square
    expect(() =>
      concept.paramsSchema.parse({
        ...FORCED,
        solution: [
          [1, 1, 3, 4],
          [2, 1, 4, 3],
          [3, 4, 1, 2],
          [4, 3, 2, 1],
        ],
      }),
    ).toThrow()
    // thick-box at n = 5 does not exist
    expect(() => concept.paramsSchema.parse({ ...FORCED, clueSystem: 'thick-box' })).toThrow()
    // a lettered square that is also printed in already
    expect(() =>
      concept.paramsSchema.parse({ ...FORCED, letters: [{ r: 0, c: 0 }, { r: 1, c: 2 }] }),
    ).toThrow()
    // single-letter with two letters
    expect(() => concept.paramsSchema.parse({ ...FORCED, ask: 'single-letter' })).toThrow()
    // the puzzle that is not forced
    expect(() => concept.paramsSchema.parse(AMBIGUOUS)).toThrow()
  })
})
