import { describe, test, expect } from 'vitest'
import { buildClockReadSteps } from './clockReadSteps'

describe('buildClockReadSteps', () => {
  test('timeStr pads minutes to 2 digits: 3:05', () => {
    const sb = buildClockReadSteps(3, 5, 'en')
    expect(sb.timeStr).toBe('3:05')
  })

  test('timeStr does not over-pad: 7:30', () => {
    const sb = buildClockReadSteps(7, 30, 'en')
    expect(sb.timeStr).toBe('7:30')
  })

  test('returns exactly 4 phases: show, hour, minute, result', () => {
    const sb = buildClockReadSteps(4, 15, 'en')
    expect(sb.steps).toHaveLength(4)
    expect(sb.steps.map((s) => s.phase)).toEqual(['show', 'hour', 'minute', 'result'])
  })

  test('last step has result:true and contains timeStr in caption', () => {
    const sb = buildClockReadSteps(10, 45, 'en')
    const last = sb.steps[sb.finalIndex]
    expect(last.result).toBe(true)
    expect(last.caption).toContain(sb.timeStr)
    expect(sb.finalIndex).toBe(sb.steps.length - 1)
  })

  test('language switch: id captions contain "jam"', () => {
    const sb = buildClockReadSteps(6, 0, 'id')
    // phase 'show' mentions "jam"
    expect(sb.steps[0].caption).toContain('jam')
    // phase 'hour' mentions "jam"
    expect(sb.steps[1].caption).toContain('jam')
    // result caption mentions "Waktunya"
    expect(sb.steps[3].caption).toContain('Waktunya')
  })

  test('language switch: en captions contain "clock" or "time"', () => {
    const sb = buildClockReadSteps(6, 0, 'en')
    expect(sb.steps[0].caption).toContain('clock')
    expect(sb.steps[3].caption).toContain('time')
  })

  test('storyboard exposes hour, minute, timeStr fields', () => {
    const sb = buildClockReadSteps(11, 5, 'en')
    expect(sb.hour).toBe(11)
    expect(sb.minute).toBe(5)
    expect(sb.timeStr).toBe('11:05')
  })
})
