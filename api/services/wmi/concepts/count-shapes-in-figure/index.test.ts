import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { triangleCount } from './index.js'

describe('count-shapes-in-figure', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: fill_in, answer = C(segments+1, 2)', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      const r = concept.render(p)
      expect(r.answer_type).toBe('fill_in')
      const points = p.segments + 1
      expect(r.answer).toBe(String((points * (points - 1)) / 2))
      expect(r.answer).toBe(String(triangleCount(p)))
    }
  })

  test('known: 2 segments -> 3 triangles, 4 -> 10', () => {
    expect(triangleCount({ segments: 2 })).toBe(3)
    expect(triangleCount({ segments: 4 })).toBe(10)
  })
})
