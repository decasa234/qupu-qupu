import { describe, test, expect } from 'vitest'
import { buildSubstituteSteps, type SubParams } from './substituteSteps'

const P: SubParams = { formula: 'mul-minus-b', e1: 2, e2: 3, c: 3, d: 5 }

describe('buildSubstituteSteps', () => {
  test('renders the rule def, the example, and the substituted expression', () => {
    const s = buildSubstituteSteps(P, '10', 'en')
    expect(s.def).toContain('★')
    expect(s.exampleSub).toBe('2 × 3 − 3')
    expect(s.exampleVal).toBe(3) // 2×3 − 3
    expect(s.sub).toBe('3 × 5 − 5')
    expect(s.answer).toBe('10')
  })

  test('all four formulas substitute correctly', () => {
    expect(buildSubstituteSteps({ formula: 'mul-plus-sum', e1: 1, e2: 1, c: 2, d: 4 }, '14', 'en').sub).toBe('2 × 4 + 2 + 4')
    expect(buildSubstituteSteps({ formula: 'double-first-plus', e1: 1, e2: 1, c: 3, d: 6 }, '12', 'en').sub).toBe('3 + 3 + 6')
    expect(buildSubstituteSteps({ formula: 'sum-times-two', e1: 1, e2: 1, c: 3, d: 5 }, '16', 'en').sub).toBe('(3 + 5) × 2')
  })

  test('example value is the rule applied to the example numbers', () => {
    expect(buildSubstituteSteps({ formula: 'sum-times-two', e1: 2, e2: 3, c: 3, d: 5 }, '16', 'en').exampleVal).toBe(10)
    expect(buildSubstituteSteps({ formula: 'mul-plus-sum', e1: 2, e2: 4, c: 3, d: 5 }, '23', 'en').exampleVal).toBe(14)
  })

  test('final beat shows rule + example + sub + result and states the answer', () => {
    const s = buildSubstituteSteps(P, '10', 'en')
    const last = s.steps[s.finalIndex]
    expect(last.result).toBe(true)
    expect(last.showRule && last.showExample && last.showSub && last.showResult).toBe(true)
    expect(last.caption).toContain('10')
  })

  test('reveal order: rule, then example, then sub, then result', () => {
    const s = buildSubstituteSteps(P, '10', 'en')
    expect(s.steps[0].showRule).toBe(true)
    expect(s.steps[0].showExample).toBe(false)
    const fe = s.steps.findIndex((x) => x.showExample)
    const fs = s.steps.findIndex((x) => x.showSub)
    const fr = s.steps.findIndex((x) => x.showResult)
    expect(fe).toBeGreaterThan(0)
    expect(fs).toBeGreaterThan(fe)
    expect(fr).toBeGreaterThan(fs)
  })

  test('language selects caption text', () => {
    expect(buildSubstituteSteps(P, '10', 'en').steps[0].caption).toContain('rule')
    expect(buildSubstituteSteps(P, '10', 'id').steps[0].caption).toContain('aturan')
  })

  test('unknown formula falls back without throwing', () => {
    const s = buildSubstituteSteps({ formula: 'nope', e1: 1, e2: 2, c: 3, d: 5 }, '?', 'en')
    expect(s.steps.length).toBeGreaterThan(0)
  })

  test('does not throw on stale/mismatched params', () => {
    const stale = { target: 12, exprs: [] } as unknown as SubParams
    expect(() => buildSubstituteSteps(stale, 'x', 'en')).not.toThrow()
  })
})
