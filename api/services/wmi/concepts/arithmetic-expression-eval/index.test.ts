import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { evaluate } from './index.js'

describe('arithmetic-expression-eval', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: params valid, fill_in, answer = evaluated expression, non-negative', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      const r = concept.render(p)
      expect(r.answer_type).toBe('fill_in')
      expect(r.choices_en).toBeNull()
      const expected = evaluate(p)
      expect(expected).toBeGreaterThanOrEqual(0)
      expect(r.answer).toBe(String(expected))
    }
  })

  test('all three modes are reachable across seeds', () => {
    const modes = new Set<string>()
    for (let seed = 1; seed <= 100; seed++) modes.add(concept.generate(mulberry32(seed)).mode)
    expect(modes).toEqual(new Set(['sum-list', 'product-plus', 'product-diff']))
  })
})
