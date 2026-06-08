import { describe, test, expect } from 'vitest'
import { buildMoreLessSteps } from './moreLessSteps'

describe('buildMoreLessSteps', () => {
  test('more with carry regroups 10 ones into a ten', () => {
    const sb = buildMoreLessSteps(48, 15, 'more', 'en')
    expect(sb.answer).toBe(63)
    expect(sb.steps.map((s) => s.phase)).toContain('regroup')
    const last = sb.steps[sb.finalIndex]
    expect(last.result).toBe(true)
    expect(last.main).toEqual({ tens: 6, ones: 3 })
    expect(last.caption).toContain('63')
  })

  test('more without carry skips the regroup beat', () => {
    const sb = buildMoreLessSteps(23, 14, 'more', 'en')
    expect(sb.answer).toBe(37)
    expect(sb.steps.map((s) => s.phase)).not.toContain('regroup')
    expect(sb.steps[sb.finalIndex].main).toEqual({ tens: 3, ones: 7 })
  })

  test('less with borrow breaks a ten', () => {
    const sb = buildMoreLessSteps(42, 15, 'less', 'en')
    expect(sb.answer).toBe(27)
    expect(sb.steps.map((s) => s.phase)).toContain('borrow')
    expect(sb.steps[sb.finalIndex].main).toEqual({ tens: 2, ones: 7 })
  })

  test('less without borrow skips the break-a-ten beat', () => {
    const sb = buildMoreLessSteps(48, 15, 'less', 'en')
    expect(sb.answer).toBe(33)
    expect(sb.steps.map((s) => s.phase)).not.toContain('borrow')
    expect(sb.steps[sb.finalIndex].main).toEqual({ tens: 3, ones: 3 })
  })

  test('every non-result step has result:false and the last is result:true', () => {
    const sb = buildMoreLessSteps(48, 15, 'more', 'en')
    expect(sb.steps.slice(0, -1).every((s) => !s.result)).toBe(true)
    expect(sb.finalIndex).toBe(sb.steps.length - 1)
  })

  test('language switches the caption text', () => {
    expect(buildMoreLessSteps(48, 15, 'more', 'id').steps[0].caption).toContain('Mulai')
    expect(buildMoreLessSteps(48, 15, 'more', 'en').steps[0].caption).toContain('Start')
  })
})
