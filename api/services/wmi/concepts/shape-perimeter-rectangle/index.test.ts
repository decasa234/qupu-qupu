import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { perimeter } from './index.js'

describe('shape-perimeter-rectangle', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: w != h, fill_in, answer = 2(w+h)', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      expect(p.w).not.toBe(p.h)
      const r = concept.render(p)
      expect(r.answer_type).toBe('fill_in')
      expect(r.answer).toBe(String(perimeter(p)))
      expect(r.answer).toBe(String(2 * (p.w + p.h)))
    }
  })
})
