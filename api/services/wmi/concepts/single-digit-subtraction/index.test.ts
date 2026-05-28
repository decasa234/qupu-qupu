import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept from './index.js'

describe('single-digit-subtraction', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(11))).toEqual(concept.generate(mulberry32(11)))
  })

  test('100 seeds: a > b, answer = a - b, answer >= 1', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      expect(p.a).toBeGreaterThan(p.b)
      const r = concept.render(p)
      expect(Number(r.answer)).toBeGreaterThanOrEqual(1)
      expect(r.answer).toBe(String(p.a - p.b))
    }
  })
})
