import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { applyFormula } from './index.js'

describe('custom-operation', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: fill_in, answer = formula applied to (c, d)', () => {
    const formulas = new Set<string>()
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      formulas.add(p.formula)
      const r = concept.render(p)
      expect(r.answer_type).toBe('fill_in')
      expect(r.answer).toBe(String(applyFormula(p.formula, p.c, p.d)))
    }
    // all defined formulas are exercised across seeds
    expect(formulas.size).toBe(4)
  })
})
