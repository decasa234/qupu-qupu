import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept from './index.js'

describe('combination-product-sum', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: y > x, fill_in, answer = larger number, sum/product consistent', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      expect(p.y).toBeGreaterThan(p.x)
      const r = concept.render(p)
      expect(r.answer_type).toBe('fill_in')
      expect(r.answer).toBe(String(p.y))
      expect(r.body_en).toContain(`sum of ${p.x + p.y}`)
      expect(r.body_en).toContain(`product of ${p.x * p.y}`)
    }
  })
})
