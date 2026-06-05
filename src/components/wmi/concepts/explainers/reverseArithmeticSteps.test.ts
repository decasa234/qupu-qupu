import { describe, test, expect } from 'vitest'
import { buildReverseArithmeticSteps } from './reverseArithmeticSteps'

describe('buildReverseArithmeticSteps', () => {
  test('2-digit: base 10, number = 10 + r, digit-sum answer', () => {
    const sb = buildReverseArithmeticSteps(2, 27, 'en')
    expect([sb.base, sb.number, sb.answer]).toEqual([10, 37, 10])
    expect(sb.digits).toEqual([3, 7])
  })

  test('3-digit: base 100', () => {
    const sb = buildReverseArithmeticSteps(3, 137, 'en')
    expect([sb.base, sb.number, sb.answer]).toEqual([100, 237, 12])
    expect(sb.digits).toEqual([2, 3, 7])
  })

  test('phases run puzzle -> base -> flip -> number -> digits -> result', () => {
    const sb = buildReverseArithmeticSteps(2, 27, 'en')
    expect(sb.steps.map((s) => s.phase)).toEqual(['puzzle', 'base', 'flip', 'number', 'digits', 'result'])
    const last = sb.steps[sb.finalIndex]
    expect(last.result).toBe(true)
    expect(last.caption).toContain('10')
    expect(sb.finalIndex).toBe(sb.steps.length - 1)
  })

  test('language switches the caption text', () => {
    expect(buildReverseArithmeticSteps(2, 27, 'id').steps[0].caption).toContain('dikurangi')
    expect(buildReverseArithmeticSteps(2, 27, 'en').steps[0].caption).toContain('minus')
  })

  test('clamps the digit count to 2 or 3', () => {
    expect(buildReverseArithmeticSteps(5, 50, 'en').base).toBe(100)
    expect(buildReverseArithmeticSteps(1, 8, 'en').base).toBe(10)
  })
})
