import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept from './index.js'

describe('multiplication-small', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(19))).toEqual(concept.generate(mulberry32(19)))
  })

  test('100 seeds: a,b in [2,5], answer = a*b', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      expect(p.a).toBeGreaterThanOrEqual(2)
      expect(p.a).toBeLessThanOrEqual(5)
      expect(p.b).toBeGreaterThanOrEqual(2)
      expect(p.b).toBeLessThanOrEqual(5)
      const r = concept.render(p)
      expect(r.answer).toBe(String(p.a * p.b))
    }
  })
})
