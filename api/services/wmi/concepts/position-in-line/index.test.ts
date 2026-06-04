import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { lineLength } from './index.js'

describe('position-in-line', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: fill_in, answer = fromFront + fromBack - 1', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      const r = concept.render(p)
      expect(r.answer_type).toBe('fill_in')
      expect(r.answer).toBe(String(lineLength(p)))
      expect(r.answer).toBe(String(p.fromFront + p.fromBack - 1))
    }
  })
})
