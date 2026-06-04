import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { hiddenSum } from './index.js'

describe('dice-opposite-faces', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: visible faces valid (no opposite pair), answer = 21 - visible', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      expect(p.t + p.f).not.toBe(7)
      expect(p.f + p.r).not.toBe(7)
      expect(p.t + p.r).not.toBe(7)
      const r = concept.render(p)
      expect(r.answer).toBe(String(21 - (p.t + p.f + p.r)))
      expect(r.answer).toBe(String(hiddenSum(p)))
    }
  })
})
