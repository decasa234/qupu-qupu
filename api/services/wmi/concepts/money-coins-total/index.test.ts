import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { total } from './index.js'

describe('money-coins-total', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: fill_in, answer = sum of coin values, coins from {1,5,10,25}', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      expect(p.coins.every((v) => [1, 5, 10, 25].includes(v))).toBe(true)
      const r = concept.render(p)
      expect(r.answer_type).toBe('fill_in')
      expect(r.answer).toBe(String(total(p)))
    }
  })
})
