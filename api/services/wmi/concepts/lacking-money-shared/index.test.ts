import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept from './index.js'

describe('lacking-money-shared', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: distinct names, fill_in, answer = the other person’s shortfall', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      expect(p.nameA).not.toBe(p.nameB)
      const r = concept.render(p)
      expect(r.answer_type).toBe('fill_in')
      // price = lackA + lackB; A's money = price - lackA = lackB
      expect(r.answer).toBe(String(p.lackB))
    }
  })

  test('mirrors the WMI example: short 4 and 8, together enough -> A has 8', () => {
    expect(concept.render({ nameA: 'Jessica', nameB: 'Cindy', lackA: 4, lackB: 8 }).answer).toBe('8')
  })
})
