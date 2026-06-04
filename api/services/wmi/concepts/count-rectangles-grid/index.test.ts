import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { rectangleCount } from './index.js'

describe('count-rectangles-grid', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: fill_in, answer = C(cols+1,2)*C(rows+1,2)', () => {
    const c2 = (n: number) => (n * (n - 1)) / 2
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      const r = concept.render(p)
      expect(r.answer_type).toBe('fill_in')
      expect(r.answer).toBe(String(c2(p.cols + 1) * c2(p.rows + 1)))
      expect(r.answer).toBe(String(rectangleCount(p)))
    }
  })

  test('known: 2x2 grid -> 9 rectangles', () => {
    expect(rectangleCount({ cols: 2, rows: 2 })).toBe(9)
  })
})
