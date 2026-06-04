import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept from './index.js'

const digitSum = (n: number) => Math.floor(n / 10) + (n % 10)

describe('which-might-be', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: exactly one option fits all clues, answer points to it', () => {
    const positions = new Set<string>()
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      const fits = (n: number) => n % 2 === 1 && n > p.lo && n < p.hi && digitSum(n) === p.k
      const matches = p.options.filter(fits)
      expect(matches).toHaveLength(1)
      const r = concept.render(p)
      const idx = ['A', 'B', 'C', 'D'].indexOf(r.answer)
      expect(fits(p.options[idx])).toBe(true)
      positions.add(r.answer)
    }
    expect(positions.size).toBeGreaterThan(1)
  })
})
