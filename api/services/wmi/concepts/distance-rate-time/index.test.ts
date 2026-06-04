import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { answerValue } from './index.js'

describe('distance-rate-time', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: both modes reachable, answer matches the asked quantity', () => {
    const modes = new Set<string>()
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      modes.add(p.mode)
      const r = concept.render(p)
      expect(r.answer_type).toBe('fill_in')
      expect(r.answer).toBe(String(answerValue(p)))
      if (p.mode === 'distance') expect(r.answer).toBe(String(p.rate * p.t))
      else expect(r.answer).toBe(String(p.t))
    }
    expect(modes).toEqual(new Set(['distance', 'time']))
  })
})
