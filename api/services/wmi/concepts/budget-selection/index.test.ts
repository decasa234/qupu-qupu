import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { bestAffordable } from './index.js'

describe('budget-selection', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: at least one affordable, answer = priciest within budget', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      const affordable = p.prices.filter((x) => x <= p.budget)
      expect(affordable.length).toBeGreaterThanOrEqual(1)
      const r = concept.render(p)
      expect(r.answer_type).toBe('fill_in')
      expect(r.answer).toBe(String(Math.max(...affordable)))
      expect(r.answer).toBe(String(bestAffordable(p)))
    }
  })
})
