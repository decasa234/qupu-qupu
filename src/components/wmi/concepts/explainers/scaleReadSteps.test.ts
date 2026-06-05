import { describe, test, expect } from 'vitest'
import { buildScaleReadSteps } from './scaleReadSteps'

describe('buildScaleReadSteps', () => {
  test('lo/hi: value 47 → lo 40, hi 50', () => {
    const sb = buildScaleReadSteps(100, 47, 'en')
    expect(sb.lo).toBe(40)
    expect(sb.hi).toBe(50)
  })

  test('hi is clamped to max', () => {
    const sb = buildScaleReadSteps(45, 43, 'en')
    expect(sb.lo).toBe(40)
    expect(sb.hi).toBe(45)
  })

  test('produces exactly 4 phases in order: show → between → count → result', () => {
    const sb = buildScaleReadSteps(100, 47, 'en')
    expect(sb.steps).toHaveLength(4)
    expect(sb.steps.map((s) => s.phase)).toEqual(['show', 'between', 'count', 'result'])
  })

  test('last step has result:true and contains the value in the caption', () => {
    const sb = buildScaleReadSteps(100, 47, 'en')
    const last = sb.steps[sb.finalIndex]
    expect(last.result).toBe(true)
    expect(last.caption).toContain('47')
    expect(sb.finalIndex).toBe(sb.steps.length - 1)
  })

  test('language switch: id uses "panah", en uses "arrow"', () => {
    const id = buildScaleReadSteps(100, 47, 'id')
    const en = buildScaleReadSteps(100, 47, 'en')
    expect(id.steps[0].caption).toContain('panah')
    expect(en.steps[0].caption).toContain('arrow')
  })

  test('lo/hi for value on exact decade: value 30 → lo 30, hi 40', () => {
    const sb = buildScaleReadSteps(100, 30, 'en')
    expect(sb.lo).toBe(30)
    expect(sb.hi).toBe(40)
  })

  test('count step tick count in caption', () => {
    const sb = buildScaleReadSteps(50, 47, 'en')
    // 47 - 40 = 7
    expect(sb.steps[2].caption).toContain('7')
    expect(sb.steps[2].caption).toContain('40')
  })

  test('between step includes lo and hi values', () => {
    const sb = buildScaleReadSteps(100, 23, 'en')
    expect(sb.steps[1].caption).toContain('20')
    expect(sb.steps[1].caption).toContain('30')
  })
})
