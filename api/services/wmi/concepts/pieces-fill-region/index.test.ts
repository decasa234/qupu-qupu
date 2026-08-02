import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, {
  ASKS,
  CATALOG,
  FALLBACKS,
  OPTION_LABELS,
  REGION_KINDS,
  derive,
  isChiral,
  longestRun,
  type Ask,
  type Cell,
  type Params,
  type RegionKind,
} from './index.js'

const SEEDS = 340

const at = (cell: readonly number[]): string => `${cell[0]},${cell[1]}`

/**
 * Independent oracle — every way to lay `pieces` into `hole` using TURNS ONLY.
 * Deliberately written the naive way: spin each piece four times, then try it at
 * every translation in a generous window. It shares no code with the concept's
 * own `tiles()` (which prunes by always covering the topmost-leftmost gap
 * first), so a bug in that pruning cannot hide here.
 */
type LooseCells = readonly (readonly number[])[]

function canTile(holeRaw: LooseCells, piecesRaw: readonly LooseCells[], allowFlips = false): boolean {
  const hole: Cell[] = holeRaw.map(([r, c]) => [r, c] as Cell)
  const pieces: Cell[][] = piecesRaw.map((piece) => piece.map(([r, c]) => [r, c] as Cell))
  if (pieces.reduce((sum, p) => sum + p.length, 0) !== hole.length) return false

  const anchorAt = (cells: Cell[]): Cell[] => {
    const minR = Math.min(...cells.map((c) => c[0]))
    const minC = Math.min(...cells.map((c) => c[1]))
    return cells.map(([r, c]) => [r - minR, c - minC] as Cell)
  }
  const orientations = (piece: readonly Cell[]): Cell[][] => {
    const seeds: Cell[][] = allowFlips
      ? [piece.map(([r, c]) => [r, c] as Cell), piece.map(([r, c]) => [r, -c] as Cell)]
      : [piece.map(([r, c]) => [r, c] as Cell)]
    const seen = new Set<string>()
    const out: Cell[][] = []
    for (const seed of seeds) {
      let cur = seed
      for (let spin = 0; spin < 4; spin++) {
        const fixed = anchorAt(cur).sort((a, b) => a[0] - b[0] || a[1] - b[1])
        const k = fixed.map(at).join(' ')
        if (!seen.has(k)) {
          seen.add(k)
          out.push(fixed)
        }
        cur = cur.map(([r, c]) => [c, -r] as Cell)
      }
    }
    return out
  }

  const walk = (remaining: Set<string>, index: number): boolean => {
    if (index === pieces.length) return remaining.size === 0
    for (const turn of orientations(pieces[index])) {
      for (let dr = -8; dr <= 8; dr++) {
        for (let dc = -8; dc <= 8; dc++) {
          const laid = turn.map(([r, c]) => at([r + dr, c + dc]))
          if (!laid.every((k) => remaining.has(k))) continue
          const next = new Set(remaining)
          for (const k of laid) next.delete(k)
          if (walk(next, index + 1)) return true
        }
      }
    }
    return false
  }
  return walk(new Set(hole.map(at)), 0)
}

/** Which options fill the hole, found by the oracle rather than by the concept. */
function winners(p: Params, allowFlips = false): number[] {
  const out: number[] = []
  p.options.forEach((option, i) => {
    if (canTile(p.hole, option, allowFlips)) out.push(i)
  })
  return out
}

