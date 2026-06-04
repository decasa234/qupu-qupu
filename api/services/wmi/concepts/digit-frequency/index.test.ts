import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { countDigit } from './index.js'

describe('digit-frequency', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: fill_in, answer = digit occurrences across the range', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      expect(p.b).toBeGreaterThan(p.a)
      const r = concept.render(p)
      expect(r.answer_type).toBe('fill_in')
      expect(r.answer).toBe(String(countDigit(p.a, p.b, p.d)))
    }
  })

  test('known case: digit 1 from 1 to 12 appears 5 times (1,10,11×2,12)', () => {
    expect(countDigit(1, 12, 1)).toBe(5)
  })
})
