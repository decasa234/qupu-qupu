import { describe, test, expect } from 'vitest'
import { stripSectionLabels } from '../../../../../src/lib/wmiBreakdown'
import { parseWmiMarkup } from '../../../../../src/lib/wmiMarkup'
import { mulberry32 } from '../rng.js'
import concept, { ASKS, FILTER_KINDS, generate, solve, type Filter, type Params } from './index.js'

const SEEDS = 400

// The text a child actually sees: section labels removed, glossary markup
// resolved, whitespace collapsed — exactly what WmiAuthoredBreakdown matches
// highlight phrases against. A phrase that is not found here silently renders
// as plain grey text, so this is the only body worth asserting on.
function display(text: string): string {
  return parseWmiMarkup(stripSectionLabels(text))
    .map((s) => s.text)
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
}

// ── An enumeration written from scratch, on purpose. It walks the NUMERIC range
// 10…99 / 100…999 instead of building digit tuples, so it can never inherit a
// leading-zero bug from the generator's walker: a number in that range simply
// cannot start with 0. The rule test is re-implemented too, not imported.
function ruleOk(f: Filter, ds: number[], n: number): boolean {
  if (f.kind === 'even') return n % 2 === 0
  if (f.kind === 'odd') return n % 2 !== 0
  if (f.kind === 'div-by') return n % f.m === 0
  if (f.kind === 'in-range') return f.lo <= n && n <= f.hi
  if (f.kind === 'first-bigger') return ds[0] > ds[ds.length - 1]
  return ds.reduce((a, b) => a + b, 0) === f.v
}

function bruteForce(p: Params): number[] {
  const min = 10 ** (p.length - 1)
  const max = 10 ** p.length
  const out: number[] = []
  for (let n = min; n < max; n++) {
    const ds = String(n).split('').map(Number)
    if (!ds.every((d) => p.digits.includes(d))) continue
    if (!p.repeats && new Set(ds).size !== ds.length) continue
    if (!ruleOk(p.filter, ds, n)) continue
    out.push(n)
  }
  return out
}

/** The same walk but with the leading-zero rule switched OFF — the classic bug. */
function bruteForceAllowingLeadingZero(p: Params): string[] {
  const out: string[] = []
  const walk = (prefix: number[], left: number[]) => {
    if (prefix.length === p.length) {
      const n = Number(prefix.join(''))
      if (ruleOk(p.filter, prefix, n)) out.push(prefix.join(''))
      return
    }
    for (const d of p.digits) {
      if (!p.repeats && !left.includes(d)) continue
      walk([...prefix, d], p.repeats ? left : left.filter((x) => x !== d))
    }
  }
  walk([], [...p.digits])
  return out.sort()
}

function expectedAnswer(p: Params, list: number[]): string {
  if (p.ask === 'how-many') return String(list.length)
  if (p.ask === 'the-nth') {
    return String(p.from === 'smallest' ? list[p.nth - 1] : list[list.length - p.nth])
  }
  return String(list[list.length - p.mth] - list[p.nth - 1])
}

const generated: Params[] = []
for (let seed = 1; seed <= SEEDS; seed++) generated.push(generate(mulberry32(seed)))

describe('count-numbers-from-digits — generate', () => {
  test('deterministic for a given seed', () => {
    expect(generate(mulberry32(23))).toEqual(generate(mulberry32(23)))
  })

  test(`${SEEDS} seeds: every params object parses, and every ask + filter is reachable`, () => {
    const asks = new Set<string>()
    const kinds = new Set<string>()
    for (const p of generated) {
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      asks.add(p.ask)
      kinds.add(p.filter.kind)
    }
    expect(asks).toEqual(new Set(ASKS))
    expect(kinds).toEqual(new Set(FILTER_KINDS))
  })

  test('the pool is always distinct, sorted, and usable', () => {
    for (const p of generated) {
      expect(new Set(p.digits).size).toBe(p.digits.length)
      expect([...p.digits].sort((a, b) => a - b)).toEqual(p.digits)
      expect(p.digits.some((d) => d !== 0)).toBe(true)
      if (!p.repeats) expect(p.digits.length).toBeGreaterThanOrEqual(p.length)
      if (p.filter.kind === 'in-range') expect(p.filter.lo).toBeLessThanOrEqual(p.filter.hi)
    }
  })

  test('pools with a 0 in them do occur — the leading-zero rule must be exercised', () => {
    expect(generated.filter((p) => p.digits.includes(0)).length).toBeGreaterThan(10)
  })

  test('the qualifying set is always countable by hand, and the rule always bites', () => {
    for (const p of generated) {
      const list = bruteForce(p)
      expect(list.length).toBeGreaterThanOrEqual(3)
      expect(list.length).toBeLessThanOrEqual(p.ask === 'how-many' ? 30 : 12)
      // A rule that keeps every arrangement would make the problem a formality.
      expect(list.length).toBeLessThan(solve(p).all.length)
      if (p.ask === 'the-nth') expect(p.nth).toBeLessThanOrEqual(list.length)
      if (p.ask === 'gap-between-nth-and-mth') expect(p.nth + p.mth).toBeLessThanOrEqual(list.length)
    }
  })
})

