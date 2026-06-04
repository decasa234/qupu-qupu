import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { difference } from './index.js'

describe('bar-chart-compare', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: distinct values, fill_in, answer = max - min (positive)', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      const values = p.items.map((it) => it.value)
      expect(new Set(values).size).toBe(3)
      expect(p.items[p.iA].value).toBe(Math.max(...values))
      expect(p.items[p.iB].value).toBe(Math.min(...values))
      const r = concept.render(p)
      expect(r.answer_type).toBe('fill_in')
      expect(r.answer).toBe(String(difference(p)))
      expect(difference(p)).toBeGreaterThan(0)
    }
  })
})
