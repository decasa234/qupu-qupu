import { describe, test, expect } from 'vitest'
import { buildScaleReadSteps } from './scaleReadSteps'

describe('buildScaleReadSteps', () => {
  test('lo/hi/base5: value 47 → lo 40, hi 50, base5 45', () => {
    const sb = buildScaleReadSteps(50, 47, 'en')
    expect(sb.lo).toBe(40)
    expect(sb.hi).toBe(50)
    expect(sb.base5).toBe(45)
  })

  test('base5 is the nearest lower 5-mark; count is value − base5 (1..4)', () => {
    expect(buildScaleReadSteps(20, 13, 'en').base5).toBe(10) // count 3
    expect(buildScaleReadSteps(50, 8, 'en').base5).toBe(5) // count 3
    const sb = buildScaleReadSteps(50, 8, 'en')
    expect(sb.steps[2].caption).toContain('5')
    expect(sb.steps[2].caption).toContain('3')
  })

  test('4 phases in order; last is the result', () => {
    const sb = buildScaleReadSteps(50, 47, 'en')
    expect(sb.steps.map((s) => s.phase)).toEqual(['show', 'between', 'count', 'result'])
    const last = sb.steps[sb.finalIndex]
    expect(last.result).toBe(true)
    expect(last.caption).toContain('47')
  })

  test('language switches the caption text', () => {
    expect(buildScaleReadSteps(50, 47, 'id').steps[0].caption).toContain('panah')
    expect(buildScaleReadSteps(50, 47, 'en').steps[0].caption).toContain('arrow')
  })
})
