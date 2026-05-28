import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept from './index.js'

describe('shape-perimeter-square', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(13))).toEqual(concept.generate(mulberry32(13)))
  })

  test('100 seeds: side in [2,9], answer is 4*side, MC valid', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      expect(p.side).toBeGreaterThanOrEqual(2)
      expect(p.side).toBeLessThanOrEqual(9)
      const r = concept.render(p)
      const labels = (r.choices_en ?? []).map((c) => c.label)
      expect(new Set(labels).size).toBe(labels.length)
      expect(labels).toContain(r.answer)
      const answerChoice = (r.choices_en ?? []).find((c) => c.label === r.answer)
      expect(answerChoice?.text).toBe(String(p.side * 4))
    }
  })
})
