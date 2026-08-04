import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, {
  LAYOUT_DEFS,
  LAYOUTS,
  NAMES,
  solve,
  tilesExactly,
  trapAnswer,
  type Params,
  type Piece,
} from './index.js'

const SEEDS = 320
/** The oracle searches strictly wider than `generate` draws (2..8). */
const ORACLE_MAX = 10

function pieceArea(p: Params, i: number): number {
  const q = p.pieces[i]
  let w = 0
  for (let c = q.c0; c <= q.c1; c++) w += p.widths[c]
  let h = 0
  for (let r = q.r0; r <= q.r1; r++) h += p.heights[r]
  return w * h
}

function spanValue(p: Params, axis: 'w' | 'h', from: number, to: number): number {
  const track = axis === 'w' ? p.widths : p.heights
  let total = 0
  for (let i = from; i <= to; i++) total += track[i]
  return total
}

/**
 * Independent oracle. Written from the DEFINITION of the puzzle — "every part of
 * the top edge and of the left edge is a whole number of cm, every printed area
 * is that piece's width times its height, and every printed edge length is the
 * sum of the parts it covers" — with no shared code with the forcing solver. It
 * tries every assignment of part lengths in 1..ORACLE_MAX and collects the
 * values the QUESTION would then have.
 *
 * Two different values in that set is the classic bug this concept has to
 * avoid: the child would have to guess, and either guess would be defensible.
 *
 * (`solve` proves more than this: each of its moves derives a value that is the
 * only one consistent with values already derived, so the answer is unique over
 * the positive reals, not just over 1..10. The oracle is the cross-check.)
 */
