import { describe, test, expect } from 'vitest'
import { buildCompareSteps, type CompareParams } from './compareSteps'

const PARAMS: CompareParams = {
  target: 12,
  exprs: [
    { op: '+', x: 5, y: 8 }, // 13
    { op: '+', x: 4, y: 8 }, // 12  <- match (B)
    { op: '-', x: 20, y: 9 }, // 11
    { op: '-', x: 18, y: 4 }, // 14
  ],
}

describe('buildCompareSteps', () => {
  test('evaluates each option and flags the one matching the target', () => {
    const s = buildCompareSteps(PARAMS, 'en')
    expect(s.rows.map((r) => r.value)).toEqual([13, 12, 11, 14])
    expect(s.rows.filter((r) => r.match).length).toBe(1)
    expect(s.answer).toBe('B')
  })

  test('reveal is ordered: 0 evaluated, then 1..4, then spotlight result', () => {
    const s = buildCompareSteps(PARAMS, 'en')
    expect(s.steps[0].evaluated).toBe(0)
    expect(s.steps.map((x) => x.evaluated)).toEqual([0, 1, 2, 3, 4, 4])
    const last = s.steps[s.finalIndex]
    expect(last.result).toBe(true)
    expect(last.spotlight).toBe(true)
    expect(last.caption).toContain('12')
    expect(last.caption).toContain('B')
  })

  test('language selects the opening caption', () => {
    expect(buildCompareSteps(PARAMS, 'en').steps[0].caption).toContain('which')
    expect(buildCompareSteps(PARAMS, 'id').steps[0].caption).toContain('mana')
  })

  test('does not throw on stale/mismatched params (missing exprs)', () => {
    // Mirrors the proofreading-page race where a different concept's params
    // briefly reach this explainer. Must degrade, not crash.
    const stale = { mode: 'sum-list', a: 1, b: 2 } as unknown as CompareParams
    expect(() => buildCompareSteps(stale, 'en')).not.toThrow()
    const s = buildCompareSteps(stale, 'en')
    expect(s.rows).toEqual([])
    expect(s.steps.length).toBeGreaterThan(0)
  })
})
