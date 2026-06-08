import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { bestTwo } from './index.js'

function bruteForceBestTwo(prices: number[], budget: number): number {
  let best = 0
  for (let i = 0; i < prices.length; i++) {
    for (let j = i + 1; j < prices.length; j++) {
      const s = prices[i] + prices[j]
      if (s <= budget && s > best) best = s
    }
  }
  return best
}

describe('budget-selection', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: answer is the biggest affordable PAIR, and the top pair never fits', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()

      const sorted = [...p.prices].sort((a, b) => a - b)
      const minPair = sorted[0] + sorted[1]
      const maxPair = sorted[2] + sorted[3]
      // at least one affordable pair (the two cheapest)...
      expect(minPair).toBeLessThanOrEqual(p.budget)
      // ...but the two most expensive must NOT both be affordable (forces a choice).
      expect(maxPair).toBeGreaterThan(p.budget)

      const r = concept.render(p)
      expect(r.answer_type).toBe('fill_in')
      expect(r.answer).toBe(String(bruteForceBestTwo(p.prices, p.budget)))
      expect(r.answer).toBe(String(bestTwo(p)))
      // The answer is a pair total, so at least the two cheapest.
      expect(Number(r.answer)).toBeGreaterThanOrEqual(minPair)
    }
  })

  test('worked example: prices 30,90,100,250 with budget 200 -> 190 (90+100)', () => {
    const p = { prices: [30, 90, 100, 250], budget: 200 }
    expect(bestTwo(p)).toBe(190)
  })
})
