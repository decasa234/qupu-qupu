import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { buildMapping, solutions, type Params } from './index.js'

describe('cryptarithmetic-addition', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: unique solution, reproduces the sum, and answer matches the asked letter', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()

      // Exactly one valid letter->digit assignment.
      const sols = solutions(p)
      expect(sols.length).toBe(1)
      const sol = sols[0]

      const m = buildMapping(p.addend1, p.addend2)
      // The unique solution reproduces the original digits.
      const value = (word: string) =>
        word.split('').reduce((acc, ch) => acc * 10 + sol[ch], 0)
      expect(value(m.wordA)).toBe(p.addend1)
      expect(value(m.wordB)).toBe(p.addend2)
      expect(value(m.wordS)).toBe(p.addend1 + p.addend2)
      expect(p.addend1 + p.addend2).toBe(m.sum)

      const r = concept.render(p)
      expect(r.answer_type).toBe('fill_in')
      // render().answer equals the asked digit...
      expect(r.answer).toBe(String(p.askDigit))
      // ...and equals the solution's digit for the asked letter.
      const askLetter = m.digitToLetter[String(p.askDigit)]
      expect(sol[askLetter]).toBe(p.askDigit)
      expect(String(sol[askLetter])).toBe(r.answer)

      // Every breakdown highlight phrase is a substring of the matching body.
      const bd = r.breakdown!
      for (const h of bd.highlights) {
        expect(r.body_en).toContain(h.phrase_en)
        expect(r.body_id).toContain(h.phrase_id)
      }
    }
  })

  test('worked example: 11 + 89 = 100 -> AA + BC = ADD, letter B is 8', () => {
    const p: Params = { addend1: 11, addend2: 89, askDigit: 8 }
    const m = buildMapping(11, 89)
    expect(m.wordA).toBe('AA')
    expect(m.wordB).toBe('BC')
    expect(m.wordS).toBe('ADD')

    const sols = solutions(p)
    expect(sols.length).toBe(1)
    expect(sols[0]).toEqual({ A: 1, B: 8, C: 9, D: 0 })

    const r = concept.render(p)
    // askDigit 8 maps to letter B
    expect(m.digitToLetter['8']).toBe('B')
    expect(r.answer).toBe('8')
    expect(r.body_en).toContain('AA + BC = ADD')
  })
})
