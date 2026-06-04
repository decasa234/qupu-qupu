import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { total, isMonotone } from './index.js'

describe('block-count-3d', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: 2-4 solid monotone groups bounded by 5x5x3; answer = grand total', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      expect(p.groups.length).toBeGreaterThanOrEqual(2)
      expect(p.groups.length).toBeLessThanOrEqual(4)
      for (const g of p.groups) {
        expect(g.depth).toBeGreaterThanOrEqual(1)
        expect(g.depth).toBeLessThanOrEqual(5)
        expect(g.width).toBeGreaterThanOrEqual(1)
        expect(g.width).toBeLessThanOrEqual(5)
        expect(g.heights.length).toBe(g.depth * g.width)
        expect(Math.max(...g.heights)).toBeLessThanOrEqual(3) // <= 3 tall
        // monotone -> every stack top is visible, nothing completely hidden
        expect(isMonotone(g.depth, g.width, g.heights)).toBe(true)
        const cubes = g.heights.reduce((a, b) => a + b, 0)
        expect(cubes).toBeGreaterThanOrEqual(2)
        expect(cubes).toBeLessThanOrEqual(18)
      }
      const t = total(p)
      expect(t).toBeGreaterThanOrEqual(12)
      expect(t).toBeLessThanOrEqual(40)
      expect(concept.render(p).answer).toBe(String(t))
    }
  })
})
