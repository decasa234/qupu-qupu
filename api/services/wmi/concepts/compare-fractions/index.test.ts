import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { LABELS, type Params } from './index.js'

const SEEDS = 320

type F = { num: number; den: number }

// ── Independent oracle ───────────────────────────────────────────────────────
// Written from the DEFINITION of "which fraction is bigger", with no shared code
// with index.ts: a/b > c/d exactly when a*d > c*b, on integers. No division, no
// floats — 1/3 must never become 0.3333.

function isBigger(a: F, b: F): boolean {
  return a.num * b.den > b.num * a.den
}
function isSameNumber(a: F, b: F): boolean {
  return a.num * b.den === b.num * a.den
}
/** Distance from a/b up to one whole is (b−a)/b. Compared the same integer way. */
function isNearerOne(a: F, b: F): boolean {
  return (a.den - a.num) * b.den < (b.den - b.num) * a.den
}

function expectedIndex(fs: F[], ask: Params['ask']): number {
  let best = 0
  for (let i = 1; i < fs.length; i++) {
    const wins =
      ask === 'largest'
        ? isBigger(fs[i], fs[best])
        : ask === 'smallest'
          ? isBigger(fs[best], fs[i])
          : isNearerOne(fs[i], fs[best])
    if (wins) best = i
  }
  return best
}

/** True when exactly one option wins outright — no shared first place. */
function winnerIsUnique(fs: F[], ask: Params['ask'], at: number): boolean {
  return fs.every((f, i) => {
    if (i === at) return true
    return ask === 'largest'
      ? isBigger(fs[at], f)
      : ask === 'smallest'
        ? isBigger(f, fs[at])
        : isNearerOne(fs[at], f)
  })
}

