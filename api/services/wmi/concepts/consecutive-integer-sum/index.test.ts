import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { sumOf } from './index.js'

describe('consecutive-integer-sum', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(11))).toEqual(concept.generate(mulberry32(11)))
  })

  test('100 seeds: sum is independently recomputed, start is recovered, and it matches the render answer', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()

      // Independently recompute the sum from the n consecutive numbers.
      const numbers = Array.from({ length: p.n }, (_, i) => p.start + i)
      const independentSum = numbers.reduce((a, b) => a + b, 0)
      expect(independentSum).toBe(sumOf(p))

      // Numbers are truly consecutive and sum to the expected total.
      for (let i = 1; i < numbers.length; i++) {
        expect(numbers[i]).toBe(numbers[i - 1] + 1)
      }

      // Recover start from sum & n independently and assert it's an integer
      // equal to start and to the rendered answer.
      const sum = sumOf(p)
      const recoveredStart = (sum - (p.n * (p.n - 1)) / 2) / p.n
      expect(Number.isInteger(recoveredStart)).toBe(true)
      expect(recoveredStart).toBe(p.start)

      const r = concept.render(p)
      expect(r.answer_type).toBe('fill_in')
      expect(r.answer).toBe(String(recoveredStart))
      expect(r.answer).toBe(String(p.start))

      // Every highlight phrase must be a substring of the rendered body.
      const b = r.breakdown!
      for (const h of b.highlights) {
        expect(r.body_en).toContain(h.phrase_en)
        expect(r.body_id).toContain(h.phrase_id)
      }
    }
  })

  test('worked example: n=4 consecutive numbers summing to 34 -> smallest is 7', () => {
    const p = { n: 4, start: 7 }
    expect(sumOf(p)).toBe(34)
  })
})
