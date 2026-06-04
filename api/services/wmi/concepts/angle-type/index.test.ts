import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { categoryIndex } from './index.js'

describe('angle-type', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: MC, answer label matches the angle category', () => {
    const labelsSeen = new Set<string>()
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      const r = concept.render(p)
      expect(r.answer_type).toBe('multiple_choice')
      const expected = ['A', 'B', 'C'][categoryIndex(p.degrees)]
      expect(r.answer).toBe(expected)
      // sanity: category boundaries
      if (p.degrees < 90) expect(r.answer).toBe('A')
      else if (p.degrees === 90) expect(r.answer).toBe('B')
      else expect(r.answer).toBe('C')
      labelsSeen.add(r.answer)
    }
    expect(labelsSeen.size).toBe(3)
  })
})
