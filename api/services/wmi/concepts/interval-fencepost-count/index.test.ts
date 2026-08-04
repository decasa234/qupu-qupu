import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { compose, gapPairs, solve, type Ends, type Params } from './index.js'

const SEEDS = 320

/**
 * Independent oracle. Instead of the `items - 1` / `items` formula the concept
 * uses, this walks the arrangement one step at a time and tallies the steps —
 * the way a child counts with a finger. On a ring the walk takes one extra step
 * to get home. If the formula and the walk ever disagree, the concept is wrong.
 */
function walkGaps(items: number, ends: Ends): number {
  let gaps = 0
  let at = 1
  while (at < items) {
    gaps += 1
    at += 1
  }
  if (ends === 'closed') gaps += 1 // the step from the last one back to the first
  return gaps
}

/** The answer, recomputed from the problem statement with no shared code. */
function expectedAnswer(p: Params): number {
  const gapSize = p.span / walkGaps(p.count, p.ends)
  if (p.ask === 'gap') return gapSize
  const target = p.target as number
  // Scaling up keeps the arrangement's shape; walking from item 1 to item n is
  // always a straight run of n things, ring or not.
  if (p.ask === 'total-for-m-items') return walkGaps(target, p.ends) * gapSize
  return walkGaps(target, 'open') * gapSize
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

describe('interval-fencepost-count', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(11))).toEqual(concept.generate(mulberry32(11)))
  })

  test('the off-by-one, hand-checked on the classic shapes', () => {
    // 10 lamp posts along a 90 m road: 9 gaps, so 10 m apart — NOT 9.
    const lamps: Params = {
      scenario: 'lamps-on-a-road',
      ends: 'open',
      count: 10,
      span: 90,
      ask: 'gap',
      target: null,
    }
    expect(walkGaps(10, 'open')).toBe(9)
    expect(solve(lamps).value).toBe(10)
    expect(solve(lamps).trap).toBe(9)

    // 8 trees right around a 56 m pond: 8 gaps, so 7 m apart — NOT 8.
    const trees: Params = { scenario: 'trees', ends: 'closed', count: 8, span: 56, ask: 'gap', target: null }
    expect(walkGaps(8, 'closed')).toBe(8)
    expect(solve(trees).value).toBe(7)
    expect(solve(trees).trap).toBe(8)

    // A clock takes 6 s to chime 4 times (3 gaps, 2 s each); 10 chimes take 18 s.
    const chimes: Params = {
      scenario: 'clock-chimes',
      ends: 'open',
      count: 4,
      span: 6,
      ask: 'total-for-m-items',
      target: 10,
    }
    expect(solve(chimes).gapSize).toBe(2)
    expect(solve(chimes).value).toBe(18)
    expect(solve(chimes).trap).toBe(20)

    // From post 1 to post 5 you cross 4 gaps, even on a ring.
    const nth: Params = {
      scenario: 'lamps-on-a-road',
      ends: 'closed',
      count: 8,
      span: 40,
      ask: 'how-long-until-the-nth',
      target: 5,
    }
    expect(solve(nth).gapSize).toBe(5)
    expect(solve(nth).value).toBe(20)
    expect(solve(nth).trap).toBe(25)
  })

  test('gapPairs really lists every gap, and a ring has one more than a line', () => {
    expect(gapPairs(4, 'open')).toEqual([
      [1, 2],
      [2, 3],
      [3, 4],
    ])
    expect(gapPairs(4, 'closed')).toEqual([
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 1],
    ])
    for (let n = 4; n <= 10; n++) {
      expect(gapPairs(n, 'open').length).toBe(n - 1)
      expect(gapPairs(n, 'closed').length).toBe(n)
    }
  })

  test(`${SEEDS} seeds: exact division, both arrangements, clean render`, () => {
    const seenEnds = new Set<string>()
    const seenAsk = new Set<string>()
    const seenScenario = new Set<string>()
    let trapsSeen = 0

    for (let seed = 1; seed <= SEEDS; seed++) {
      const p = concept.generate(mulberry32(seed))
      const where = `seed ${seed} (${JSON.stringify(p)})`
      expect(() => concept.paramsSchema.parse(p), where).not.toThrow()
      seenEnds.add(p.ends)
      seenAsk.add(p.ask)
      seenScenario.add(p.scenario)

      const s = solve(p)

      // ── The rule itself: n - 1 on a line, n on a ring. ────────────────────
      const gaps = walkGaps(p.count, p.ends)
      expect(s.gapCount, where).toBe(gaps)
      if (p.ends === 'open') expect(s.gapCount, where).toBe(p.count - 1)
      else expect(s.gapCount, where).toBe(p.count)
      expect(s.wrongGapCount, where).toBe(p.ends === 'open' ? p.count : p.count - 1)
      expect(Math.abs(s.gapCount - s.wrongGapCount), where).toBe(1)

      // ── Every division comes out whole. ───────────────────────────────────
      expect(p.span % gaps, where).toBe(0)
      expect(Number.isInteger(s.gapSize), where).toBe(true)
      expect(s.gapSize, where).toBeGreaterThanOrEqual(2)
      expect(Number.isInteger(s.value), where).toBe(true)
      expect(s.value, where).toBeGreaterThan(0)

      // ── The answer matches an independent recomputation. ──────────────────
      expect(s.value, where).toBe(expectedAnswer(p))
      expect(s.answer, where).toBe(String(expectedAnswer(p)))

      // Ring scenarios really are rings, and chimes never are.
      if (p.scenario === 'clock-chimes') expect(p.ends, where).toBe('open')

      // ── The trap is the off-by-one, and it is genuinely wrong. ────────────
      if (s.trap !== null) {
        trapsSeen += 1
        expect(Number.isInteger(s.trap), where).toBe(true)
        expect(s.trap, where).not.toBe(s.value)
        expect(Math.abs(s.trapGaps - s.targetGaps), where).toBe(1)
      }

      const r = concept.render(p)
      expect(r.answer, where).toBe(s.answer)
      expect(r.answer_type, where).toBe('fill_in')
      expect(r.choices_en, where).toBeNull()

      const bd = r.breakdown!
      expect(bd.needsVisual, where).toBe(true)
      expect(bd.answer.value, where).toBe(s.answer)
      expect(bd.answer.unit, where).toBe(p.scenario === 'clock-chimes' ? 's' : 'm')
      if (s.trap === null) expect(bd.trap, where).toBeNull()
      else expect(bd.trap!.wrong, where).toBe(String(s.trap))

      // ── Nothing may leak an undefined / NaN onto a child's screen. ────────
      const prose = [
        r.body_en,
        r.body_id,
        r.hint_en ?? '',
        r.hint_id ?? '',
        ...(r.hint_steps_en ?? []),
        ...(r.hint_steps_id ?? []),
        ...bd.highlights.flatMap((h) => [h.phrase_en, h.phrase_id, h.note_en, h.note_id]),
        ...bd.quantities.flatMap((q) => [q.label_en, q.label_id, q.value]),
        bd.trap?.why_en ?? '',
        bd.trap?.why_id ?? '',
        bd.strategy.name_en,
        bd.strategy.name_id,
      ].join(' | ')
      expect(prose, where).not.toMatch(/undefined|NaN|null|\[object/)

      // ── The steps must land on the answer, and name the gap count. ────────
      expect((r.hint_steps_en ?? []).length, where).toBe((r.hint_steps_id ?? []).length)
      expect((r.hint_steps_en ?? []).length, where).toBeGreaterThanOrEqual(3)
      const lastEn = (r.hint_steps_en ?? []).at(-1) as string
      const lastId = (r.hint_steps_id ?? []).at(-1) as string
      expect(lastEn, where).toContain(String(s.value))
      expect(lastId, where).toContain(String(s.value))
      // The gap count is counted out loud, never merely asserted.
      expect((r.hint_steps_en ?? [])[1], where).toContain(String(s.gapCount))
      expect((r.hint_steps_id ?? [])[1], where).toContain(String(s.gapCount))
      // The single division always appears written out, and it is exact.
      const division = `${p.span} : ${s.gapCount} = ${s.gapSize}`
      expect((r.hint_steps_en ?? []).join(' | '), where).toContain(division)
      expect((r.hint_steps_id ?? []).join(' | '), where).toContain(division)

      // ── Breakdown phrases: exact substrings of the DISPLAY body, no overlap.
      const display_en = stripLabels(r.body_en)
      const display_id = stripLabels(r.body_id)
      expect(bd.highlights.length, where).toBe(4)
      for (const h of bd.highlights) {
        expect(display_en, `${where} phrase_en=${h.phrase_en}`).toContain(h.phrase_en)
        expect(display_id, `${where} phrase_id=${h.phrase_id}`).toContain(h.phrase_id)
      }
      expectNoOverlap(
        display_en,
        bd.highlights.map((h) => h.phrase_en),
        where,
      )
      expectNoOverlap(
        display_id,
        bd.highlights.map((h) => h.phrase_id),
        where,
      )
      expect(
        bd.highlights.map((h) => h.category),
        where,
      ).toEqual(['object', 'condition', 'fact', 'question'])

      // The open / closed distinction must be visible in the wording itself.
      const t = compose(p)
      if (p.ends === 'open') {
        expect(display_id, where).toContain(t.endsPhrase_id)
        expect(t.endsPhrase_id.includes('ujung') || t.endsPhrase_id.includes('terakhir'), where).toBe(true)
      } else {
        expect(t.endsPhrase_id.includes('kembali'), where).toBe(true)
      }
    }

    expect([...seenEnds].sort()).toEqual(['closed', 'open'])
    expect([...seenAsk].sort()).toEqual(['gap', 'how-long-until-the-nth', 'total-for-m-items'])
    expect([...seenScenario].sort()).toEqual(['clock-chimes', 'lamps-on-a-road', 'trees'])
    // The whole concept is the off-by-one, so every generated seed carries it.
    expect(trapsSeen).toBe(SEEDS)
  })

  test('the schema rejects the shapes that would break the concept', () => {
    const ok: Params = {
      scenario: 'lamps-on-a-road',
      ends: 'open',
      count: 10,
      span: 90,
      ask: 'gap',
      target: null,
    }
    expect(() => concept.paramsSchema.parse(ok)).not.toThrow()
    // 91 m over 9 gaps would put a lamp 10.1 m along — never a grade-3 answer.
    expect(() => concept.paramsSchema.parse({ ...ok, span: 91 })).toThrow()
    // 90 m over a ring of 8 posts is 11.25 m — rejected for the same reason.
    expect(() => concept.paramsSchema.parse({ ...ok, ends: 'closed', count: 8 })).toThrow()
    // a ring of 10 posts round 90 m is exact, so it is allowed
    expect(() => concept.paramsSchema.parse({ ...ok, ends: 'closed' })).not.toThrow()
    // chimes never form a ring
    expect(() =>
      concept.paramsSchema.parse({ ...ok, scenario: 'clock-chimes', ends: 'closed', span: 100, count: 10 }),
    ).toThrow()
    // the gap ask carries no target; the other two must
    expect(() => concept.paramsSchema.parse({ ...ok, target: 5 })).toThrow()
    expect(() => concept.paramsSchema.parse({ ...ok, ask: 'total-for-m-items', target: null })).toThrow()
    // scaling up must go UP
    expect(() => concept.paramsSchema.parse({ ...ok, ask: 'total-for-m-items', target: 8 })).toThrow()
    expect(() => concept.paramsSchema.parse({ ...ok, ask: 'total-for-m-items', target: 16 })).not.toThrow()
    // the nth item has to be inside the arrangement
    expect(() => concept.paramsSchema.parse({ ...ok, ask: 'how-long-until-the-nth', target: 10 })).toThrow()
    expect(() => concept.paramsSchema.parse({ ...ok, ask: 'how-long-until-the-nth', target: 7 })).not.toThrow()
  })
})
