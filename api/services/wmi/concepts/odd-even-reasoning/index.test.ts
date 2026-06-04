import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept from './index.js'

describe('odd-even-reasoning', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: exactly one option is odd, answer points to it, positions vary', () => {
    const positions = new Set<string>()
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      const odds = p.options.filter((o) => (o.x + o.y) % 2 === 1)
      expect(odds).toHaveLength(1)
      const r = concept.render(p)
      const idx = ['A', 'B', 'C', 'D'].indexOf(r.answer)
      expect((p.options[idx].x + p.options[idx].y) % 2).toBe(1)
      positions.add(r.answer)
    }
    expect(positions.size).toBeGreaterThan(1)
  })
})
