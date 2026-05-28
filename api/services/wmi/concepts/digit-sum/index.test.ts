import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept from './index.js'

describe('digit-sum', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(5))).toEqual(concept.generate(mulberry32(5)))
  })

  test('100 seeds: n in [10,99], answer is sum of digits', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      expect(p.n).toBeGreaterThanOrEqual(10)
      expect(p.n).toBeLessThanOrEqual(99)
      const r = concept.render(p)
      const expected = Math.floor(p.n / 10) + (p.n % 10)
      expect(r.answer).toBe(String(expected))
    }
  })
})
