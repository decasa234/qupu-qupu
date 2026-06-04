import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept from './index.js'

describe('divisibility-multiple-property', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: exactly one option is a multiple of d, answer points to it, positions vary', () => {
    const positions = new Set<string>()
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      const multiples = p.options.filter((n) => n % p.d === 0)
      expect(multiples).toHaveLength(1)
      const r = concept.render(p)
      expect(r.answer_type).toBe('multiple_choice')
      const idx = ['A', 'B', 'C', 'D'].indexOf(r.answer)
      expect(p.options[idx] % p.d).toBe(0)
      positions.add(r.answer)
    }
    expect(positions.size).toBeGreaterThan(1)
  })
})
