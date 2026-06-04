import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { linesOfSymmetry } from './index.js'

const EXPECTED: Record<string, number> = {
  'equilateral-triangle': 3,
  'isosceles-triangle': 1,
  rectangle: 2,
  square: 4,
  'regular-pentagon': 5,
  'regular-hexagon': 6,
}

describe('symmetry-count', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: fill_in, answer = known lines of symmetry for the shape', () => {
    const seen = new Set<string>()
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      seen.add(p.kind)
      const r = concept.render(p)
      expect(r.answer_type).toBe('fill_in')
      expect(r.answer).toBe(String(EXPECTED[p.kind]))
      expect(r.answer).toBe(String(linesOfSymmetry(p)))
    }
    expect(seen.size).toBeGreaterThan(3)
  })
})
