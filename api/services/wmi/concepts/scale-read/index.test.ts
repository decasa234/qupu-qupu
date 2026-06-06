import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept from './index.js'

describe('scale-read', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: value is strictly inside, never on a 5 or 10 mark', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      expect(p.value).toBeGreaterThan(0)
      expect(p.value).toBeLessThan(p.max)
      // never on a big (×10) tick, nor on a medium (×5) tick → always count small ticks
      expect(p.value % 10).not.toBe(0)
      expect(p.value % 5).not.toBe(0)
      const r = concept.render(p)
      expect(r.answer_type).toBe('fill_in')
      expect(r.answer).toBe(String(p.value))
    }
  })
})
