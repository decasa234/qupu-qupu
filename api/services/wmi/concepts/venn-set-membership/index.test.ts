import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { answerSum } from './index.js'

describe('venn-set-membership', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: all numbers distinct across regions, answer = sum of A-only', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      const all = [...p.aOnly, ...p.both, ...p.bOnly]
      expect(new Set(all).size).toBe(all.length)
      const r = concept.render(p)
      expect(r.answer_type).toBe('fill_in')
      expect(r.answer).toBe(String(answerSum(p)))
      expect(r.answer).toBe(String(p.aOnly.reduce((s, n) => s + n, 0)))
    }
  })
})
