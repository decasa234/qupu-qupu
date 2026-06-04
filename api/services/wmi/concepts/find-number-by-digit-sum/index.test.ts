import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { digitSum } from './index.js'

describe('find-number-by-digit-sum', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: exactly one option has digit sum k, answer points to it, positions vary', () => {
    const positions = new Set<string>()
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      const matches = p.options.filter((n) => digitSum(n) === p.k)
      expect(matches).toHaveLength(1)
      const r = concept.render(p)
      expect(r.answer_type).toBe('multiple_choice')
      const idx = ['A', 'B', 'C', 'D'].indexOf(r.answer)
      expect(digitSum(p.options[idx])).toBe(p.k)
      positions.add(r.answer)
    }
    expect(positions.size).toBeGreaterThan(1)
  })
})
