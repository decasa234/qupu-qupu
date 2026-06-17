import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept from './index.js'

describe('divisibility-multiple-property', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: paramsSchema valid, unique correct answer per instance, answer label correct', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()

      if (p.mode === 'pick-multiple') {
        // Exactly one option must be a multiple of d
        const multiples = p.options.filter((n) => n % p.d === 0)
        expect(multiples).toHaveLength(1)
        const r = concept.render(p)
        expect(r.answer_type).toBe('multiple_choice')
        const idx = ['A', 'B', 'C', 'D'].indexOf(r.answer)
        expect(p.options[idx] % p.d).toBe(0)
      } else if (p.mode === 'multi-divisor') {
        // answer must be > base and divisible by both k and m
        const r = concept.render(p)
        expect(r.answer_type).toBe('fill_in')
        const ans = Number(r.answer)
        expect(ans).toBeGreaterThan(p.base)
        expect(ans % p.k).toBe(0)
        expect(ans % p.m).toBe(0)
        // No smaller multiple-of-both exists between base and ans
        const g = (a: number, b: number): number => { let [x, y] = [a, b]; while (y) { [x, y] = [y, x % y] } return x }
        const l = (p.k / g(p.k, p.m)) * p.m
        expect(ans - l).toBeLessThanOrEqual(p.base)
      } else {
        // make-divisible: (n + x) must be divisible by d; x ≥ 1
        const r = concept.render(p)
        expect(r.answer_type).toBe('fill_in')
        const x = Number(r.answer)
        expect(x).toBeGreaterThanOrEqual(1)
        expect((p.n + x) % p.d).toBe(0)
        // x is the smallest: n+x-d must not be divisible by d (it's < n, so always true given x < d)
        expect(x).toBeLessThan(p.d)
      }
    }
  })

  // ── Acceptance test 1: multi-divisor ──────────────────────────────────────
  // Smallest number > 40 divisible by both 3 and 4.
  // LCM(3,4) = 12. Multiples: 12, 24, 36, 48, 60…  Smallest > 40 is 48.
  test('multi-divisor: smallest > 40 divisible by 3 and 4 → 48', () => {
    const params = concept.paramsSchema.parse({
      mode: 'multi-divisor',
      k: 3,
      m: 4,
      base: 40,
      answer: 48,
    })
    const r = concept.render(params)
    expect(r.answer).toBe('48')
    expect(r.answer_type).toBe('fill_in')
    // Sanity: 48 % 3 = 0, 48 % 4 = 0, 48 > 40
    expect(48 % 3).toBe(0)
    expect(48 % 4).toBe(0)
    expect(48).toBeGreaterThan(40)
  })

  // ── Acceptance test 2: make-divisible ─────────────────────────────────────
  // Smallest x ≥ 1 so that 42 + x is divisible by 9.
  // 42 ÷ 9 = 4 remainder 6.  Next multiple = 45 (= 9 × 5).  x = 45 − 42 = 3.
  test('make-divisible: 42 + x divisible by 9 → x = 3', () => {
    const params = concept.paramsSchema.parse({
      mode: 'make-divisible',
      d: 9,
      n: 42,
      x: 3,
    })
    const r = concept.render(params)
    expect(r.answer).toBe('3')
    expect(r.answer_type).toBe('fill_in')
    // Sanity: 42 % 9 = 6, 45 % 9 = 0
    expect(42 % 9).toBe(6)
    expect((42 + 3) % 9).toBe(0)
  })

  // ── Acceptance test 3: pick-multiple still works ──────────────────────────
  test('pick-multiple: answer label points to the divisible option', () => {
    const params = concept.paramsSchema.parse({
      mode: 'pick-multiple',
      d: 6,
      options: [23, 42, 55, 71],
    })
    // 42 is the only multiple of 6 in [23, 42, 55, 71]
    const r = concept.render(params)
    expect(r.answer).toBe('B') // index 1 → label B
    expect(r.answer_type).toBe('multiple_choice')
  })

  // ── Position variety: answer label varies across seeds ────────────────────
  test('pick-multiple seeds: answer labels vary across positions', () => {
    const positions = new Set<string>()
    for (let seed = 1; seed <= 200; seed++) {
      const p = concept.generate(mulberry32(seed))
      if (p.mode !== 'pick-multiple') continue
      const r = concept.render(p)
      positions.add(r.answer)
    }
    expect(positions.size).toBeGreaterThan(1)
  })
})
