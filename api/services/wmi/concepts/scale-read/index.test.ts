import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept from './index.js'

describe('scale-read', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: value is on a half-mark (×5, never ×10), strictly inside', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      expect(p.value).toBeGreaterThan(0)
      expect(p.value).toBeLessThan(p.max)
      expect(p.value % 5).toBe(0) // on a 5-mark
      expect(p.value % 10).toBe(5) // an odd multiple of 5 → never a numbered ×10 mark
      const r = concept.render(p)
      expect(r.answer_type).toBe('fill_in')
      expect(r.answer).toBe(String(p.value))
    }
  })
})
