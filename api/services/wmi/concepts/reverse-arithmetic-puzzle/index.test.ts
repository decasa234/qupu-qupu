import { describe, test, expect } from 'vitest'
import { mulberry32 } from '../rng.js'
import concept from './index.js'

const digitSum = (n: number) => String(n).split('').reduce((s, c) => s + Number(c), 0)

describe('reverse-arithmetic-puzzle', () => {
  test('determinism', () => {
    expect(concept.generate(mulberry32(7))).toEqual(concept.generate(mulberry32(7)))
  })

  test('100 seeds: answer = digit sum of (smallest d-digit number + r)', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const p = concept.generate(mulberry32(seed))
      expect(() => concept.paramsSchema.parse(p)).not.toThrow()
      const base = p.d === 2 ? 10 : 100
      const r = concept.render(p)
      expect(r.answer_type).toBe('fill_in')
      expect(r.answer).toBe(String(digitSum(base + p.r)))
    }
  })

  test('known case mirrors the WMI example: subtract 10, result 8 -> number 18 -> digit sum 9', () => {
    expect(concept.render({ d: 2, r: 8 }).answer).toBe('9')
  })
})
