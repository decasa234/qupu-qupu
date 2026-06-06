import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept from './index.js'

describe('scale-read', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: value on an odd division, halfway between two numbered marks', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      expect(p.value).toBeGreaterThan(0)
      expect(p.value).toBeLessThan(p.max)
      const div = p.max / 10
      expect(p.value % div).toBe(0) // sits on a division of the question's grid
      expect((p.value / div) % 2).toBe(1) // an ODD division → never on a numbered mark
      const r = concept.render(p)
      expect(r.answer_type).toBe('fill_in')
      expect(r.answer).toBe(String(p.value))
    }
  })
})
