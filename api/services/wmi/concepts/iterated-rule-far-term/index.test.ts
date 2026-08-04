import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { MAX_CYCLE, MAX_TAIL, MIN_CYCLE, solve, type Params } from './index.js'

const SEEDS = 320
/** Long enough that a fake shorter period could never survive by accident. */
const WALK = 260

/**
 * Independent oracle: build the list straight from the words of the problem,
 * one number at a time, with no shared code with the concept's state machines.
 */
function walk(p: Params, upTo: number): number[] {
  const out: number[] = []
  if (p.rule === 'difference-of-previous-two') {
    out.push(p.seedA, p.seedB as number)
    while (out.length < upTo) {
      out.push(Math.abs(out[out.length - 1] - out[out.length - 2]))
    }
    return out.slice(0, upTo)
  }
  if (p.rule === 'units-digit-of-product') {
    let d = p.seedA
    while (out.length < upTo) {
      out.push(d)
      d = (d * (p.multiplier as number)) % 10
    }
    return out
  }
  const ring = p.ring as number
  let chair = p.seedA
  for (let pass = 1; out.length < upTo; pass++) {
    chair += pass % 2 === 1 ? (p.forward as number) : -(p.back as number)
    while (chair > ring) chair -= ring
    while (chair < 1) chair += ring
    out.push(chair)
  }
  return out
}

/**
 * Independent cycle finder: the smallest block length that makes the list
 * repeat, and then the earliest place that block can start. Searches every
 * length, not just the divisors of anything, so it cannot inherit a mistake
 * from the concept's own detector.
 */
function independentCycle(list: number[]): { tail: number; len: number } {
  for (let len = 1; len <= 60; len++) {
    for (let tail = 0; tail + 2 * len < list.length; tail++) {
      let holds = true
      for (let i = tail; i + len < list.length; i++) {
        if (list[i] !== list[i + len]) {
          holds = false
          break
        }
      }
      if (holds) return { tail, len }
    }
  }
  throw new Error('no cycle found in the walked list')
}