describe('count-numbers-from-digits — the answer', () => {
  test(`${SEEDS} seeds: the answer equals an independent brute-force enumeration`, () => {
    for (const p of generated) {
      const list = bruteForce(p)
      expect(concept.render(p).answer).toBe(expectedAnswer(p, list))
    }
  })

  test('the generator agrees with the brute force on the whole set, not just its size', () => {
    for (const p of generated) {
      expect(solve(p).set).toEqual(bruteForce(p))
    }
  })

  test('no counted number ever starts with 0, and the over-count is really excluded', () => {
    let sawDifference = 0
    for (const p of generated) {
      const sol = solve(p)
      for (const n of sol.set) expect(String(n)[0]).not.toBe('0')
      expect(String(n0(sol.set))).not.toMatch(/^0/)

      const naive = bruteForceAllowingLeadingZero(p)
      const illegal = naive.filter((s) => s.startsWith('0'))
      // The generator must have thrown away exactly the illegal strings.
      expect(sol.set.length).toBe(naive.length - illegal.length)
      expect(sol.phantoms).toEqual(illegal)
      if (illegal.length > 0) sawDifference++
    }
    // If this never fired, the leading-zero path would be untested.
    expect(sawDifference).toBeGreaterThan(5)
  })

  test('worked example: 5, 6, 7, 8 -> 3-digit even numbers, no repeats -> 12 (WMI 2019 SF G3 #18)', () => {
    const p: Params = {
      digits: [5, 6, 7, 8],
      length: 3,
      repeats: false,
      filter: { kind: 'even' },
      ask: 'how-many',
      from: 'smallest',
      nth: 1,
      mth: 1,
    }
    expect(() => concept.paramsSchema.parse(p)).not.toThrow()
    expect(concept.render(p).answer).toBe('12')
    expect(solve(p).all.length).toBe(24)
  })

  test('worked example: a pool WITH 0 drops the leading-zero arrangements', () => {
    const p: Params = {
      digits: [0, 1, 2],
      length: 2,
      repeats: false,
      filter: { kind: 'even' },
      ask: 'how-many',
      from: 'smallest',
      nth: 1,
      mth: 1,
    }
    const sol = solve(p)
    // 10, 12, 20 are even 2-digit numbers; "02" is even but is not 2-digit.
    expect(sol.set).toEqual([10, 12, 20])
    expect(sol.all).toEqual([10, 12, 20, 21])
    expect(sol.phantoms).toEqual(['02'])
    expect(concept.render(p).answer).toBe('3')
    expect(sol.trap).toEqual({ kind: 'leading-zero', wrong: '4' })
  })
})

describe('count-numbers-from-digits — render', () => {
  test(`${SEEDS} seeds: nothing renders as undefined / NaN`, () => {
    for (const p of generated) {
      const r = concept.render(p)
      const blobs = [
        r.body_id,
        r.body_en,
        r.answer,
        r.hint_id ?? '',
        r.hint_en ?? '',
        ...(r.hint_steps_id ?? []),
        ...(r.hint_steps_en ?? []),
        JSON.stringify(r.breakdown),
      ]
      for (const s of blobs) {
        expect(s).toBeTruthy()
        expect(s).not.toMatch(/undefined|NaN|\[object Object\]/)
      }
      expect(r.hint_steps_id).toHaveLength(3)
      expect(r.hint_steps_en).toHaveLength(3)
      expect(r.answer_type).toBe('fill_in')
      expect(r.choices_id).toBeNull()
      expect(r.choices_en).toBeNull()
      // Kids type this into a free-text box.
      expect(r.answer).toMatch(/^\d+$/)
    }
  })

  test('the hint steps always teach the no-zero-in-front rule and land on the answer', () => {
    for (const p of generated) {
      const r = concept.render(p)
      const id = r.hint_steps_id as string[]
      const en = r.hint_steps_en as string[]
      expect(id[0]).toContain('tempat pertama tidak boleh diisi 0')
      expect(en[0]).toContain('the first place can never hold 0')
      // The last line must actually produce the answer — as the result of a sum,
      // a subtraction, or a position counted out loud — not merely mention it.
      expect(id[2]).toMatch(new RegExp(`(= |adalah )${r.answer}\\b`))
      expect(en[2]).toMatch(new RegExp(`(= |is )${r.answer}\\b`))
      expect(id[1].length).toBeGreaterThan(20)
      expect(en[1].length).toBeGreaterThan(20)
    }
  })

  test('the how-many branch counts really sum to the answer', () => {
    const rows = generated.filter((p) => p.ask === 'how-many')
    expect(rows.length).toBeGreaterThan(0)
    for (const p of rows) {
      const sol = solve(p)
      const total = sol.branches.reduce((a, b) => a + b.values.length, 0)
      expect(String(total)).toBe(sol.answer)
      // Every branch is a real slice of the set, keyed by its leading digit.
      expect(sol.branches.flatMap((b) => b.values).sort((a, b) => a - b)).toEqual(sol.set)
      for (const b of sol.branches) {
        expect(b.d).not.toBe(0)
        for (const v of b.values) expect(String(v)[0]).toBe(String(b.d))
      }
    }
  })
})

