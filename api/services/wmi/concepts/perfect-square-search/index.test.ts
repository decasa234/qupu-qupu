import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { nextSquareAbove } from './index.js'

describe('perfect-square-search', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: answer is a perfect square, greater than n, and is the smallest such', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      const ans = Number(concept.render(p).answer)
      const root = Math.sqrt(ans)
      expect(Number.isInteger(root)).toBe(true)
      expect(ans).toBeGreaterThan(p.n)
      expect((root - 1) * (root - 1)).toBeLessThanOrEqual(p.n) // no smaller square above n
      expect(ans).toBe(nextSquareAbove(p.n))
    }
  })

  test('known cases', () => {
    expect(concept.render({ n: 50 }).answer).toBe('64')
    expect(concept.render({ n: 25 }).answer).toBe('36')
  })
})
