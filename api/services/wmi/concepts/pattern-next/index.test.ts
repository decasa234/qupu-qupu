import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept from './index.js'

describe('pattern-next', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(3))).toEqual(concept.generate(mulberry32(3)))
  })

  test('100 seeds: sequence is arithmetic, answer label is in choices', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      const expected = p.start + 3 * p.step
      const r = concept.render(p)
      expect(r.answer_type).toBe('multiple_choice')
      const labels = (r.choices_en ?? []).map((c) => c.label)
      expect(new Set(labels).size).toBe(labels.length)
      expect(labels).toContain(r.answer)
      const answerChoice = (r.choices_en ?? []).find((c) => c.label === r.answer)
      expect(answerChoice?.text).toBe(String(expected))
    }
  })
})
