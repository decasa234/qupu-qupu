import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { total, neededForDollar } from './index.js'

describe('money-coins-total', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: total stays under a dollar; answer = 100 − total (a real second step)', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      expect(p.coins.every((v) => [1, 5, 10, 25].includes(v))).toBe(true)

      const sum = total(p)
      expect(sum).toBeGreaterThanOrEqual(25)
      expect(sum).toBeLessThanOrEqual(95)

      const r = concept.render(p)
      expect(r.answer_type).toBe('fill_in')
      expect(r.answer).toBe(String(100 - sum))
      expect(r.answer).toBe(String(neededForDollar(p)))
      // The complement is a genuine subtraction, never zero.
      expect(Number(r.answer)).toBeGreaterThan(0)
    }
  })

  test('worked example: coins 25,25,10,5,1 total 66 -> need 34', () => {
    const p = { coins: [25, 25, 10, 5, 1] }
    expect(total(p)).toBe(66)
    expect(neededForDollar(p)).toBe(34)
  })
})
