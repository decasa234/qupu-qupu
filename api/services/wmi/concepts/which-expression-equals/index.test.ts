import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { evalExpr } from './index.js'

describe('which-expression-equals', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: exactly one choice equals target, answer points to it, positions vary', () => {
    const positions = new Set<string>()
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      const matches = p.exprs.filter((e) => evalExpr(e) === p.target)
      expect(matches).toHaveLength(1)
      const r = concept.render(p)
      expect(r.answer_type).toBe('multiple_choice')
      const idx = ['A', 'B', 'C', 'D'].indexOf(r.answer)
      expect(evalExpr(p.exprs[idx])).toBe(p.target)
      positions.add(r.answer)
    }
    expect(positions.size).toBeGreaterThan(1)
  })
})
