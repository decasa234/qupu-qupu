import { describe, test, expect } from 'vitest'
import { buildWeightShareSteps } from './weightShareSteps'

describe('buildWeightShareSteps', () => {
  test('total, bottlesTotal, answer are correct for bottles=3, perBottle=200, sugar=100', () => {
    const sb = buildWeightShareSteps(3, 200, 100, 'en')
    expect(sb.total).toBe(700)
    expect(sb.bottlesTotal).toBe(600)
    expect(sb.answer).toBe(200)
  })

  test('passes back the input params', () => {
    const sb = buildWeightShareSteps(3, 200, 100, 'en')
    expect(sb.bottles).toBe(3)
    expect(sb.perBottle).toBe(200)
    expect(sb.sugar).toBe(100)
  })

  test('has exactly 4 phases: total -> subtract -> share -> result', () => {
    const sb = buildWeightShareSteps(3, 200, 100, 'en')
    expect(sb.steps).toHaveLength(4)
    expect(sb.steps.map((s) => s.phase)).toEqual(['total', 'subtract', 'share', 'result'])
  })

  test('last step has result:true and caption contains perBottle', () => {
    const sb = buildWeightShareSteps(3, 200, 100, 'en')
    const last = sb.steps[sb.finalIndex]
    expect(last.result).toBe(true)
    expect(last.caption).toContain('200')
    expect(sb.finalIndex).toBe(sb.steps.length - 1)
  })

  test('language switch: id uses "gula", en uses "sugar"', () => {
    const idSb = buildWeightShareSteps(3, 200, 100, 'id')
    const enSb = buildWeightShareSteps(3, 200, 100, 'en')
    expect(idSb.steps[0].caption).toContain('gula')
    expect(enSb.steps[0].caption).toContain('sugar')
  })

  test('id language: subtract step contains "Kurangi"', () => {
    const sb = buildWeightShareSteps(3, 200, 100, 'id')
    expect(sb.steps[1].caption).toContain('Kurangi')
  })

  test('en language: subtract step contains "Take away"', () => {
    const sb = buildWeightShareSteps(3, 200, 100, 'en')
    expect(sb.steps[1].caption).toContain('Take away')
  })
})