function targetValuesConsistentWith(p: Params, maxLen = ORACLE_MAX): Set<number> {
  const W = new Array<number>(p.cols).fill(0) // 0 = not yet assigned
  const H = new Array<number>(p.rows).fill(0)
  const sides = p.sideLabels.map((l) => ({ ...l, len: spanValue(p, l.axis, l.from, l.to) }))
  const areas: { q: Piece; area: number }[] = []
  p.areaShown.forEach((on, i) => {
    if (on) areas.push({ q: p.pieces[i], area: pieceArea(p, i) })
  })

  const state = (arr: number[], from: number, to: number) => {
    let sum = 0
    let missing = 0
    for (let i = from; i <= to; i++) {
      if (arr[i] === 0) missing += 1
      else sum += arr[i]
    }
    return { sum, missing }
  }

  const feasible = (): boolean => {
    for (const sd of sides) {
      const arr = sd.axis === 'w' ? W : H
      const { sum, missing } = state(arr, sd.from, sd.to)
      if (missing === 0) {
        if (sum !== sd.len) return false
      } else if (sum + missing > sd.len) return false
    }
    for (const a of areas) {
      const cw = state(W, a.q.c0, a.q.c1)
      const ch = state(H, a.q.r0, a.q.r1)
      if ((cw.sum + cw.missing) * (ch.sum + ch.missing) > a.area) return false
      if ((cw.sum + cw.missing * maxLen) * (ch.sum + ch.missing * maxLen) < a.area) return false
      if (cw.missing === 0 && ch.missing === 0 && cw.sum * ch.sum !== a.area) return false
    }
    return true
  }

  const t = p.pieces[p.target]
  const targetOf = (): number => {
    let w = 0
    for (let c = t.c0; c <= t.c1; c++) w += W[c]
    let h = 0
    for (let r = t.r0; r <= t.r1; r++) h += H[r]
    return p.ask === 'area' ? w * h : p.targetSide === 'width' ? w : h
  }

  const values = new Set<number>()
  const walk = (k: number): void => {
    if (k === p.cols + p.rows) {
      values.add(targetOf())
      return
    }
    const arr = k < p.cols ? W : H
    const at = k < p.cols ? k : k - p.cols
    for (let v = 1; v <= maxLen; v++) {
      arr[at] = v
      if (feasible()) walk(k + 1)
    }
    arr[at] = 0
  }
  walk(0)
  return values
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

describe('rectangle-area-decompose', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(17))).toEqual(concept.generate(mulberry32(17)))
  })

  test('every layout is a real jigsaw of its rectangle', () => {
    for (const name of LAYOUTS) {
      const def = LAYOUT_DEFS[name]
      expect(tilesExactly(def.pieces, def.rows, def.cols), `${name} must tile exactly`).toBe(true)
      // Reading order, so NAMES[i] names pieces[i] on the figure and in the prose.
      const sorted = [...def.pieces].sort((a, b) => a.r0 - b.r0 || a.c0 - b.c0)
      expect(def.pieces, name).toEqual(sorted)
      // Every column and every row is some piece's whole side. That is what
      // makes the top / left rails of the figure readable part by part.
      for (let c = 0; c < def.cols; c++) {
        expect(def.pieces.some((q) => q.c0 === c && q.c1 === c), `${name} column ${c}`).toBe(true)
      }
      for (let r = 0; r < def.rows; r++) {
        expect(def.pieces.some((q) => q.r0 === r && q.r1 === r), `${name} row ${r}`).toBe(true)
      }
    }
  })

  test('the oracle catches a figure the schema must reject as not forced', () => {
    // Areas alone never pin a LENGTH: double every width and halve every height
    // and all four areas survive, so how wide D is stays open. (3, 5, 4, 6 and
    // 6, 10, 2, 3 both fit — D is 5 cm wide in one and 10 cm in the other.)
    const loose: Params = {
      layout: 'quad-4',
      rows: 2,
      cols: 2,
      widths: [3, 5],
      heights: [4, 6],
      pieces: LAYOUT_DEFS['quad-4'].pieces.map((q) => ({ ...q })),
      areaShown: [true, true, true, true],
      sideLabels: [],
      ask: 'side',
      target: 3,
      targetSide: 'width',
    }
    expect(targetValuesConsistentWith(loose)).toEqual(new Set([5, 10]))
    expect(solve(loose).forced).toBe(false)
    expect(() => concept.paramsSchema.parse(loose)).toThrow()

    // Print ONE length and the very same areas force it.
    const forced: Params = { ...loose, sideLabels: [{ axis: 'w', from: 0, to: 0 }] }
    const s = solve(forced)
    expect(s.forced).toBe(true)
    expect(targetValuesConsistentWith(forced)).toEqual(new Set([5]))
    expect(s.answer).toBe('5')
    // Two moves, in this order and no other: the first top part is printed, so
    // A gives the first left part, and only then does B give the second top part.
    expect(s.neededSteps.map((st) => `${st.axis}${st.index}=${st.value}`)).toEqual(['h0=4', 'w1=5'])
    expect(() => concept.paramsSchema.parse(forced)).not.toThrow()
  })

  test('a printed whole edge lets the last part be subtracted out', () => {
    // Strip of three. A's area with the first top part gives the height; B's
    // area then gives the second top part; the whole width gives the third.
    const p: Params = {
      layout: 'strip-3',
      rows: 1,
      cols: 3,
      widths: [3, 4, 5],
      heights: [6],
      pieces: LAYOUT_DEFS['strip-3'].pieces.map((q) => ({ ...q })),
      areaShown: [true, true, false],
      sideLabels: [
        { axis: 'w', from: 0, to: 0 },
        { axis: 'w', from: 0, to: 2 },
      ],
      ask: 'area',
      target: 2,
      targetSide: 'none',
    }
    const s = solve(p)
    expect(s.forced).toBe(true)
    expect(s.neededSteps.map((st) => `${st.rule}:${st.axis}${st.index}=${st.value}`)).toEqual([
      'area:h0=6',
      'area:w1=4',
      'segment:w2=5',
    ])
    expect(s.answer).toBe('30')
    expect(targetValuesConsistentWith(p)).toEqual(new Set([30]))
    expect(() => concept.paramsSchema.parse(p)).not.toThrow()
  })

  test(`${SEEDS} seeds: forced, unique by brute force, and clean to render`, () => {
    const seenLayout = new Set<string>()
    const seenAsk = new Set<string>()
    const seenSide = new Set<string>()
    const seenRules = new Set<string>()
    let seenTraps = 0
    let longChains = 0

    for (let seed = 1; seed <= SEEDS; seed++) {
      const p = concept.generate(mulberry32(seed))
      const where = `seed ${seed} (${JSON.stringify(p)})`
      expect(() => concept.paramsSchema.parse(p), where).not.toThrow()
      seenLayout.add(p.layout)
      seenAsk.add(p.ask)
      seenSide.add(p.targetSide)

      // ── Geometry ────────────────────────────────────────────────────────
      expect(tilesExactly(p.pieces, p.rows, p.cols), `${where}: pieces do not tile`).toBe(true)
      expect(p.widths.length, where).toBe(p.cols)
      expect(p.heights.length, where).toBe(p.rows)
      for (const v of [...p.widths, ...p.heights]) {
        expect(Number.isInteger(v), where).toBe(true)
        expect(v, where).toBeGreaterThanOrEqual(1)
        expect(v, where).toBeLessThanOrEqual(9)
      }
      expect(p.pieces.length, where).toBe(LAYOUT_DEFS[p.layout].pieces.length)
      expect(p.areaShown.length, where).toBe(p.pieces.length)
      expect(p.target, where).toBeLessThan(p.pieces.length)

      // ── The answer is FORCED, and it is the ONLY one ────────────────────
      const s = solve(p)
      expect(s.forced, where).toBe(true)
      expect(
        targetValuesConsistentWith(p),
        `${where}: more than one length assignment fits the printed numbers`,
      ).toEqual(new Set([Number(s.answer)]))
      // Two deductions minimum: a value you can read off is not a puzzle.
      expect(s.neededSteps.length, where).toBeGreaterThanOrEqual(2)
      if (s.neededSteps.length >= 3) longChains += 1

      // Each move is a real deduction: everything it leans on was already known
      // at that moment, and its arithmetic lands on the true length.
      const knownW = new Array<boolean>(p.cols).fill(false)
      const knownH = new Array<boolean>(p.rows).fill(false)
      for (const l of p.sideLabels) {
        if (l.from !== l.to) continue
        if (l.axis === 'w') knownW[l.from] = true
        else knownH[l.from] = true
      }
      for (const st of s.steps) {
        seenRules.add(st.rule)
        const mine = st.axis === 'w' ? knownW : knownH
        const other = st.axis === 'w' ? knownH : knownW
        expect(mine[st.index], `${where}: re-derived a length it already had`).toBe(false)
        for (const part of st.parts) expect(mine[part.index], where).toBe(true)
        for (const part of st.otherParts) expect(other[part.index], where).toBe(true)
        if (st.rule === 'area') {
          expect(p.areaShown[st.pieceIndex], where).toBe(true)
          expect(st.area, where).toBe(pieceArea(p, st.pieceIndex))
          expect(st.otherLen * st.spanTotal, where).toBe(st.area)
        } else {
          expect(
            p.sideLabels.some((l) => l.axis === st.axis && l.from === st.from && l.to === st.to),
            where,
          ).toBe(true)
          expect(st.spanTotal, where).toBe(spanValue(p, st.axis, st.from, st.to))
        }
        expect(st.parts.reduce((rest, k) => rest - k.value, st.spanTotal), where).toBe(st.value)
        expect(st.value, where).toBe((st.axis === 'w' ? p.widths : p.heights)[st.index])
        mine[st.index] = true
      }

      // ── The ask really is what the answer is ────────────────────────────
      const t = p.pieces[p.target]
      const tw = spanValue(p, 'w', t.c0, t.c1)
      const th = spanValue(p, 'h', t.r0, t.r1)
      expect(s.targetWidth, where).toBe(tw)
      expect(s.targetHeight, where).toBe(th)
      if (p.ask === 'area') {
        expect(s.answer, where).toBe(String(tw * th))
        expect(p.areaShown[p.target], `${where}: the target prints its own answer`).toBe(false)
        expect(p.targetSide, where).toBe('none')
      } else {
        expect(s.answer, where).toBe(String(p.targetSide === 'width' ? tw : th))
        // The asked length is never also printed on the rail.
        expect(
          p.sideLabels.some((l) =>
            p.targetSide === 'width'
              ? l.axis === 'w' && l.from === t.c0 && l.to === t.c1
              : l.axis === 'h' && l.from === t.r0 && l.to === t.r1,
          ),
          where,
        ).toBe(false)
      }

      // ── No decoys: every printed number is one the answer spends ────────
      for (let i = 0; i < p.areaShown.length; i++) {
        if (!p.areaShown[i]) continue
        expect(s.neededSteps.some((st) => st.pieceIndex === i), `${where}: area of ${NAMES[i]} unused`).toBe(true)
      }
      for (const l of p.sideLabels) {
        const used =
          l.from === l.to
            ? s.neededKeys.includes(`${l.axis}${l.from}`)
            : s.neededSteps.some(
                (st) => st.rule === 'segment' && st.axis === l.axis && st.from === l.from && st.to === l.to,
              )
        expect(used, `${where}: printed length ${l.axis}${l.from}-${l.to} unused`).toBe(true)
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

      // Steps must END on the answer, and every length must be DERIVED in a
      // line before the closing line uses it.
      expect((r.hint_steps_en ?? []).length, where).toBe((r.hint_steps_id ?? []).length)
      expect((r.hint_steps_en ?? []).length, where).toBe(s.neededSteps.length + 2)
      expect((r.hint_steps_en ?? []).at(-1) as string, where).toContain(s.answer)
      expect((r.hint_steps_id ?? []).at(-1) as string, where).toContain(s.answer)
      s.neededSteps.forEach((st, i) => {
        expect((r.hint_steps_en ?? [])[i + 1], where).toContain(`= ${st.value} cm`)
        expect((r.hint_steps_id ?? [])[i + 1], where).toContain(`= ${st.value} cm`)
        expect((r.hint_steps_en ?? [])[i + 1], where).toContain(String(st.spanTotal))
        expect((r.hint_steps_id ?? [])[i + 1], where).toContain(String(st.spanTotal))
      })

      // ── Breakdown ───────────────────────────────────────────────────────
      const display_en = stripLabels(r.body_en)
      const display_id = stripLabels(r.body_id)
      expect(bd.needsVisual, where).toBe(true)
      expect(bd.answer.value, where).toBe(s.answer)
      expect(bd.answer.unit, where).toBe(p.ask === 'area' ? 'cm²' : 'cm')
      expect(bd.highlights.length, where).toBeGreaterThanOrEqual(5)
      for (const h of bd.highlights) {
        expect(display_en, `${where} phrase_en=${h.phrase_en}`).toContain(h.phrase_en)
        expect(display_id, `${where} phrase_id=${h.phrase_id}`).toContain(h.phrase_id)
      }
      expectNoOverlap(display_en, bd.highlights.map((h) => h.phrase_en), where)
      expectNoOverlap(display_id, bd.highlights.map((h) => h.phrase_id), where)

      // The trap, when there is one, must be genuinely WRONG and wrong in the
      // one way this ask invites: adding the sides instead of multiplying.
      const trap = trapAnswer(p, s)
      expect(bd.trap?.wrong ?? null, where).toBe(trap)
      if (trap !== null) {
        seenTraps += 1
        expect(p.ask, where).toBe('area')
        expect(trap, where).not.toBe(s.answer)
        expect(trap, where).toBe(String(tw + th))
      }
    }

    expect([...seenAsk].sort()).toEqual(['area', 'side'])
    expect([...seenSide].sort()).toEqual(['height', 'none', 'width'])
    expect([...seenRules].sort()).toEqual(['area', 'segment'])
    expect(seenLayout.size).toBeGreaterThanOrEqual(5)
    expect(seenTraps).toBeGreaterThan(20)
    expect(longChains).toBeGreaterThan(SEEDS / 4)
  })

  test('the schema rejects the shapes that would break the concept', () => {
    const ok: Params = {
      layout: 'quad-4',
      rows: 2,
      cols: 2,
      widths: [3, 5],
      heights: [4, 6],
      pieces: LAYOUT_DEFS['quad-4'].pieces.map((q) => ({ ...q })),
      areaShown: [true, true, true, false],
      sideLabels: [{ axis: 'w', from: 0, to: 0 }],
      ask: 'area',
      target: 3,
      targetSide: 'none',
    }
    expect(() => concept.paramsSchema.parse(ok)).not.toThrow()
    // no printed length at all → the figure only fixes ratios, not lengths
    expect(() => concept.paramsSchema.parse({ ...ok, sideLabels: [] })).toThrow()
    // the target printing its own area
    expect(() => concept.paramsSchema.parse({ ...ok, areaShown: [true, true, true, true] })).toThrow()
    // an area ask must not name a side
    expect(() => concept.paramsSchema.parse({ ...ok, targetSide: 'width' })).toThrow()
    // a side ask that prints the very length it asks for
    expect(() =>
      concept.paramsSchema.parse({
        ...ok,
        ask: 'side',
        target: 0,
        targetSide: 'width',
        areaShown: [true, true, true, true],
      }),
    ).toThrow()
    // pieces that leave a hole
    expect(() =>
      concept.paramsSchema.parse({ ...ok, pieces: ok.pieces.slice(0, 3), areaShown: [true, true, true] }),
    ).toThrow()
    // pieces that overlap
    expect(() =>
      concept.paramsSchema.parse({
        ...ok,
        pieces: [
          { r0: 0, c0: 0, r1: 1, c1: 1 },
          { r0: 0, c0: 1, r1: 0, c1: 1 },
          { r0: 1, c0: 0, r1: 1, c1: 0 },
          { r0: 1, c0: 1, r1: 1, c1: 1 },
        ],
      }),
    ).toThrow()
    // the declared shape not matching the layout
    expect(() => concept.paramsSchema.parse({ ...ok, cols: 3 })).toThrow()
    // one deduction only: both of D's sides handed over directly
    expect(() =>
      concept.paramsSchema.parse({
        ...ok,
        areaShown: [false, false, false, false],
        sideLabels: [
          { axis: 'w', from: 1, to: 1 },
          { axis: 'h', from: 1, to: 1 },
        ],
      }),
    ).toThrow()
    // a target that points past the pieces
    expect(() => concept.paramsSchema.parse({ ...ok, target: 4 })).toThrow()
  })
})
