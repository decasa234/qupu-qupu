import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept from './index.js'

describe('product-of-consecutive', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: fill_in, product stated, answer = larger consecutive number', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      const r = concept.render(p)
      expect(r.answer_type).toBe('fill_in')
      expect(r.answer).toBe(String(p.k + 1))
      expect(r.body_en).toContain(`product of ${p.k * (p.k + 1)}`)
    }
  })

  test('known case: product 56 -> larger is 8 (7×8)', () => {
    expect(concept.render({ k: 7 }).answer).toBe('8')
  })
})
