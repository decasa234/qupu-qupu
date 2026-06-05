import { describe, test, expect } from 'vitest'
import { buildFindMultipleSteps } from './findMultipleSteps'

describe('buildFindMultipleSteps', () => {
  test('every rule verdict matches true divisibility', () => {
    const cases: [number, number[]][] = [
      [5, [25, 31, 47, 62]],
      [3, [24, 31, 47, 50]],
      [9, [27, 31, 44, 50]],
      [4, [24, 31, 47, 50]],
      [6, [24, 31, 47, 50]],
    ]
    for (const [d, options] of cases) {
      const sb = buildFindMultipleSteps(d, options, 'en')
      sb.checks.forEach((c) => expect(c.pass).toBe(c.n % d === 0))
      expect(sb.correctIndex).toBe(options.findIndex((n) => n % d === 0))
    }
  })

  test('last-digit rules flagged for 2 and 5, not for 3', () => {
    expect(buildFindMultipleSteps(5, [25, 31, 47, 62], 'en').lastDigitRule).toBe(true)
    expect(buildFindMultipleSteps(3, [24, 31, 47, 50], 'en').lastDigitRule).toBe(false)
  })

  test('intro caption states the rule', () => {
    expect(buildFindMultipleSteps(5, [25, 31, 47, 62], 'en').steps[0].caption).toContain('0 or 5')
    expect(buildFindMultipleSteps(3, [24, 31, 47, 50], 'en').steps[0].caption).toContain('add up to a multiple of 3')
  })

  test('6 steps, checked 0,1,2,3,4,4; last is the result with the correct value', () => {
    const sb = buildFindMultipleSteps(5, [25, 31, 47, 62], 'en')
    expect(sb.steps.map((s) => s.checked)).toEqual([0, 1, 2, 3, 4, 4])
    const last = sb.steps[sb.finalIndex]
    expect(last.result).toBe(true)
    expect(last.caption).toContain('25')
    expect(sb.finalIndex).toBe(sb.steps.length - 1)
  })

  test('language switches the rule/caption text', () => {
    expect(buildFindMultipleSteps(5, [25, 31, 47, 62], 'id').steps[0].caption).toContain('Kelipatan')
    expect(buildFindMultipleSteps(5, [25, 31, 47, 62], 'en').steps[0].caption).toContain('Multiples')
  })
})
