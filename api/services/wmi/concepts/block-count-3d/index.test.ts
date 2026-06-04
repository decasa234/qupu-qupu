import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { total } from './index.js'

describe('block-count-3d', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: equal-width rows, fill_in, answer = sum of front + back heights', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      expect(p.front.length).toBe(p.back.length)
      const r = concept.render(p)
      expect(r.answer_type).toBe('fill_in')
      const expected = [...p.front, ...p.back].reduce((s, h) => s + h, 0)
      expect(r.answer).toBe(String(expected))
      expect(r.answer).toBe(String(total(p)))
    }
  })
})
