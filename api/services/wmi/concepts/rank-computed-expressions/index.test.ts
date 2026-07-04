import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept, { evalExpr } from './index.js'

function bruteForceEval(a: number, op: '+' | '-' | '×', b: number): number {
  if (op === '+') return a + b
  if (op === '-') return a - b
  return a * b
}

describe('rank-computed-expressions', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: answer is the argmax, values are distinct, choices well-formed, highlights are substrings of body', () => {
    const labels = ['A', 'B', 'C', 'D']
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()

      const values = p.exprs.map((e) => bruteForceEval(e.a, e.op, e.b))
      // independent recompute matches evalExpr
      p.exprs.forEach((e, i) => {
        expect(evalExpr(e)).toBe(values[i])
      })
      // values are distinct
      expect(new Set(values).size).toBe(4)

      // for '-' expressions the result must be positive (a > b)
      p.exprs.forEach((e) => {
        if (e.op === '-') expect(e.a).toBeGreaterThan(e.b)
        if (e.op === '×') expect(e.a).toBeLessThanOrEqual(12)
      })

      const r = concept.render(p)
      expect(r.answer_type).toBe('multiple_choice')
      expect(r.choices_en).not.toBeNull()
      expect(r.choices_en).toHaveLength(4)
      expect(r.choices_en!.map((c) => c.label)).toEqual(labels)
      expect(r.choices_id).toEqual(r.choices_en)

      const maxIdx = values.indexOf(Math.max(...values))
      expect(r.answer).toBe(labels[maxIdx])

      expect(r.breakdown).toBeTruthy()
      for (const h of r.breakdown!.highlights) {
        expect(r.body_en.includes(h.phrase_en)).toBe(true)
        expect(r.body_id.includes(h.phrase_id)).toBe(true)
      }
    }
  })

  test('worked example: 5+3, 20-15, 2×3, 4×4 -> max is 4x4=16 -> D', () => {
    const p = {
      exprs: [
        { a: 5, op: '+' as const, b: 3 },
        { a: 20, op: '-' as const, b: 15 },
        { a: 2, op: '×' as const, b: 3 },
        { a: 4, op: '×' as const, b: 4 },
      ],
    }
    const r = concept.render(p)
    expect(r.answer).toBe('D')
  })
})
