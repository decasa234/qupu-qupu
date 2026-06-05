import { describe, test, expect } from 'vitest'
import { buildMoreLessSteps } from './moreLessSteps'

describe('buildMoreLessSteps', () => {
  test('more: answer is x + k', () => {
    const sb = buildMoreLessSteps(30, 10, 'more', 'en')
    expect(sb.answer).toBe(40)
  })

  test('less: answer is x - k', () => {
    const sb = buildMoreLessSteps(50, 15, 'less', 'en')
    expect(sb.answer).toBe(35)
  })

  test('lo >= 0 and lo <= min(x, answer)', () => {
    const sb = buildMoreLessSteps(20, 8, 'more', 'en')
    expect(sb.lo).toBeGreaterThanOrEqual(0)
    expect(sb.lo).toBeLessThanOrEqual(Math.min(sb.x, sb.answer))
  })

  test('lo >= 0 even when x - k - margin would go negative', () => {
    const sb = buildMoreLessSteps(10, 8, 'less', 'en')
    expect(sb.lo).toBeGreaterThanOrEqual(0)
  })

  test('hi >= max(x, answer)', () => {
    const sb = buildMoreLessSteps(30, 12, 'more', 'en')
    expect(sb.hi).toBeGreaterThanOrEqual(Math.max(sb.x, sb.answer))
  })

  test('4 phases in order: start, hop, land, result', () => {
    const sb = buildMoreLessSteps(40, 20, 'more', 'en')
    expect(sb.steps.map((s) => s.phase)).toEqual(['start', 'hop', 'land', 'result'])
  })

  test('last step has result:true and caption contains answer', () => {
    const sb = buildMoreLessSteps(60, 25, 'more', 'en')
    const last = sb.steps[sb.finalIndex]
    expect(last.result).toBe(true)
    expect(last.caption).toContain(String(sb.answer))
  })

  test('finalIndex is steps.length - 1', () => {
    const sb = buildMoreLessSteps(100, 30, 'less', 'en')
    expect(sb.finalIndex).toBe(sb.steps.length - 1)
  })

  test('language switch: id uses "Mulai"', () => {
    const sb = buildMoreLessSteps(50, 10, 'more', 'id')
    expect(sb.steps[0].caption).toContain('Mulai')
  })

  test('language switch: en uses "Start"', () => {
    const sb = buildMoreLessSteps(50, 10, 'more', 'en')
    expect(sb.steps[0].caption).toContain('Start')
  })

  test('language switch: id hop uses "lebih" for more', () => {
    const sb = buildMoreLessSteps(30, 5, 'more', 'id')
    expect(sb.steps[1].caption).toContain('lebih')
  })

  test('language switch: id hop uses "kurang" for less', () => {
    const sb = buildMoreLessSteps(30, 5, 'less', 'id')
    expect(sb.steps[1].caption).toContain('kurang')
  })

  test('language switch: en hop uses "more"/"forward" for more direction', () => {
    const sb = buildMoreLessSteps(30, 5, 'more', 'en')
    expect(sb.steps[1].caption).toContain('more')
    expect(sb.steps[1].caption).toContain('forward')
  })

  test('language switch: en hop uses "less"/"back" for less direction', () => {
    const sb = buildMoreLessSteps(30, 5, 'less', 'en')
    expect(sb.steps[1].caption).toContain('less')
    expect(sb.steps[1].caption).toContain('back')
  })
})
