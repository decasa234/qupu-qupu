import { describe, test, expect } from 'vitest'
import { buildDigitFrequencySteps } from './digitFrequencySteps'

// brute-force reference count (the concept's own method)
function bruteCount(a: number, b: number, d: number): number {
  let c = 0
  for (let n = a; n <= b; n++) for (const ch of String(n)) if (ch === String(d)) c++
  return c
}

describe('buildDigitFrequencySteps', () => {
  test('ones + tens split equals the true brute-force count', () => {
    const cases: [number, number, number][] = [
      [1, 12, 1],
      [7, 30, 2],
      [5, 45, 3],
      [10, 60, 9],
      [1, 40, 4],
    ]
    for (const [a, b, d] of cases) {
      const sb = buildDigitFrequencySteps(a, b, d, 'en')
      expect(sb.onesCount + sb.tensCount).toBe(sb.answer)
      expect(sb.answer).toBe(bruteCount(a, b, d))
    }
  })

  test('known split: 7..30, d=2 → ones 2, tens 10, total 12', () => {
    const sb = buildDigitFrequencySteps(7, 30, 2, 'en')
    expect(sb.onesCount).toBe(2)
    expect(sb.tensCount).toBe(10)
    expect(sb.answer).toBe(12)
  })

  test('numbers covers a..b inclusive; 4 phases in order; last is the result', () => {
    const sb = buildDigitFrequencySteps(7, 30, 2, 'en')
    expect(sb.numbers).toHaveLength(30 - 7 + 1)
    expect(sb.steps.map((s) => s.phase)).toEqual(['rule', 'ones', 'tens', 'result'])
    const last = sb.steps[sb.finalIndex]
    expect(last.result).toBe(true)
    expect(last.caption).toContain('12')
  })

  test('language switches the rule + captions', () => {
    expect(buildDigitFrequencySteps(7, 30, 2, 'id').steps[0].caption).toContain('Jangan')
    expect(buildDigitFrequencySteps(7, 30, 2, 'en').steps[0].caption).toContain('one by one')
    expect(buildDigitFrequencySteps(7, 30, 2, 'id').ruleId).toContain('puluhan')
  })
})
