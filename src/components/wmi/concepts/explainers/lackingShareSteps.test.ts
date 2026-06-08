import { describe, test, expect } from 'vitest'
import { buildLackingShareSteps } from './lackingShareSteps'

describe('buildLackingShareSteps', () => {
  test('price = lackA + lackB and answer = lackB', () => {
    const sb = buildLackingShareSteps('Ani', 'Budi', 5, 7, 'en')
    expect(sb.price).toBe(12)
    expect(sb.answer).toBe(7)
    expect(sb.lackA).toBe(5)
    expect(sb.lackB).toBe(7)
  })

  test('has exactly 4 phases in order: setup, price, solve, result', () => {
    const sb = buildLackingShareSteps('Ani', 'Budi', 5, 7, 'en')
    expect(sb.steps).toHaveLength(4)
    expect(sb.steps.map((s) => s.phase)).toEqual(['setup', 'price', 'solve', 'result'])
  })

  test('last step has result:true and answer in caption', () => {
    const sb = buildLackingShareSteps('Ani', 'Budi', 5, 7, 'en')
    const last = sb.steps[sb.finalIndex]
    expect(last.result).toBe(true)
    expect(last.caption).toContain(String(sb.answer))
    expect(sb.finalIndex).toBe(sb.steps.length - 1)
  })

  test('language switch: id captions contain "kurang", en captions contain "short"', () => {
    const sbId = buildLackingShareSteps('Ani', 'Budi', 5, 7, 'id')
    const sbEn = buildLackingShareSteps('Ani', 'Budi', 5, 7, 'en')
    expect(sbId.steps[0].caption).toContain('kurang')
    expect(sbEn.steps[0].caption).toContain('short')
  })

  test('id result step contains "punya"', () => {
    const sb = buildLackingShareSteps('Ani', 'Budi', 5, 7, 'id')
    const last = sb.steps[sb.finalIndex]
    expect(last.caption).toContain('punya')
  })

  test('price step contains the sum expression', () => {
    const sb = buildLackingShareSteps('Ani', 'Budi', 5, 7, 'en')
    const priceStep = sb.steps.find((s) => s.phase === 'price')!
    expect(priceStep.caption).toContain('5')
    expect(priceStep.caption).toContain('7')
    expect(priceStep.caption).toContain('12')
  })
})
