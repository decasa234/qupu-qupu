import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { total, isStaircase } from './index.js'

describe('block-count-3d', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: a descending staircase (plane partition) with stacking; answer = total', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      expect(p.heights.length).toBe(p.depth * p.width)
      expect(p.depth).toBeGreaterThanOrEqual(2)
      expect(isStaircase(p.depth, p.width, p.heights)).toBe(true) // unambiguous shape
      expect(Math.max(...p.heights)).toBeGreaterThanOrEqual(2) // real stacking
      const t = total(p)
      expect(t).toBeGreaterThanOrEqual(5)
      expect(t).toBeLessThanOrEqual(14)
      expect(concept.render(p).answer).toBe(String(t))
    }
  })

  test('isStaircase rejects an increasing (non-plane-partition) layout', () => {
    expect(isStaircase(2, 2, [1, 1, 1, 2])).toBe(false) // front-right taller than back
    expect(isStaircase(2, 2, [3, 2, 2, 1])).toBe(true)
  })
})
