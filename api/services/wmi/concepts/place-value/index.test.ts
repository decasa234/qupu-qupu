import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept from './index.js'

describe('place-value', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(17))).toEqual(concept.generate(mulberry32(17)))
  })

  test('100 seeds: n in [10,99], answer = tens digit * 10', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      const tens = Math.floor(p.n / 10) * 10
      const r = concept.render(p)
      const answerChoice = (r.choices_en ?? []).find((c) => c.label === r.answer)
      expect(answerChoice?.text).toBe(String(tens))
    }
  })
})
