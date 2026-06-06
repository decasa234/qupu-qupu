import { describe, test, expect } from 'vitest'
import { buildScaleReadSteps } from './scaleReadSteps'

describe('buildScaleReadSteps', () => {
  test('lo/hi are the bounding numbered marks; value is exactly halfway', () => {
    const a = buildScaleReadSteps(50, 45, 'en') // div 5
    expect([a.lo, a.hi]).toEqual([40, 50])
    expect((a.lo + a.hi) / 2).toBe(a.value)
    const b = buildScaleReadSteps(20, 6, 'en') // div 2 (question numbers every 4)
    expect([b.lo, b.hi]).toEqual([4, 8])
    expect((b.lo + b.hi) / 2).toBe(b.value)
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
