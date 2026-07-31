import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { concatDigits, middleStart, selectionPicks, solve, trapFor } from './index.js'

const SEEDS = 320

/**
 * Independent oracle: try EVERY subsequence of the right length and keep the
 * extreme one. Written from the definition of the problem ("delete k digits, the
 * rest keep their order"), with no shared code with the generator's greedy.
 * All candidates have the same length, so lexicographic order is numeric order.
 */
function bruteForce(digits: string, keep: number, objective: 'max' | 'min'): string {
  const n = digits.length
  const buf: string[] = []
  let best: string | null = null
  const walk = (from: number): void => {
    if (buf.length === keep) {
      const s = buf.join('')
      if (best === null || (objective === 'max' ? s > best : s < best)) best = s
      return
    }
    for (let i = from; i <= n - (keep - buf.length); i++) {
      buf.push(digits[i])
      walk(i + 1)
      buf.pop()
    }
  }
  walk(0)
  return best as string
}

/** The kept digits must really be readable off the strip, left to right. */
function isSubsequence(sub: string, of: string): boolean {
  let i = 0
  for (const c of of) if (i < sub.length && c === sub[i]) i += 1
  return i === sub.length
}

describe('delete-digits-extremise', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('brute force agrees on the worked examples', () => {
    // 2020-final-g3 #15 shape, but 0-free so the smallest cannot start with 0.
    expect(bruteForce('753375812'.replace(/0/g, '9'), 5, 'min')).toBe(solveRaw('753375812'.replace(/0/g, '9'), 4, 'min'))
    // 2023-final-g3 #24 shape: 1..12 written side by side, keep 5 of 15.
    const strip = concatDigits(12)
    expect(strip).toBe('123456789101112')
    expect(bruteForce(strip, 5, 'max')).toBe('91112')
    expect(solveRaw(strip, 10, 'max')).toBe('91112')
  })

  test(`${SEEDS} seeds: params parse, greedy == brute force, render is clean`, () => {
    const seenAsk = new Set<string>()
    const seenObjective = new Set<string>()
    const seenSource = new Set<string>()

    for (let seed = 1; seed <= SEEDS; seed++) {
      const p = concept.generate(mulberry32(seed))
      const where = `seed ${seed} (${JSON.stringify(p)})`
      expect(() => concept.paramsSchema.parse(p), where).not.toThrow()
      seenAsk.add(p.ask)
      seenObjective.add(p.objective)
      seenSource.add(p.source)

      const s = solve(p)
      const keep = p.digits.length - p.k
      expect(s.keep, where).toBe(keep)
      expect(keep, where).toBeGreaterThanOrEqual(4)

      // The answer is a genuine ORDER-PRESERVING subsequence of the strip …
      expect(s.result.length, where).toBe(keep)
      expect(isSubsequence(s.result, p.digits), where).toBe(true)
      // … and it is the extreme one, checked against an exhaustive search.
      expect(s.result, where).toBe(bruteForce(p.digits, keep, p.objective))

      // Leading-zero policy: min strips are 0-free, and no result ever starts with 0.
      if (p.objective === 'min') expect(p.digits.includes('0'), where).toBe(false)
      expect(s.result[0], where).not.toBe('0')

      // The selection walk that the hints narrate deletes exactly k digits and
      // lands on exactly the same number as the monotonic stack.
      const picks = selectionPicks(p.digits, p.k, p.objective)
      expect(picks.map((x) => x.digit).join(''), where).toBe(s.result)
      const deleted = picks.reduce((sum, x) => sum + x.deleted, 0) + s.tailDeleted
      expect(deleted, where).toBe(p.k)
      let cursor = -1
      for (const pick of picks) {
        expect(pick.index, where).toBeGreaterThan(cursor) // strictly increasing positions
        expect(pick.index, where).toBeGreaterThanOrEqual(pick.from)
        expect(pick.index, where).toBeLessThanOrEqual(pick.to)
        expect(p.digits[pick.index], where).toBe(pick.digit)
        cursor = pick.index
      }
      // Free slots come first, forced slots last (window width = budget + 1).
      expect([...s.choiceSlots, ...s.forcedSlots].map((x) => x.slot), where).toEqual(
        picks.map((x) => x.slot),
      )

      // The trap must be a genuinely WRONG answer, and wrong in the right way.
      const trap = trapFor(p, keep)
      expect(trap.answer, where).not.toBe(s.answer)
      if (p.objective === 'max') expect(trap.number >= s.result, where).toBe(true)
      else expect(trap.number <= s.result, where).toBe(true)

      // The ask decides what the answer actually is.
      if (p.ask === 'the-number') {
        expect(s.answer, where).toBe(s.result)
      } else {
        expect(keep, where).toBe(5)
        expect(middleStart(keep), where).toBe(1)
        expect(s.middle.join(''), where).toBe(s.result.slice(1, 4))
        expect(s.answer, where).toBe(String(s.middle.reduce((a, d) => a + Number(d), 0)))
      }

      // The concat source really is 1..n written side by side.
      if (p.source === 'concat') {
        expect(p.concatTo, where).not.toBeNull()
        expect(p.digits, where).toBe(concatDigits(p.concatTo as number))
      } else {
        expect(p.concatTo, where).toBeNull()
      }

      const r = concept.render(p)
      expect(r.answer, where).toBe(s.answer)
      expect(r.answer_type, where).toBe('fill_in')
      expect(r.choices_en, where).toBeNull()

      // Nothing anywhere may leak an undefined / NaN into a child's screen.
      // Only prose is scanned — `unit: null` in the breakdown is legitimate data.
      const prose = [
        r.body_en,
        r.body_id,
        r.hint_en ?? '',
        r.hint_id ?? '',
        ...(r.hint_steps_en ?? []),
        ...(r.hint_steps_id ?? []),
        ...r.breakdown!.highlights.flatMap((h) => [h.phrase_en, h.phrase_id, h.note_en, h.note_id]),
        ...r.breakdown!.quantities.flatMap((q) => [q.label_en, q.label_id, q.value]),
        r.breakdown!.trap!.why_en,
        r.breakdown!.trap!.why_id,
        r.breakdown!.strategy.name_en,
        r.breakdown!.strategy.name_id,
      ].join(' | ')
      expect(prose, where).not.toMatch(/undefined|NaN|null|\[object/)

      // The steps must end on the answer, not merely mention it.
      const lastEn = (r.hint_steps_en ?? []).at(-1) as string
      const lastId = (r.hint_steps_id ?? []).at(-1) as string
      expect(lastEn, where).toContain(s.answer)
      expect(lastId, where).toContain(s.answer)
      expect((r.hint_steps_en ?? []).length, where).toBe((r.hint_steps_id ?? []).length)

      // Breakdown phrases must be exact substrings of the DISPLAY body in both
      // languages — the display body is the body minus the Find:/Cari: marker.
      const display_en = stripLabels(r.body_en)
      const display_id = stripLabels(r.body_id)
      const bd = r.breakdown!
      expect(bd.answer.value, where).toBe(s.answer)
      expect(bd.needsVisual, where).toBe(false)
      expect(bd.highlights.length, where).toBeGreaterThanOrEqual(4)
      for (const h of bd.highlights) {
        expect(display_en, `${where} phrase_en=${h.phrase_en}`).toContain(h.phrase_en)
        expect(display_id, `${where} phrase_id=${h.phrase_id}`).toContain(h.phrase_id)
      }
      // Phrases must not overlap each other, or the renderer silently drops one.
      expectNoOverlap(display_en, bd.highlights.map((h) => h.phrase_en), where)
      expectNoOverlap(display_id, bd.highlights.map((h) => h.phrase_id), where)
      expect(bd.trap!.wrong, where).toBe(trap.answer)
    }

    expect([...seenAsk].sort()).toEqual(['digit-sum-of-middle-three', 'the-number'])
    expect([...seenObjective].sort()).toEqual(['max', 'min'])
    expect([...seenSource].sort()).toEqual(['concat', 'explicit'])
  })

  test('the schema rejects the shapes that would break the concept', () => {
    const ok = {
      source: 'explicit' as const,
      digits: '738294615',
      concatTo: null,
      k: 4,
      objective: 'max' as const,
      ask: 'the-number' as const,
    }
    expect(() => concept.paramsSchema.parse(ok)).not.toThrow()
    // a min strip containing 0 could strand a leading zero
    expect(() => concept.paramsSchema.parse({ ...ok, objective: 'min', digits: '703294615' })).toThrow()
    // the middle-three ask needs exactly 5 survivors — 9 digits minus 4 is fine …
    expect(() => concept.paramsSchema.parse({ ...ok, ask: 'digit-sum-of-middle-three' })).not.toThrow()
    // … 6 survivors (k = 3) or 4 survivors (k = 5) are not
    expect(() => concept.paramsSchema.parse({ ...ok, ask: 'digit-sum-of-middle-three', k: 3 })).toThrow()
    expect(() => concept.paramsSchema.parse({ ...ok, ask: 'digit-sum-of-middle-three', k: 5 })).toThrow()
    // a concat strip must literally be 1..n
    expect(() => concept.paramsSchema.parse({ ...ok, source: 'concat', concatTo: 12 })).toThrow()
    expect(() =>
      concept.paramsSchema.parse({ source: 'concat', digits: concatDigits(12), concatTo: 12, k: 10, objective: 'max', ask: 'the-number' }),
    ).not.toThrow()
    // too few survivors
    expect(() => concept.paramsSchema.parse({ ...ok, k: 6 })).toThrow()
  })

  test('deleting never reorders: hand-checked strips', () => {
    // Order matters — the sorted digits 9876 are NOT reachable from 1928374.
    expect(solveRaw('1928374', 3, 'max')).toBe('9874')
    expect(bruteForce('1928374', 4, 'max')).toBe('9874')
    // Smallest, no zeros: the greedy must not simply take the four smallest.
    expect(solveRaw('4321987', 3, 'min')).toBe('1987')
    expect(bruteForce('4321987', 4, 'min')).toBe('1987')
  })
})

/** `solve` through a params-shaped object, for the hand-checked cases. */
function solveRaw(digits: string, k: number, objective: 'max' | 'min'): string {
  return solve({
    source: 'explicit',
    digits,
    concatTo: null,
    k,
    objective,
    ask: 'the-number',
  }).result
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
