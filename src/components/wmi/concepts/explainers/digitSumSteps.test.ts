import { describe, test, expect } from 'vitest'
import { buildDigitSumSteps } from './digitSumSteps'

describe('buildDigitSumSteps', () => {
  test('derives the two digits and their sum', () => {
    const sb = buildDigitSumSteps(47, 'en')
    expect([sb.tens, sb.ones, sb.sum]).toEqual([4, 7, 11])
  })

  test('storyboard runs number -> tiles -> dots -> merge -> result', () => {
    const sb = buildDigitSumSteps(47, 'en')
    expect(sb.steps[0].showNumber).toBe(true)
    expect(sb.steps[1].showTiles).toBe(true)
    expect(sb.steps[2].showDots).toBe(true)
    expect(sb.steps[3].merged).toBe(true)
    const last = sb.steps[sb.finalIndex]
    expect(last.showResult).toBe(true)
    expect(last.result).toBe(true)
    expect(last.caption).toContain('11')
    expect(sb.finalIndex).toBe(sb.steps.length - 1)
    // step 0 shows only the number; later steps never re-show it
    expect(sb.steps[0].showTiles).toBe(false)
    for (let i = 1; i <= sb.finalIndex; i++) {
      expect(sb.steps[i].showNumber).toBe(false)
    }
  })

  test('language switches the caption text', () => {
    expect(buildDigitSumSteps(40, 'id').steps[0].caption).toContain('Ini bilangan 40')
    expect(buildDigitSumSteps(40, 'en').steps[0].caption).toContain('the number 40')
  })

  test('clamps out-of-range numbers to 10..99 and a zero ones-digit still sums', () => {
    expect(buildDigitSumSteps(7, 'en').n).toBe(10)
    expect(buildDigitSumSteps(150, 'en').n).toBe(99)
    expect(buildDigitSumSteps(40, 'en').sum).toBe(4)
  })
})
