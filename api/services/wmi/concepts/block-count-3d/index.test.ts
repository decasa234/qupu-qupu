import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { total } from './index.js'

describe('block-count-3d', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: 2-4 groups, each a line (not 2x2) of <=4 blocks; answer = grand total', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      expect(p.groups.length).toBeGreaterThanOrEqual(2)
      expect(p.groups.length).toBeLessThanOrEqual(4)
      for (const g of p.groups) {
        expect(g.heights.length).toBe(g.depth * g.width)
        expect(g.depth === 2 && g.width === 2).toBe(false) // always a line -> nothing hidden
        const blocks = g.heights.reduce((a, b) => a + b, 0)
        expect(blocks).toBeLessThanOrEqual(4) // max 4 per group
      }
      const t = total(p)
      expect(t).toBeGreaterThanOrEqual(6)
      expect(t).toBeLessThanOrEqual(14)
      expect(concept.render(p).answer).toBe(String(t))
    }
  })
})
