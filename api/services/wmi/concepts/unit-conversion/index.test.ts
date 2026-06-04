import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { answerValue } from './index.js'

describe('unit-conversion', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: all modes reachable, answer = big*factor + small', () => {
    const modes = new Set<string>()
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      modes.add(p.mode)
      const r = concept.render(p)
      expect(r.answer_type).toBe('fill_in')
      expect(r.answer).toBe(String(answerValue(p)))
    }
    expect(modes).toEqual(new Set(['m-cm', 'kg-g', 'dollar-cent']))
  })

  test('known case: 3 m 40 cm = 340 cm', () => {
    expect(concept.render({ mode: 'm-cm', big: 3, small: 40 }).answer).toBe('340')
  })
})
