import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { total } from './index.js'

describe('block-count-3d', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: fill_in, answer = sum of column heights', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      const r = concept.render(p)
      expect(r.answer_type).toBe('fill_in')
      expect(r.answer).toBe(String(total(p)))
      expect(r.answer).toBe(String(p.heights.reduce((s, h) => s + h, 0)))
    }
  })
})