describe('count-numbers-from-digits — breakdown', () => {
  test('every phrase is an exact substring of the displayed body, in both languages', () => {
    for (const p of generated) {
      const r = concept.render(p)
      const bodyId = display(r.body_id)
      const bodyEn = display(r.body_en)
      const bd = r.breakdown
      expect(bd).toBeTruthy()
      for (const h of bd!.highlights) {
        expect(h.phrase_id.length).toBeGreaterThan(0)
        expect(h.phrase_en.length).toBeGreaterThan(0)
        expect(
          bodyId.includes(h.phrase_id),
          `ask=${p.ask} filter=${p.filter.kind}\nphrase_id: ${h.phrase_id}\nbody_id:   ${bodyId}`,
        ).toBe(true)
        expect(
          bodyEn.includes(h.phrase_en),
          `ask=${p.ask} filter=${p.filter.kind}\nphrase_en: ${h.phrase_en}\nbody_en:   ${bodyEn}`,
        ).toBe(true)
        expect(h.note_id).not.toMatch(/undefined|NaN/)
        expect(h.note_en).not.toMatch(/undefined|NaN/)
      }
    }
  })

  test('no two phrases overlap, so every highlight really gets rendered', () => {
    for (const p of generated) {
      const r = concept.render(p)
      for (const lang of ['id', 'en'] as const) {
        const body = display(lang === 'id' ? r.body_id : r.body_en)
        const spans = r
          .breakdown!.highlights.map((h) => (lang === 'id' ? h.phrase_id : h.phrase_en))
          .map((phrase) => ({ phrase, at: body.indexOf(phrase) }))
          .sort((a, b) => a.at - b.at)
        for (let i = 1; i < spans.length; i++) {
          expect(
            spans[i].at,
            `overlap in ${lang}: "${spans[i - 1].phrase}" vs "${spans[i].phrase}"`,
          ).toBeGreaterThanOrEqual(spans[i - 1].at + spans[i - 1].phrase.length)
        }
      }
    }
  })

  test('the four categories are all used, and the answer matches the rendered answer', () => {
    for (const p of generated) {
      const r = concept.render(p)
      const cats = new Set(r.breakdown!.highlights.map((h) => h.category))
      expect(cats).toEqual(new Set(['object', 'condition', 'fact', 'question']))
      expect(r.breakdown!.answer.value).toBe(r.answer)
      expect(r.breakdown!.answer.form).toBe('number')
      expect(r.breakdown!.needsVisual).toBe(false)
      for (const q of r.breakdown!.quantities) expect(q.value).not.toBe('')
    }
  })

  test('a trap, when offered, is a number a child could really land on — never the answer', () => {
    let trapped = 0
    for (const p of generated) {
      const r = concept.render(p)
      const trap = r.breakdown!.trap
      if (!trap) continue
      trapped++
      expect(trap.wrong).not.toBe(r.answer)
      expect(trap.wrong).toMatch(/^\d+$/)
      expect(trap.why_id).not.toMatch(/undefined|NaN/)
      expect(trap.why_en).not.toMatch(/undefined|NaN/)
    }
    expect(trapped).toBeGreaterThan(SEEDS / 2)
  })
})

/** Tiny helper so the leading-zero assertion above reads on the whole set. */
function n0(set: number[]): number {
  return set[0]
}
