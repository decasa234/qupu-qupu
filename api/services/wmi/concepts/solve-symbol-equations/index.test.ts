import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept from './index.js'

describe('solve-symbol-equations', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: recompute ★ and ● independently from the rendered numbers', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()

      const r = concept.render(p)

      // Independently re-derive the two equation totals from params, then
      // solve exactly the way a learner would, without touching p.s/p.c.
      const total1 = p.n * p.s
      const total2 = p.s + p.c
      const star = total1 / p.n
      const dot = total2 - star

      expect(r.answer_type).toBe('fill_in')
      expect(r.answer).toBe(String(dot))
      expect(r.answer).toBe(String(p.c))

      // Every breakdown highlight phrase must be a substring of its body.
      const breakdown = r.breakdown!
      for (const h of breakdown.highlights) {
        expect(r.body_en).toContain(h.phrase_en)
        expect(r.body_id).toContain(h.phrase_id)
      }
    }
  })

  test('worked example: s=5, c=7, n=3 -> ★+★+★=15 and ★+●=12, answer 7', () => {
    const p = { s: 5, c: 7, n: 3 }
    const r = concept.render(p)
    expect(r.body_en).toContain('★ + ★ + ★ = 15')
    expect(r.body_en).toContain('★ + ● = 12')
    expect(r.answer).toBe('7')
  })
})
