import { describe, test, expect } from 'vitest'
import { buildBarCompareSteps } from './barCompareSteps'

describe('buildBarCompareSteps', () => {
  test('diff is vA − vB and the final beat states it', () => {
    const s = buildBarCompareSteps('🍎', '🍓', 7, 3, 'en')
    expect(s.diff).toBe(4)
    const last = s.steps[s.finalIndex]
    expect(last.result).toBe(true)
    expect(last.showDiff).toBe(true)
    expect(last.caption).toContain('4')
  })

  test('reveal order: A, then B, then diff', () => {
    const s = buildBarCompareSteps('🍎', '🍓', 7, 3, 'en')
    expect(s.steps[0].showA && !s.steps[0].showB).toBe(true)
    expect(s.steps[1].showA && s.steps[1].showB && !s.steps[1].showDiff).toBe(true)
    expect(s.steps[2].showDiff).toBe(true)
  })

  test('language selects caption text', () => {
    expect(buildBarCompareSteps('🍎', '🍓', 7, 3, 'en').steps[0].caption).toContain('bar')
    expect(buildBarCompareSteps('🍎', '🍓', 7, 3, 'id').steps[0].caption).toContain('batang')
  })

  test('does not throw on missing values', () => {
    expect(() => buildBarCompareSteps('', '', undefined as unknown as number, undefined as unknown as number, 'en')).not.toThrow()
  })
})