describe('iterated-rule-far-term', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(11))).toEqual(concept.generate(mulberry32(11)))
  })

  test('the difference rule really has a run-up, and the run-up changes the answer', () => {
    // 8, 5 → 8, 5, 3, 2, then 1, 1, 0 for ever. The first four numbers never come back.
    const p: Params = {
      rule: 'difference-of-previous-two',
      seedA: 8,
      seedB: 5,
      multiplier: null,
      ring: null,
      forward: null,
      back: null,
      targetIndex: 30,
      ask: 'the-term',
    }
    expect(concept.paramsSchema.safeParse(p).success).toBe(true)
    const s = solve(p)
    expect(walk(p, 12)).toEqual([8, 5, 3, 2, 1, 1, 0, 1, 1, 0, 1, 1])
    expect(s.tailTerms).toEqual([8, 5, 3, 2])
    expect(s.cycleTerms).toEqual([1, 1, 0])
    expect(s.tailLength).toBe(4)
    expect(s.cycleLength).toBe(3)
    // 30 − 4 = 26; 26 ÷ 3 = 8 remainder 2 → the 2nd number of 1, 1, 0.
    expect(s.stepsInsideBlock).toBe(26)
    expect(s.remainder).toBe(2)
    expect(s.slot).toBe(2)
    expect(s.targetTerm).toBe(1)
    expect(s.targetTerm).toBe(walk(p, 30)[29])
    // Cycling "from term 1" would divide 30 by 3, land on the 3rd number of the
    // list — 3 — and be wrong. That is exactly the trap this concept teaches.
    expect(s.trapValue).toBe(3)
    expect(s.trapValue).not.toBe(s.targetTerm)
    const bd = concept.render(p).breakdown!
    expect(bd.trap).not.toBeNull()
    expect(bd.trap!.wrong).toBe('3')
  })

  test('a list with no run-up is handled without inventing one', () => {
    // 3 ×3 → 3, 9, 7, 1, 3, 9, 7, 1 … repeating from the very first number.
    const p: Params = {
      rule: 'units-digit-of-product',
      seedA: 3,
      seedB: null,
      multiplier: 3,
      ring: null,
      forward: null,
      back: null,
      targetIndex: 30,
      ask: 'the-term',
    }
    const s = solve(p)
    expect(s.tailLength).toBe(0)
    expect(s.cycleTerms).toEqual([3, 9, 7, 1])
    expect(s.remainder).toBe(2) // 30 ÷ 4 = 7 remainder 2
    expect(s.targetTerm).toBe(9)
    expect(s.targetTerm).toBe(walk(p, 30)[29])
    // With no run-up there is nothing to trip over, so no trap is authored.
    expect(concept.render(p).breakdown!.trap).toBeNull()
  })

  test('the schema rejects the shapes that would break the concept', () => {
    const base: Params = {
      rule: 'units-digit-of-product',
      seedA: 3,
      seedB: null,
      multiplier: 2,
      ring: null,
      forward: null,
      back: null,
      targetIndex: 30,
      ask: 'the-term',
    }
    expect(concept.paramsSchema.safeParse(base).success).toBe(true)
    // A block of 1 is a constant, not a puzzle: 5 ×5 → 5, 5, 5, …
    expect(concept.paramsSchema.safeParse({ ...base, seedA: 5, multiplier: 5 }).success).toBe(false)
    // A block longer than MAX_CYCLE is more than a child can hold: 12 chairs,
    // forward 5 / back 4 drifts one chair per pair and takes 24 passes to come round.
    expect(
      concept.paramsSchema.safeParse({
        rule: 'alternating-add-subtract',
        seedA: 1,
        seedB: null,
        multiplier: null,
        ring: 12,
        forward: 5,
        back: 4,
        targetIndex: 30,
        ask: 'the-term',
      }).success,
    ).toBe(false)
    // A run-up longer than MAX_TAIL cannot be written out: 34, 21 runs down for 7 numbers.
    expect(
      concept.paramsSchema.safeParse({
        rule: 'difference-of-previous-two',
        seedA: 34,
        seedB: 21,
        multiplier: null,
        ring: null,
        forward: null,
        back: null,
        targetIndex: 30,
        ask: 'the-term',
      }).success,
    ).toBe(false)
    // the-term needs an index; sum-of-one-cycle must not carry one.
    expect(concept.paramsSchema.safeParse({ ...base, targetIndex: null }).success).toBe(false)
    expect(concept.paramsSchema.safeParse({ ...base, ask: 'sum-of-one-cycle' }).success).toBe(false)
    expect(
      concept.paramsSchema.safeParse({ ...base, ask: 'sum-of-one-cycle', targetIndex: null }).success,
    ).toBe(true)
    // Each rule carries only its own seeds.
    expect(concept.paramsSchema.safeParse({ ...base, seedB: 4 }).success).toBe(false)
    expect(
      concept.paramsSchema.safeParse({ ...base, rule: 'difference-of-previous-two', multiplier: null }).success,
    ).toBe(false)
  })

  test(`${SEEDS} seeds: cycle detected, remainder honours the run-up, render is clean`, () => {
    const seenRule = new Set<string>()
    const seenAsk = new Set<string>()
    let withTail = 0
    let withTrap = 0

    for (let seed = 1; seed <= SEEDS; seed++) {
      const p = concept.generate(mulberry32(seed))
      const where = `seed ${seed} (${JSON.stringify(p)})`
      expect(concept.paramsSchema.safeParse(p).success, where).toBe(true)
      seenRule.add(p.rule)
      seenAsk.add(p.ask)

      const s = solve(p)
      const list = walk(p, WALK)

      // The detected run-up and block length must match an independent search.
      const oracle = independentCycle(list)
      expect(s.cycleLength, `${where} block length`).toBe(oracle.len)
      expect(s.tailLength, `${where} run-up length`).toBe(oracle.tail)
      expect(s.cycleLength, where).toBeGreaterThanOrEqual(MIN_CYCLE)
      expect(s.cycleLength, where).toBeLessThanOrEqual(MAX_CYCLE)
      expect(s.tailLength, where).toBeLessThanOrEqual(MAX_TAIL)
      expect(s.tailTerms, where).toEqual(list.slice(0, s.tailLength))
      expect(s.cycleTerms, where).toEqual(list.slice(s.tailLength, s.tailLength + s.cycleLength))
      // The run-up is minimal: the number just before it must NOT already fit
      // the block, or the concept would be calling a repeating number "run-up".
      if (s.tailLength > 0) {
        withTail += 1
        expect(list[s.tailLength - 1], where).not.toBe(list[s.tailLength - 1 + s.cycleLength])
      }
      // The block length is minimal: no shorter block reproduces the list.
      for (let shorter = 1; shorter < s.cycleLength; shorter++) {
        let holds = true
        for (let i = s.tailLength; i + shorter < list.length; i++) {
          if (list[i] !== list[i + shorter]) {
            holds = false
            break
          }
        }
        expect(holds, `${where}: block ${shorter} should not hold`).toBe(false)
      }
      // Every generated term really is the walked term.
      for (let i = 0; i < Math.min(s.terms.length, list.length); i++) {
        expect(s.terms[i], `${where} term ${i + 1}`).toBe(list[i])
      }

      if (p.ask === 'the-term') {
        const n = p.targetIndex as number
        expect(n, where).toBeGreaterThanOrEqual(s.tailLength + 2 * s.cycleLength)
        // Remainder arithmetic, redone here from the definition, with the run-up
        // taken off first — and cross-checked against a straight walk to index n.
        const inside = n - s.tailLength
        const rem = inside % s.cycleLength
        const slot = rem === 0 ? s.cycleLength : rem
        expect(s.stepsInsideBlock, where).toBe(inside)
        expect(s.quotient, where).toBe(Math.floor(inside / s.cycleLength))
        expect(s.remainder, where).toBe(rem)
        expect(s.slot, where).toBe(slot)
        expect(s.targetTerm, where).toBe(s.cycleTerms[slot - 1])
        expect(s.targetTerm, `${where} vs brute-force walk to ${n}`).toBe(list[n - 1])
        expect(s.answer, where).toBe(String(list[n - 1]))
      } else {
        expect(p.targetIndex, where).toBeNull()
        expect(s.answer, where).toBe(String(s.cycleTerms.reduce((a, b) => a + b, 0)))
        expect(s.targetTerm, where).toBeNull()
      }

      const r = concept.render(p)
      expect(r.answer, where).toBe(s.answer)
      expect(r.answer_type, where).toBe('fill_in')
      expect(r.choices_en, where).toBeNull()
      expect(r.choices_id, where).toBeNull()

      const bd = r.breakdown!
      expect(bd.needsVisual, where).toBe(false)
      expect(bd.answer.value, where).toBe(s.answer)
      expect(bd.highlights.length, where).toBeGreaterThanOrEqual(4)
      if (bd.trap !== null) {
        withTrap += 1
        expect(bd.trap.wrong, where).not.toBe(s.answer)
        expect(bd.trap.wrong, where).toBe(String(s.trapValue))
      }

      // Nothing anywhere may leak an undefined / NaN onto a child's screen.
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
      expect(prose, where).not.toMatch(/undefined|NaN|null|\[object/)

      // The steps must FORCE the answer: list, spot the repeat, measure the
      // block, divide, read off — and land on the answer in the last line.
      const stepsEn = r.hint_steps_en ?? []
      const stepsId = r.hint_steps_id ?? []
      expect(stepsEn.length, where).toBe(stepsId.length)
      expect(stepsEn.length, where).toBeGreaterThanOrEqual(4)
      expect(stepsEn[2], where).toContain(String(s.cycleLength))
      expect(stepsEn.at(-1) as string, where).toContain(s.answer)
      expect(stepsId.at(-1) as string, where).toContain(s.answer)
      if (p.ask === 'the-term') {
        // The division line must show the run-up being taken off, not the raw index.
        expect(stepsEn[3], where).toContain(`${s.stepsInsideBlock} ÷ ${s.cycleLength}`)
        expect(stepsId[3], where).toContain(`${s.stepsInsideBlock} : ${s.cycleLength}`)
        if (s.tailLength > 0) {
          expect(stepsEn[3], where).toContain(`${p.targetIndex} − ${s.tailLength} = ${s.stepsInsideBlock}`)
        }
      }

      // Breakdown phrases must be exact substrings of the DISPLAY body in both
      // languages, and must not overlap each other.
      const display_en = stripLabels(r.body_en)
      const display_id = stripLabels(r.body_id)
      for (const h of bd.highlights) {
        expect(display_en, `${where} phrase_en=${h.phrase_en}`).toContain(h.phrase_en)
        expect(display_id, `${where} phrase_id=${h.phrase_id}`).toContain(h.phrase_id)
      }
      expectNoOverlap(display_en, bd.highlights.map((h) => h.phrase_en), where)
      expectNoOverlap(display_id, bd.highlights.map((h) => h.phrase_id), where)
    }

    expect([...seenRule].sort()).toEqual([
      'alternating-add-subtract',
      'difference-of-previous-two',
      'units-digit-of-product',
    ])
    expect([...seenAsk].sort()).toEqual(['sum-of-one-cycle', 'the-term'])
    // Both worlds must actually be exercised: lists with a run-up (where the
    // trap lives) and lists without one.
    expect(withTail).toBeGreaterThan(0)
    expect(withTail).toBeLessThan(SEEDS)
    expect(withTrap).toBeGreaterThan(0)
  })
})

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
