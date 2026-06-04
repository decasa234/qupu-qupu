import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { countInRange } from './index.js'

describe('range-count-evaluate', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: fill_in, answer = count of values inside [lo,hi]', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      expect(p.hi).toBeGreaterThan(p.lo)
      const r = concept.render(p)
      expect(r.answer_type).toBe('fill_in')
      expect(r.answer).toBe(String(countInRange(p)))
    }
  })
})
