import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { result } from './index.js'

describe('more-or-less-by-k', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: fill_in, answer = x ± k, never negative', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      const r = concept.render(p)
      expect(r.answer_type).toBe('fill_in')
      const v = result(p)
      expect(v).toBeGreaterThanOrEqual(0)
      expect(r.answer).toBe(String(v))
    }
  })
})
