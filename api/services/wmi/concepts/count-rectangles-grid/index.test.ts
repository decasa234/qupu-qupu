import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { rectangleCount } from './index.js'

describe('count-rectangles-grid', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: fill_in, answer = all squares by size', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      const r = concept.render(p)
      expect(r.answer_type).toBe('fill_in')
      let expected = 0
      for (let size = 1; size <= Math.min(p.cols, p.rows); size++) {
        expected += (p.cols - size + 1) * (p.rows - size + 1)
      }
      expect(r.answer).toBe(String(expected))
      expect(r.answer).toBe(String(rectangleCount(p)))
      expect(r.body_en).toContain('squares of any size')
    }
  })

  test('known square counts include composite squares', () => {
    expect(rectangleCount({ cols: 2, rows: 2 })).toBe(5)
    expect(rectangleCount({ cols: 3, rows: 3 })).toBe(14)
    expect(rectangleCount({ cols: 4, rows: 3 })).toBe(20)
  })
})
