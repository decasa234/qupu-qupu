import { describe, test, expect } from 'vitest'
import { buildDigitFrequencySteps } from './digitFrequencySteps'

describe('buildDigitFrequencySteps', () => {
  test('answer is correct for a known case: digit 1 in 1..12 = 5', () => {
    // 1 appears in: 1(x1), 10(x1), 11(x2), 12(x1) → 5 total
    const sb = buildDigitFrequencySteps(1, 12, 1, 'en')
    expect(sb.answer).toBe(5)
  })

  test('numbers array length equals b - a + 1', () => {
    const sb = buildDigitFrequencySteps(7, 30, 2, 'en')
    expect(sb.numbers.length).toBe(30 - 7 + 1)
    expect(sb.numbers[0]).toBe(7)
    expect(sb.numbers[sb.numbers.length - 1]).toBe(30)
  })

  test('4 phases in order: range, find, count, result', () => {
    const sb = buildDigitFrequencySteps(1, 10, 1, 'en')
    expect(sb.steps.map((s) => s.phase)).toEqual(['range', 'find', 'count', 'result'])
  })

  test('last step has result:true and caption containing the answer', () => {
    const sb = buildDigitFrequencySteps(1, 12, 1, 'en')
    const last = sb.steps[sb.finalIndex]
    expect(last.result).toBe(true)
    expect(last.caption).toContain(String(sb.answer))
    expect(sb.finalIndex).toBe(sb.steps.length - 1)
  })

  test('language switch: id uses "Tulis", en uses "Write"', () => {
    const sbId = buildDigitFrequencySteps(1, 10, 1, 'id')
    expect(sbId.steps[0].caption).toContain('Tulis')

    const sbEn = buildDigitFrequencySteps(1, 10, 1, 'en')
    expect(sbEn.steps[0].caption).toContain('Write')
  })

  test('answer for a=7,b=30,d=2 is correct', () => {
    // 2, 12, 20, 21, 22(x2), 23, 24, 25, 26, 27, 28, 29 → count carefully
    const sb = buildDigitFrequencySteps(7, 30, 2, 'en')
    // manual count: 12→1, 20→1, 21→1, 22→2, 23→1, 24→1, 25→1, 26→1, 27→1, 28→1, 29→1 = 12
    expect(sb.answer).toBe(12)
  })
})
