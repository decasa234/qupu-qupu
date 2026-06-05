import { describe, test, expect } from 'vitest'
import { buildSubstituteSteps } from './substituteSteps'

describe('buildSubstituteSteps', () => {
  test('renders the rule def and the substituted expression', () => {
    const s = buildSubstituteSteps('mul-minus-b', 3, 5, '10', 'en')
    expect(s.def).toContain('◎')
    expect(s.sub).toBe('3 × 5 − 5')
    expect(s.answer).toBe('10')
  })

  test('all four formulas substitute correctly', () => {
    expect(buildSubstituteSteps('mul-plus-sum', 2, 4, '14', 'en').sub).toBe('2 × 4 + 2 + 4')
    expect(buildSubstituteSteps('double-first-plus', 3, 6, '12', 'en').sub).toBe('3 + 3 + 6')
    expect(buildSubstituteSteps('sum-times-two', 3, 5, '16', 'en').sub).toBe('(3 + 5) × 2')
  })

  test('final beat is the result, all lines shown, states the answer', () => {
    const s = buildSubstituteSteps('mul-minus-b', 3, 5, '10', 'en')
    const last = s.steps[s.finalIndex]
    expect(last.result).toBe(true)
    expect(last.showRule && last.showSub && last.showResult).toBe(true)
    expect(last.caption).toContain('10')
  })

  test('reveal is ordered: rule, then sub, then result', () => {
    const s = buildSubstituteSteps('mul-minus-b', 3, 5, '10', 'en')
    expect(s.steps[0].showRule).toBe(true)
    expect(s.steps[0].showSub).toBe(false)
    const firstSub = s.steps.findIndex((x) => x.showSub)
    const firstResult = s.steps.findIndex((x) => x.showResult)
    expect(firstSub).toBeGreaterThan(0)
    expect(firstResult).toBeGreaterThan(firstSub)
  })

  test('language selects caption text', () => {
    expect(buildSubstituteSteps('mul-minus-b', 3, 5, '10', 'en').steps[0].caption).toContain('rule')
    expect(buildSubstituteSteps('mul-minus-b', 3, 5, '10', 'id').steps[0].caption).toContain('aturan')
  })

  test('unknown formula falls back without throwing', () => {
    const s = buildSubstituteSteps('nope', 3, 5, '?', 'en')
    expect(s.steps.length).toBeGreaterThan(0)
  })
})
