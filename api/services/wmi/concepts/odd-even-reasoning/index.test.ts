import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept from './index.js'
import { computeSumDiff } from './index.js'

describe('odd-even-reasoning', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  // ── sum-diff acceptance test (Task 5 required assertion) ──────────────────
  // Fixed list: 34, 23, 11, 42, 17
  //   Odds:  23 + 11 + 17 = 51
  //   Evens: 34 + 42      = 76
  //   |51 − 76| = 25
  test('computeSumDiff helper: [34,23,11,42,17] → 25', () => {
    expect(computeSumDiff([34, 23, 11, 42, 17])).toBe(25)
  })

  test('sum-diff render: fixed list [34,23,11,42,17] → answer "25"', () => {
    // render() accepts any number list regardless of schema bounds
    const params = { mode: 'sum-diff' as const, numbers: [34, 23, 11, 42, 17] }
    const r = concept.render(params)
    expect(r.answer).toBe('25')
    expect(r.answer_type).toBe('fill_in')
  })

  test('sum-diff schema: 8-element list parses correctly', () => {
    const params = { mode: 'sum-diff' as const, numbers: [34, 23, 11, 42, 17, 6, 81, 50] }
    expect(() => concept.paramsSchema.parse(params)).not.toThrow()
    const r = concept.render(params)
    expect(r.answer).toBe(String(computeSumDiff(params.numbers)))
    expect(r.answer_type).toBe('fill_in')
  })

  // ── sum-diff-ctx mode ─────────────────────────────────────────────────────
  test('sum-diff-ctx: renders fill_in with correct answer', () => {
    const nums = [12, 35, 47, 8, 61, 24, 19, 76]
    const params = { mode: 'sum-diff-ctx' as const, numbers: nums, contextKey: 0 as const }
    expect(() => concept.paramsSchema.parse(params)).not.toThrow()
    const r = concept.render(params)
    expect(r.answer_type).toBe('fill_in')
    expect(r.answer).toBe(String(computeSumDiff(nums)))
    // body must include context intro (contextKey 0 = points scored context)
    expect(r.body_en).toContain('points scored')
  })

  // ── pair-parity mode ──────────────────────────────────────────────────────
  test('pair-parity: exactly one option is odd, answer points to it', () => {
    const params = {
      mode: 'pair-parity' as const,
      options: [
        { x: 12, y: 14 }, // even + even = even
        { x: 7, y: 9 },   // odd + odd = even
        { x: 23, y: 44 }, // odd + even = odd  ← correct
        { x: 50, y: 60 }, // even + even = even
      ],
    }
    expect(() => concept.paramsSchema.parse(params)).not.toThrow()
    const r = concept.render(params)
    expect(r.answer_type).toBe('multiple_choice')
    expect(r.answer).toBe('C')
  })

  // ── seed loop: every instance has a unique correct answer ─────────────────
  test('100 seeds: every generated instance has a valid, parseable, unique-answer structure', () => {
    const answersSeen = new Set<string>()
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      const r = concept.render(p)

      if (p.mode === 'pair-parity') {
        // Exactly one option must be odd
        const odds = p.options.filter((o) => (o.x + o.y) % 2 === 1)
        expect(odds).toHaveLength(1)
        const idx = ['A', 'B', 'C', 'D'].indexOf(r.answer)
        expect(idx).toBeGreaterThanOrEqual(0)
        expect((p.options[idx].x + p.options[idx].y) % 2).toBe(1)
      } else {
        // sum-diff and sum-diff-ctx
        expect(p.numbers.length).toBeGreaterThanOrEqual(8)
        expect(p.numbers.length).toBeLessThanOrEqual(10)
        expect(p.numbers.every((n) => n >= 1 && n <= 99)).toBe(true)
        const computed = computeSumDiff(p.numbers)
        expect(r.answer).toBe(String(computed))
        // Non-negative integer answer
        expect(Number(r.answer)).toBeGreaterThanOrEqual(0)
      }
      answersSeen.add(r.answer)
    }
    // Multiple distinct answers across modes/seeds
    expect(answersSeen.size).toBeGreaterThan(5)
  })
})
