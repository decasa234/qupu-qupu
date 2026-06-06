import { describe, test, expect } from 'vitest'
import { buildScaleReadSteps } from './scaleReadSteps'

describe('buildScaleReadSteps', () => {
  test('lo/hi: value 45 → lo 40, hi 50; value is the halfway mark', () => {
    const sb = buildScaleReadSteps(50, 45, 'en')
    expect(sb.lo).toBe(40)
    expect(sb.hi).toBe(50)
    expect(sb.lo + 5).toBe(sb.value)
  })

  test('4 phases: show, between, half, result; last is the result', () => {
    const sb = buildScaleReadSteps(50, 25, 'en')
    expect(sb.steps.map((s) => s.phase)).toEqual(['show', 'between', 'half', 'result'])
    expect(sb.steps[2].caption).toContain('25')
    const last = sb.steps[sb.finalIndex]
    expect(last.result).toBe(true)
    expect(last.caption).toContain('25')
  })

  test('language switches the caption text', () => {
    expect(buildScaleReadSteps(50, 45, 'id').steps[1].caption).toContain('antara')
    expect(buildScaleReadSteps(50, 45, 'en').steps[1].caption).toContain('between')
  })
})
