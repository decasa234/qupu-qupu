import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { fmt } from './index.js'

describe('clock-read-time', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: MC, 4 distinct options incl. the correct time, answer points to it', () => {
    const positions = new Set<string>()
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      expect(new Set(p.options).size).toBe(4)
      const correct = fmt(p.hour, p.minute)
      expect(p.options).toContain(correct)
      const r = concept.render(p)
      expect(r.answer_type).toBe('multiple_choice')
      const idx = ['A', 'B', 'C', 'D'].indexOf(r.answer)
      expect(p.options[idx]).toBe(correct)
      positions.add(r.answer)
    }
    expect(positions.size).toBeGreaterThan(1)
  })
})
