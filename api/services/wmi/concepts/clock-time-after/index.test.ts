import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept from './index.js'

describe('clock-time-after', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: params valid, fill_in, answer is a 12-hour clock value', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      const r = concept.render(p)
      expect(r.answer_type).toBe('fill_in')
      const expected = ((p.hour - 1 + p.add) % 12) + 1
      expect(r.answer).toBe(String(expected))
      expect(expected).toBeGreaterThanOrEqual(1)
      expect(expected).toBeLessThanOrEqual(12)
    }
  })

  test('known case: 9 o’clock + 2 hours = 11', () => {
    expect(concept.render({ hour: 9, add: 2 }).answer).toBe('11')
  })

  test('wrap case: 11 o’clock + 3 hours = 2', () => {
    expect(concept.render({ hour: 11, add: 3 }).answer).toBe('2')
  })
})
