import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { area } from './index.js'

describe('perimeter-area-composed', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: valid notch, fill_in, area = W*H - cw*ch (positive)', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      expect(p.cw).toBeLessThan(p.W)
      expect(p.ch).toBeLessThan(p.H)
      const r = concept.render(p)
      expect(r.answer_type).toBe('fill_in')
      expect(r.answer).toBe(String(area(p)))
      expect(area(p)).toBeGreaterThan(0)
    }
  })
})
