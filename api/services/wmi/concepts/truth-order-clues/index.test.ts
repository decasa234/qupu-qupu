import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { answer } from './index.js'

describe('truth-order-clues', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: 5 people, scrambled clues, answer is the head of the chain', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()

      // Five distinct people.
      expect(p.order).toHaveLength(5)
      expect(new Set(p.order).size).toBe(5)

      // clueOrder is a permutation of [0,1,2,3], never the giveaway identity order.
      expect([...p.clueOrder].sort((a, b) => a - b)).toEqual([0, 1, 2, 3])
      expect(p.clueOrder).not.toEqual([0, 1, 2, 3])

      const r = concept.render(p)
      expect(r.answer_type).toBe('fill_in')
      expect(r.answer).toBe(answer(p))
      expect(r.answer).toBe(p.order[0])
      // All four clue sentences appear in the question body.
      expect((r.body_en.match(/ is before /g) ?? []).length).toBe(4)
    }
  })

  test('worked example: chain Cody→Amy→Evan→Ben→Dina -> first is Cody', () => {
    const p = { order: ['Cody', 'Amy', 'Evan', 'Ben', 'Dina'] as const, clueOrder: [2, 0, 3, 1] }
    expect(answer(p as never)).toBe('Cody')
  })
})
