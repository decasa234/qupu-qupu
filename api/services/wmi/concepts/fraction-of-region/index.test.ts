import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { unshaded } from './index.js'

describe('fraction-of-region', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: shaded < parts, fill_in, answer = parts - shaded', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      expect(p.shaded).toBeLessThan(p.parts)
      expect(p.shaded).toBeGreaterThanOrEqual(1)
      const r = concept.render(p)
      expect(r.answer_type).toBe('fill_in')
      expect(r.answer).toBe(String(unshaded(p)))
      expect(r.answer).toBe(String(p.parts - p.shaded))
    }
  })
})
