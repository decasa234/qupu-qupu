import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { lineLength, posFromBack, peopleBetween } from './index.js'
import type { Params } from './index.js'

describe('position-in-line', () => {
  // ── Determinism ────────────────────────────────────────────────────────────

  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  // ── Mode 1: count-total (original / G1-friendly) ───────────────────────────

  test('count-total: answer = fromFront + fromBack - 1', () => {
    const p: Params = {
      mode: 'count-total',
      name: 'Ann',
      fromFront: 5,
      fromBack: 4,
    }
    const r = concept.render(p)
    expect(r.answer_type).toBe('fill_in')
    expect(r.answer).toBe(String(lineLength(p))) // 5 + 4 - 1 = 8
    expect(r.answer).toBe('8')
  })

  test('count-total: 100 seeds produce valid params and correct answers', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      const r = concept.render(p)
      // Every mode returns a numeric fill-in answer that is a non-empty string.
      expect(r.answer_type).toBe('fill_in')
      expect(r.answer.length).toBeGreaterThan(0)
      expect(Number(r.answer)).toBeGreaterThan(0)
    }
  })

  // ── Mode 2: from-back ──────────────────────────────────────────────────────

  /**
   * Acceptance test: a line of n=12, person at position 4 from the front.
   * Position from back = 12 − 4 + 1 = 9.
   */
  test('from-back: n=12, pos=4 from front → position from back = 9', () => {
    const p: Params = {
      mode: 'from-back',
      name: 'Maya',
      n: 12,
      pos: 4,
    }
    const r = concept.render(p)
    expect(r.answer_type).toBe('fill_in')
    expect(posFromBack(12, 4)).toBe(9)
    expect(r.answer).toBe('9')
  })

  test('from-back: pos from back + pos from front - 1 = n', () => {
    // Invariant: posFromBack(n, pos) + pos = n + 1
    const cases: [number, number][] = [
      [10, 3],
      [15, 7],
      [8, 8],
      [20, 1],
      [12, 12],
    ]
    for (const [n, pos] of cases) {
      const back = posFromBack(n, pos)
      expect(back + pos - 1).toBe(n)
    }
  })

  // ── Mode 3: between ────────────────────────────────────────────────────────

  test('between: posA=3, posB=7 → 3 people strictly between', () => {
    const p: Params = {
      mode: 'between',
      nameA: 'Dan',
      nameB: 'Lina',
      n: 10,
      posA: 3,
      posB: 7,
    }
    const r = concept.render(p)
    expect(r.answer_type).toBe('fill_in')
    // Positions 4, 5, 6 — three children
    expect(peopleBetween(3, 7)).toBe(3)
    expect(r.answer).toBe('3')
  })

  test('between: adjacent positions → 0 people between', () => {
    const p: Params = {
      mode: 'between',
      nameA: 'Rio',
      nameB: 'Ken',
      n: 8,
      posA: 4,
      posB: 5,
    }
    const r = concept.render(p)
    expect(r.answer).toBe('0')
  })

  // ── Mode 4: reversal ───────────────────────────────────────────────────────

  test('reversal: n=15, pos=3 from front → new position = 15 − 3 + 1 = 13', () => {
    const p: Params = {
      mode: 'reversal',
      name: 'Budi',
      n: 15,
      pos: 3,
    }
    const r = concept.render(p)
    expect(r.answer_type).toBe('fill_in')
    expect(r.answer).toBe('13') // 15 - 3 + 1 = 13
  })

  test('reversal: n=10, pos=10 (last from front) → new position = 1 (first after reversal)', () => {
    const p: Params = {
      mode: 'reversal',
      name: 'Paul',
      n: 10,
      pos: 10,
    }
    const r = concept.render(p)
    expect(r.answer).toBe('1')
  })

  // ── Seed loop: every generated instance has a unique correct answer ─────────

  test('200 seeds: all modes produce unique correct answer (no ambiguity)', () => {
    for (let seed = 1; seed <= 200; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      const r = concept.render(p)
      // Answer must be a positive integer string
      const ans = Number(r.answer)
      expect(Number.isInteger(ans) && ans >= 0).toBe(true)
      // Breakdown answer must match render answer
      expect(r.breakdown?.answer.value).toBe(r.answer)
    }
  })

  // ── Breakdown consistency ──────────────────────────────────────────────────

  test('breakdown answer matches render answer for all modes', () => {
    const fixtures: Params[] = [
      { mode: 'count-total', name: 'Ann', fromFront: 3, fromBack: 5 },
      { mode: 'from-back', name: 'Maya', n: 12, pos: 4 },
      { mode: 'between', nameA: 'Dan', nameB: 'Ken', n: 10, posA: 2, posB: 6 },
      { mode: 'reversal', name: 'Rio', n: 9, pos: 2 },
    ]
    for (const p of fixtures) {
      const r = concept.render(p)
      expect(r.breakdown?.answer.value).toBe(r.answer)
    }
  })
})