describe('pieces-fill-region', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(23))).toEqual(concept.generate(mulberry32(23)))
  })

  test('the catalogue really contains the shapes the generator assumes', () => {
    // Winners must be chiral or the "mirror" option would be a second right
    // answer, and every winner size needs a longer-lined stand-in to exist.
    const chiral = CATALOG.filter((p) => p.length >= 4 && p.length <= 5 && isChiral(p))
    expect(chiral.length).toBeGreaterThanOrEqual(6)
    for (const w of chiral) {
      const stand = CATALOG.filter((p) => p.length === w.length && longestRun(p) > longestRun(w))
      expect(stand.length, `no longer-lined ${w.length}-square stand-in for ${JSON.stringify(w)}`).toBeGreaterThan(0)
    }
    // A shape and its mirror always agree on the two things the steps compare.
    for (const p of CATALOG) {
      const mirrored = p.map(([r, c]) => [r, -c] as Cell)
      expect(longestRun(mirrored)).toBe(longestRun(p))
      expect(mirrored.length).toBe(p.length)
    }
  })

  test('every fallback board is legal and has exactly one filling option', () => {
    for (const ask of ASKS) {
      const p = FALLBACKS[ask]
      expect(() => concept.paramsSchema.parse(p), ask).not.toThrow()
      expect(p.ask, ask).toBe(ask)
      expect(winners(p), ask).toEqual([p.answerIndex])
    }
  })

  test(`${SEEDS} seeds: exactly one option fills the hole by turning alone`, () => {
    const seenAsk = new Set<Ask>()
    const seenKind = new Set<RegionKind>()
    const seenReason = new Set<string>()

    for (let seed = 1; seed <= SEEDS; seed++) {
      const p: Params = concept.generate(mulberry32(seed))
      const where = `seed ${seed} (${JSON.stringify(p)})`
      expect(() => concept.paramsSchema.parse(p), where).not.toThrow()
      seenAsk.add(p.ask)
      seenKind.add(p.regionKind)

      const d = derive(p)
      const r = concept.render(p)
      expect(r.answer_type, where).toBe('multiple_choice')
      expect(r.answer, where).toBe(d.answer)
      expect(r.answer, where).toBe(OPTION_LABELS[p.answerIndex])

      // ── the fairness gate, re-checked by the independent oracle ───────────
      expect(winners(p), where).toEqual([p.answerIndex])
      // …and the same hole is fillable once flips are allowed for the mirror
      // option — proof that it is excluded by the no-flip rule, not by luck.
      const flipLoser = d.flipLoser
      expect(flipLoser, where).not.toBeNull()
      expect(canTile(p.hole, flipLoser!.pieces, true), `${where}: mirror option is not a mirror`).toBe(true)
      expect(canTile(p.hole, flipLoser!.pieces, false), `${where}: mirror option fits without a flip`).toBe(false)

      // The hole and the winning option must carry exactly the same squares.
      expect(d.winner.squares, where).toBe(p.hole.length)
      expect(p.hole.length, where).toBeGreaterThanOrEqual(4)
      expect(p.region.length, where).toBeGreaterThan(p.hole.length)
      expect(p.region.length, where).toBeLessThanOrEqual(16)

      // Four options, one piece each (or two for the pair ask), all different.
      expect(p.options.length, where).toBe(4)
      const wanted = p.ask === 'pair-of-pieces' ? 2 : 1
      for (const option of p.options) {
        expect(option.length, where).toBe(wanted)
        for (const piece of option) {
          expect(piece.length, where).toBeGreaterThanOrEqual(2)
          expect(piece.length, where).toBeLessThanOrEqual(6)
        }
      }

      // Every hole square is a board square, and the board wraps around it.
      const board = new Set(p.region.map(at))
      expect(p.hole.every((c) => board.has(at(c))), where).toBe(true)

      // ── the three wrong options die three different, concrete deaths ──────
      const reasons = d.options.filter((o) => !o.fits).map((o) => o.reason)
      expect(new Set(reasons).size, where).toBe(3)
      reasons.forEach((x) => seenReason.add(String(x)))
      expect(d.countLoser!.squares, where).not.toBe(p.hole.length)
      expect(d.runLoser!.squares, where).toBe(p.hole.length)
      expect(d.runLoser!.run, where).toBeGreaterThan(d.holeRun)
      expect(flipLoser!.squares, where).toBe(p.hole.length)
      expect(flipLoser!.run, where).toBeLessThanOrEqual(d.holeRun)

      // ── nothing anywhere may leak an undefined / NaN onto a child's screen ─
      const bd = r.breakdown!
      expect(bd, where).toBeTruthy()
      expect(bd.answer.value, where).toBe(r.answer)
      expect(bd.answer.form, where).toBe('choice')
      expect(bd.needsVisual, where).toBe(true)
      expect(bd.trap, where).not.toBeNull()
      expect(bd.trap!.wrong, where).toBe(flipLoser!.label)
      expect(bd.trap!.wrong, where).not.toBe(r.answer)

      const prose = [
        r.body_en,
        r.body_id,
        r.hint_en ?? '',
        r.hint_id ?? '',
        ...(r.hint_steps_en ?? []),
        ...(r.hint_steps_id ?? []),
        ...(r.choices_en ?? []).map((c) => c.text),
        ...(r.choices_id ?? []).map((c) => c.text),
        ...bd.highlights.flatMap((h) => [h.phrase_en, h.phrase_id, h.note_en, h.note_id]),
        ...bd.quantities.flatMap((q) => [q.label_en, q.label_id, q.value]),
        bd.trap!.why_en,
        bd.trap!.why_id,
        bd.strategy.name_en,
        bd.strategy.name_id,
        r.answer,
      ].join(' | ')
      expect(prose, where).not.toMatch(/undefined|NaN|null|\[object/)

      // The choices are the four labels, never revealing which one fits.
      expect(r.choices_en!.map((c) => c.label), where).toEqual([...OPTION_LABELS])
      expect(r.choices_id!.map((c) => c.label), where).toEqual([...OPTION_LABELS])
      expect(new Set(r.choices_en!.map((c) => c.text)).size, where).toBeGreaterThan(1)

      // The steps must END on the answer, having ruled the others out first.
      const stepsEn = r.hint_steps_en ?? []
      const stepsId = r.hint_steps_id ?? []
      expect(stepsEn.length, where).toBe(4)
      expect(stepsId.length, where).toBe(4)
      expect(stepsEn.at(-1), where).toContain(`the answer is ${r.answer}`)
      expect(stepsId.at(-1), where).toContain(`jawabannya ${r.answer}`)
      // Each of the first three steps names the option it kills, and the
      // concrete number that kills it — never a bare "it does not fit".
      for (const steps of [stepsEn, stepsId]) {
        expect(steps[0], where).toContain(d.countLoser!.label)
        expect(steps[0], where).toContain(String(d.countLoser!.squares))
        expect(steps[1], where).toContain(d.runLoser!.label)
        expect(steps[1], where).toContain(String(d.runLoser!.run))
        expect(steps[2], where).toContain(flipLoser!.label)
        expect(steps.join(' '), where).not.toContain('—  ')
      }

      // ── breakdown phrases are exact, non-overlapping spans of the body ─────
      const display_en = stripLabels(r.body_en)
      const display_id = stripLabels(r.body_id)
      expect(bd.highlights.length, where).toBeGreaterThanOrEqual(4)
      expect(bd.highlights.some((h) => h.category === 'question'), where).toBe(true)
      for (const h of bd.highlights) {
        expect(display_en, `${where} phrase_en=${h.phrase_en}`).toContain(h.phrase_en)
        expect(display_id, `${where} phrase_id=${h.phrase_id}`).toContain(h.phrase_id)
      }
      expectNoOverlap(display_en, bd.highlights.map((h) => h.phrase_en), where)
      expectNoOverlap(display_id, bd.highlights.map((h) => h.phrase_id), where)
      expect(bd.strategy.conceptSlug, where).toBe('pieces-fill-region')
    }

    expect([...seenAsk].sort()).toEqual([...ASKS].sort())
    expect([...seenReason].sort()).toEqual(['count', 'flip', 'run'])
    // Every board silhouette the stem can name must actually turn up.
    expect([...seenKind].sort()).toEqual([...REGION_KINDS].sort())
  })

  test('the schema rejects the shapes that would break the concept', () => {
    const ok = FALLBACKS['single-piece']
    expect(() => concept.paramsSchema.parse(ok)).not.toThrow()

    // The mirrored L is offered as the answer — it needs a flip, so it is not one.
    expect(() => concept.paramsSchema.parse({ ...ok, answerIndex: 2 })).toThrow()

    // Two options that fill the hole: the winner offered twice, once turned.
    const twice = {
      ...ok,
      options: [ok.options[0], ok.options[1], [[[0, 2], [1, 0], [1, 1], [1, 2]]], ok.options[3]],
    }
    expect(canTile(twice.hole, twice.options[2])).toBe(true)
    expect(() => concept.paramsSchema.parse(twice)).toThrow()

    // A hole square that is not on the board.
    expect(() =>
      concept.paramsSchema.parse({ ...ok, hole: [[0, 0], [1, 0], [2, 0], [3, 0]] }),
    ).toThrow()

    // A board with no tiled square left around the hole.
    expect(() => concept.paramsSchema.parse({ ...ok, region: ok.hole })).toThrow()

    // A hole in two separate scraps is not one hole.
    expect(() =>
      concept.paramsSchema.parse({ ...ok, hole: [[0, 0], [1, 0], [2, 2], [2, 1]] }),
    ).toThrow()

    // A board called "square" that is not one.
    expect(() => concept.paramsSchema.parse({ ...ok, regionKind: 'ell' })).toThrow()

    // Two identical options (the same piece drawn twice, one of them turned).
    expect(() =>
      concept.paramsSchema.parse({
        ...ok,
        options: [ok.options[3], ok.options[1], ok.options[2], ok.options[3]],
        answerIndex: 3,
      }),
    ).toThrow()

    // The pair ask must offer two pieces per option, never one.
    const pair = FALLBACKS['pair-of-pieces']
    expect(() => concept.paramsSchema.parse(pair)).not.toThrow()
    expect(() =>
      concept.paramsSchema.parse({ ...pair, options: pair.options.map((o) => [o[0]]) }),
    ).toThrow()
  })

  test('hand-checked boards', () => {
    // 3×3 board, hole = the left column plus one square at the bottom right of
    // it. Only the already-turned J piece (D) drops in; C is its mirror.
    const d = derive(FALLBACKS['single-piece'])
    expect(d.n).toBe(4)
    expect(d.holeRun).toBe(3)
    expect(d.answer).toBe('D')
    expect(d.countLoser!.label).toBe('A')
    expect(d.countLoser!.squares).toBe(3)
    expect(d.runLoser!.label).toBe('B')
    expect(d.runLoser!.run).toBe(4)
    expect(d.flipLoser!.label).toBe('C')
    // Turning D by hand: a half turn lays it straight into the hole.
    expect(d.turnsToSeat).toBe(2)

    // The pair board: a domino plus an S-piece cover the 6-square hole.
    const p = derive(FALLBACKS['pair-of-pieces'])
    expect(p.n).toBe(6)
    expect(p.answer).toBe('C')
    expect(p.winner.split).toBe('2 + 4')
    expect(p.countLoser!.squares).toBe(7)
    expect(p.runLoser!.run).toBe(4)
    expect(p.flipLoser!.label).toBe('D')
  })
})

/** Mirrors src/lib/wmiBreakdown stripSectionLabels for the two labels we emit. */
function stripLabels(text: string): string {
  return text.replace(/\b(Find|Cari):\s*/g, '').replace(/\s{2,}/g, ' ').trim()
}

function expectNoOverlap(text: string, phrases: string[], where: string): void {
  const spans = phrases.map((phrase) => {
    const start = text.indexOf(phrase)
    return { phrase, start, end: start + phrase.length }
  })
  spans.sort((a, b) => a.start - b.start)
  for (let i = 1; i < spans.length; i++) {
    expect(
      spans[i].start >= spans[i - 1].end,
      `${where}: "${spans[i - 1].phrase}" overlaps "${spans[i].phrase}"`,
    ).toBe(true)
  }
}
