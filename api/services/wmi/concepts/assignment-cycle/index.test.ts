import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { labelAt } from './index.js'

const LABELS = ['A', 'B', 'C', 'D', 'E']

describe('assignment-cycle', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: fill_in, answer = label at (n-1) mod cycle', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      const r = concept.render(p)
      expect(r.answer_type).toBe('fill_in')
      expect(r.answer).toBe(LABELS[(p.n - 1) % p.cycle])
      expect(r.answer).toBe(labelAt(p))
    }
  })

  test('known case: cycle 5, child 35 -> E', () => {
    expect(concept.render({ cycle: 5, n: 35 }).answer).toBe('E')
  })
})
