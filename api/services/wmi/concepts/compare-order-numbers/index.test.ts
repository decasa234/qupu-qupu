import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept from './index.js'

function chainIsTrue(text: string): boolean {
  const parts = text.split('>').map((s) => Number(s.trim()))
  return parts[0] > parts[1] && parts[1] > parts[2]
}

describe('compare-order-numbers', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: distinct params, exactly one true chain, answer points to it', () => {
    const answerPositions = new Set<string>()
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      const r = concept.render(p)
      expect(r.answer_type).toBe('multiple_choice')
      const choices = r.choices_en ?? []
      expect(choices).toHaveLength(4)
      const trueOnes = choices.filter((c) => chainIsTrue(c.text))
      expect(trueOnes).toHaveLength(1)
      const answerChoice = choices.find((c) => c.label === r.answer)
      expect(answerChoice && chainIsTrue(answerChoice.text)).toBe(true)
      answerPositions.add(r.answer)
    }
    // The correct answer is not pinned to a single label across the pool.
    expect(answerPositions.size).toBeGreaterThan(1)
  })
})
