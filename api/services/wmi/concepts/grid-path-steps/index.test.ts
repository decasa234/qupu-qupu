import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { steps } from './index.js'

describe('grid-path-steps', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: start != end, distance >= 3, answer = Manhattan distance', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      expect(p.sx < p.cols && p.ex < p.cols && p.sy < p.rows && p.ey < p.rows).toBe(true)
      const d = Math.abs(p.ex - p.sx) + Math.abs(p.ey - p.sy)
      expect(d).toBeGreaterThanOrEqual(3)
      const r = concept.render(p)
      expect(r.answer).toBe(String(steps(p)))
      expect(r.answer).toBe(String(d))
    }
  })
})
