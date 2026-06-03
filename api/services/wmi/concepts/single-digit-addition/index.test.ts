import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept from './index.js'

describe('single-digit-addition', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: params valid + answer = a + b', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      const r = concept.render(p)
      expect(r.answer_type).toBe('fill_in')
      expect(r.answer).toBe(String(p.a + p.b))
    }
  })

  test('grades include 1 and 2', () => {
    expect(concept.meta.grades).toContain(1)
    expect(concept.meta.grades).toContain(2)
  })
})
