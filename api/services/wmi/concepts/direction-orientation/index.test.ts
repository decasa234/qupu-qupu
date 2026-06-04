import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { finalIndex } from './index.js'

const LABELS = ['A', 'B', 'C', 'D']

describe('direction-orientation', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: MC, answer label matches the final compass direction', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      const r = concept.render(p)
      expect(r.answer_type).toBe('multiple_choice')
      expect(r.answer).toBe(LABELS[finalIndex(p)])
      expect(r.answer).toBe(LABELS[(p.start + p.turns) % 4])
    }
  })

  test('known case: facing North, 2 quarter-turns clockwise -> South (label C)', () => {
    expect(concept.render({ start: 0, turns: 2 }).answer).toBe('C')
  })
})
