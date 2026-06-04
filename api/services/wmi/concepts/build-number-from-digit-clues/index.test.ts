import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { targetNumber } from './index.js'

describe('build-number-from-digit-clues', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: fill_in, answer = built number ± k, never negative', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      const r = concept.render(p)
      expect(r.answer_type).toBe('fill_in')
      const v = targetNumber(p)
      expect(v).toBeGreaterThanOrEqual(0)
      expect(r.answer).toBe(String(v))
    }
  })

  test('mirrors the WMI example: ones 8, tens 7, 4 more -> 82', () => {
    expect(concept.render({ tens: 7, units: 8, k: 4, dir: 'more' }).answer).toBe('82')
  })
})
