import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept from './index.js'

describe('sum-partition-split', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: fill_in, total = (k+1)*small, answer = smaller share', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      const total = (p.k + 1) * p.small
      const r = concept.render(p)
      expect(r.answer_type).toBe('fill_in')
      expect(r.answer).toBe(String(p.small))
      expect(r.body_en).toContain(`share ${total} stickers`)
      // smaller + larger = total, larger = k * smaller
      expect(p.small + p.k * p.small).toBe(total)
    }
  })
})
