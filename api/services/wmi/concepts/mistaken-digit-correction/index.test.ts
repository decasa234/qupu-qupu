import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept from './index.js'

describe('mistaken-digit-correction', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: wrong>right, fill_in, answer = correct sum, positive', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      expect(p.wrong).toBeGreaterThan(p.right)
      const r = concept.render(p)
      expect(r.answer_type).toBe('fill_in')
      expect(r.answer).toBe(String(p.correct))
      expect(p.correct).toBeGreaterThan(0)
    }
  })

  test('known case: misread units 8 instead of 3, got 2030 -> correct 2025', () => {
    const r = concept.render({ name: 'Zoey', right: 3, wrong: 8, place: 'units', correct: 2025 })
    expect(r.answer).toBe('2025')
    expect(r.body_en).toContain('2030') // got = 2025 + (8-3)
  })
})
