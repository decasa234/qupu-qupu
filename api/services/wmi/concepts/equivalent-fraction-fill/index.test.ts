import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept from './index.js'

describe('equivalent-fraction-fill', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(11))).toEqual(concept.generate(mulberry32(11)))
  })

  test('100 seeds: question uses "?" (never the □ square), and the answer scales the numerator', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      const r = concept.render(p)
      // No square glyph anywhere in the question text.
      expect(r.body_en).not.toContain('□')
      expect(r.body_id).not.toContain('□')
      expect(r.body_en).toContain('?/')
      expect(r.body_id).toContain('?/')
      // Equivalent fraction: numerator × m.
      expect(r.answer).toBe(String(p.num * p.m))
      expect(r.answer_type).toBe('fill_in')
    }
  })
})
