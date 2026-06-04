import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { evalSigns } from './index.js'

describe('operator-fill', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: target >= 0, exactly one option hits target, answer points to it', () => {
    const positions = new Set<string>()
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      expect(p.target).toBeGreaterThanOrEqual(0)
      const hits = p.options.filter((s) => evalSigns(p.nums, s) === p.target)
      expect(hits).toHaveLength(1)
      const r = concept.render(p)
      const idx = ['A', 'B', 'C', 'D'].indexOf(r.answer)
      expect(evalSigns(p.nums, p.options[idx])).toBe(p.target)
      positions.add(r.answer)
    }
    expect(positions.size).toBeGreaterThan(1)
  })
})
