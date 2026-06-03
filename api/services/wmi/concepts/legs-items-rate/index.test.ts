import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept from './index.js'

const LEGS: Record<string, number> = { cat: 4, dog: 4, cow: 4, chicken: 2, duck: 2, spider: 8, ant: 6 }

describe('legs-items-rate', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: distinct kinds, fill_in, answer = sum of count*legs', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      expect(new Set(p.kinds).size).toBe(3)
      const r = concept.render(p)
      expect(r.answer_type).toBe('fill_in')
      const expected = p.kinds.reduce((s, k, i) => s + p.counts[i] * LEGS[k], 0)
      expect(r.answer).toBe(String(expected))
    }
  })

  test('unusual-leg animals get a clarifying note', () => {
    const r = concept.render({ kinds: ['cat', 'chicken', 'spider'], counts: [2, 3, 1] })
    expect(r.answer).toBe(String(2 * 4 + 3 * 2 + 1 * 8)) // 22
    expect(r.body_en).toContain('A spider has 8 legs.')
  })
})
