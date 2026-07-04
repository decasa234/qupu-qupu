import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { result } from './index.js'

describe('common-factor-shortcut', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: a*c + b*c === (a+b)*c === render().answer, and highlights are substrings', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()

      const { a, b, c } = p
      // a !== b keeps the two term highlights ("a × c" / "b × c") distinct.
      expect(a).not.toBe(b)
      const distributed = a * c + b * c
      const factored = (a + b) * c
      expect(distributed).toBe(factored)
      expect(factored).toBe(result(p))

      const r = concept.render(p)
      expect(r.answer_type).toBe('fill_in')
      expect(Number(r.answer)).toBe(distributed)
      expect(Number(r.answer)).toBe(factored)

      const facts = (r.breakdown?.highlights ?? []).filter((h) => h.category === 'fact')
      // the two fact highlights must be distinct phrases (else one is unreachable)
      expect(new Set(facts.map((h) => h.phrase_en)).size).toBe(facts.length)
      for (const h of r.breakdown?.highlights ?? []) {
        expect(r.body_en).toContain(h.phrase_en)
        expect(r.body_id).toContain(h.phrase_id)
      }
    }
  })
})