/** Mirrors src/lib/wmiBreakdown stripSectionLabels for the two labels we emit. */
function stripLabels(text: string): string {
  return text
    .replace(/\b(Find|Cari):\s*/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
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

/**
 * The stated comparison mode must really hold, AND it must be the thing that
 * settles the answer. Re-derived here from the rule's own wording rather than
 * from anything the generator did.
 */
function modeSettlesAnswer(p: Params, answerIndex: number): true | string {
  const fs = p.fractions
  const wantBig = p.ask !== 'smallest'

  if (p.mode === 'same-numerator') {
    if (!fs.every((f) => f.num === fs[0].num)) return 'numerators are not all equal'
    const dens = fs.map((f) => f.den)
    const target = wantBig ? Math.min(...dens) : Math.max(...dens)
    if (dens.filter((d) => d === target).length !== 1) return 'the winning denominator is not unique'
    if (dens[answerIndex] !== target) return 'the answer is not the fewest/most-pieces option'
    return true
  }

  if (p.mode === 'same-denominator') {
    if (!fs.every((f) => f.den === fs[0].den)) return 'denominators are not all equal'
    const nums = fs.map((f) => f.num)
    const target = wantBig ? Math.max(...nums) : Math.min(...nums)
    if (nums.filter((n) => n === target).length !== 1) return 'the winning numerator is not unique'
    if (nums[answerIndex] !== target) return 'the answer does not take the most/fewest pieces'
    return true
  }

  if (p.mode === 'one-equivalent-pair') {
    const dens = fs.map((f) => f.den)
    const tally = new Map<number, number>()
    for (const d of dens) tally.set(d, (tally.get(d) ?? 0) + 1)
    if (tally.size !== 2) return 'expected exactly two different denominators'
    const common = [...tally.entries()].find(([, n]) => n === fs.length - 1)?.[0]
    if (common === undefined) return 'no denominator shared by all but one'
    const oddAt = dens.findIndex((d) => d !== common)
    if (dens[oddAt] >= common) return 'the odd denominator is not the smaller one'
    if (common % dens[oddAt] !== 0) return 'the odd denominator does not divide the common one'
    const scaled = fs.map((f) => (f.den === common ? f.num : (f.num * common) / f.den))
    const target = wantBig ? Math.max(...scaled) : Math.min(...scaled)
    if (scaled.filter((n) => n === target).length !== 1) return 'the winning rewritten numerator is not unique'
    if (scaled[answerIndex] !== target) return 'the answer is not the winner after rewriting'
    return true
  }

  if (fs.some((f) => 2 * f.num === f.den)) return 'an option sits exactly on one half'
  const overHalf = fs.map((f) => 2 * f.num > f.den)
  const winSide = wantBig
  if (overHalf.filter((over) => over === winSide).length !== 1) {
    return 'the half benchmark does not isolate exactly one option'
  }
  if (overHalf[answerIndex] !== winSide) return 'the answer is on the wrong side of one half'
  if (new Set(dens(fs)).size === 1) return 'a benchmark set must not be a same-denominator set'
  if (new Set(fs.map((f) => f.num)).size === 1) return 'a benchmark set must not be a same-numerator set'
  return true
}

function dens(fs: F[]): number[] {
  return fs.map((f) => f.den)
}

describe('compare-fractions', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('the schema refuses two options that are the same number', () => {
    const twins: Params = {
      mode: 'same-denominator',
      fractions: [
        { num: 1, den: 2 },
        { num: 2, den: 4 },
        { num: 3, den: 4 },
      ],
      ask: 'largest',
    }
    expect(concept.paramsSchema.safeParse(twins).success).toBe(false)
  })

  test('the schema refuses a mode that does not hold', () => {
    const lying: Params = {
      mode: 'same-numerator',
      fractions: [
        { num: 1, den: 3 },
        { num: 2, den: 5 },
        { num: 3, den: 7 },
      ],
      ask: 'largest',
    }
    expect(concept.paramsSchema.safeParse(lying).success).toBe(false)
  })

  test('the schema refuses an improper fraction', () => {
    const improper: Params = {
      mode: 'same-denominator',
      fractions: [
        { num: 5, den: 5 },
        { num: 2, den: 5 },
        { num: 3, den: 5 },
      ],
      ask: 'largest',
    }
    expect(concept.paramsSchema.safeParse(improper).success).toBe(false)
  })

  test('the half benchmark is never paired with closest-to-one', () => {
    const mismatched: Params = {
      mode: 'benchmark-half',
      fractions: [
        { num: 5, den: 8 },
        { num: 1, den: 3 },
        { num: 2, den: 7 },
      ],
      ask: 'closest-to-one',
    }
    expect(concept.paramsSchema.safeParse(mismatched).success).toBe(false)
  })

  test(`${SEEDS} seeds: parse, no ties, the mode settles it, and the key matches an exact-rational oracle`, () => {
    const answerLabels = new Set<string>()
    const modesSeen = new Set<string>()
    const asksSeen = new Set<string>()

    for (let seed = 1; seed <= SEEDS; seed++) {
      const p = concept.generate(mulberry32(seed))
      const where = `seed ${seed} (${p.mode}/${p.ask}: ${p.fractions.map((f) => `${f.num}/${f.den}`).join(', ')})`
      expect(() => concept.paramsSchema.parse(p), where).not.toThrow()
      modesSeen.add(p.mode)
      asksSeen.add(p.ask)

      const fs: F[] = p.fractions
      expect(fs.length, where).toBeGreaterThanOrEqual(3)
      expect(fs.length, where).toBeLessThanOrEqual(4)
      for (const f of fs) {
        expect(Number.isInteger(f.num) && Number.isInteger(f.den), where).toBe(true)
        expect(f.num, where).toBeGreaterThan(0)
        expect(f.num < f.den, where).toBe(true)
      }

      // No two options are the same NUMBER (1/2 and 2/4 would both be right).
      for (let i = 0; i < fs.length; i++) {
        for (let j = i + 1; j < fs.length; j++) {
          expect(isSameNumber(fs[i], fs[j]), `${where}: options ${i} and ${j} are equal in value`).toBe(
            false,
          )
        }
      }

      const r = concept.render(p)
      expect(r.answer_type, where).toBe('multiple_choice')
      const choices = r.choices_en ?? []
      expect(choices, where).toHaveLength(fs.length)
      choices.forEach((c, i) => {
        expect(c.label, where).toBe(LABELS[i])
        expect(c.text, where).toBe(`${fs[i].num}/${fs[i].den}`)
      })
      expect(r.choices_id, where).toEqual(choices)

      // The key points at the option an independent exact-rational comparison picks.
      const at = choices.findIndex((c) => c.label === r.answer)
      expect(at, where).toBeGreaterThanOrEqual(0)
      expect(at, where).toBe(expectedIndex(fs, p.ask))
      expect(winnerIsUnique(fs, p.ask, at), `${where}: the winner is not strictly ahead`).toBe(true)
      answerLabels.add(r.answer)

      // The comparison rule the stem names really settles this set.
      expect(modeSettlesAnswer(p, at), where).toBe(true)

      // No holes anywhere in the prose.
      const bd = r.breakdown
      expect(bd, where).toBeTruthy()
      if (!bd) continue
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

      // Every highlight phrase is an exact substring of the DISPLAY body.
      const displayEn = stripLabels(r.body_en)
      const displayId = stripLabels(r.body_id)
      for (const h of bd.highlights) {
        expect(displayEn.includes(h.phrase_en), `${where}: en missing "${h.phrase_en}"`).toBe(true)
        expect(displayId.includes(h.phrase_id), `${where}: id missing "${h.phrase_id}"`).toBe(true)
      }
      expectNoOverlap(displayEn, bd.highlights.map((h) => h.phrase_en), `${where} en`)
      expectNoOverlap(displayId, bd.highlights.map((h) => h.phrase_id), `${where} id`)

      // The brief agrees with the key, and any trap is a real other option.
      expect(bd.answer.form, where).toBe('choice')
      expect(bd.answer.value, where).toBe(r.answer)
      if (bd.trap) {
        expect(LABELS.slice(0, fs.length), where).toContain(bd.trap.wrong)
        expect(bd.trap.wrong, where).not.toBe(r.answer)
      }

      // Hints must land on the answer rather than trail off.
      const lastEn = (r.hint_steps_en ?? []).at(-1) ?? ''
      const lastId = (r.hint_steps_id ?? []).at(-1) ?? ''
      expect(lastEn, where).toContain(`${fs[at].num}/${fs[at].den}`)
      expect(lastId, where).toContain(`${fs[at].num}/${fs[at].den}`)
      expect(lastEn, where).toContain(r.answer)
      expect(lastId, where).toContain(r.answer)
    }

    // The right answer is not pinned to one letter, and every mode / ask shows up.
    expect(answerLabels.size).toBeGreaterThan(2)
    expect([...modesSeen].sort()).toEqual([
      'benchmark-half',
      'one-equivalent-pair',
      'same-denominator',
      'same-numerator',
    ])
    expect([...asksSeen].sort()).toEqual(['closest-to-one', 'largest', 'smallest'])
  })
})
