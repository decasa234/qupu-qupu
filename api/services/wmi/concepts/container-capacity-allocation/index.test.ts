import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { boxesNeeded } from './index.js'

describe('container-capacity-allocation', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: answer is the ceiling of total / capacity', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()

      // There must be a genuine leftover, so ceiling > floor.
      expect(p.total % p.capacity).not.toBe(0)

      const floor = Math.floor(p.total / p.capacity)
      const ceil = Math.ceil(p.total / p.capacity)
      expect(floor + 1).toBe(ceil)

      const r = concept.render(p)
      expect(r.answer_type).toBe('fill_in')
      expect(Number(r.answer)).toBe(ceil)
      expect(Number(r.answer)).toBe(boxesNeeded(p))

      for (const h of r.breakdown?.highlights ?? []) {
        expect(r.body_en).toContain(h.phrase_en)
        expect(r.body_id).toContain(h.phrase_id)
      }
    }
  })

  test('worked example: 20 eggs, boxes of 6 -> 4 boxes (3 remainder 2)', () => {
    const p = { total: 20, capacity: 6 }
    expect(boxesNeeded(p)).toBe(4)
  })
})
