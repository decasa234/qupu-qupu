import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { total, hiddenCount } from './index.js'

describe('block-count-3d', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: solid, has depth + stacking, NO hidden cubes, answer = total', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      expect(p.heights.length).toBe(p.depth * p.width)
      expect(p.depth).toBeGreaterThanOrEqual(2) // real depth
      expect(Math.max(...p.heights)).toBeGreaterThanOrEqual(2) // real stacking
      // the reviewer's requirement: no box completely unseen
      expect(hiddenCount(p.depth, p.width, p.heights)).toBe(0)
      const r = concept.render(p)
      expect(r.answer).toBe(String(total(p)))
    }
  })

  test('hiddenCount flags an enclosed cube', () => {
    // 2x2: a tall back-left column with taller front and right columns hides its base
    expect(hiddenCount(2, 2, [3, 3, 3, 1])).toBeGreaterThan(0)
    // flat back row + taller front row: nothing hidden
    expect(hiddenCount(2, 3, [1, 1, 1, 2, 2, 2])).toBe(0)
  })
})
