import { describe, test, expect } from 'vitest'
import { buildClockAfterSteps } from './clockAfterSteps'

describe('buildClockAfterSteps', () => {
  test('computes the result time with minute carry and hour wrap', () => {
    const sb = buildClockAfterSteps(10, 45, 2, 30, 'en') // 10:45 + 2h 30m → 1:15
    expect(sb.result).toEqual({ hour: 1, minute: 15 })
    expect(sb.resultStr).toBe('1:15')
    expect(sb.startStr).toBe('10:45')
    const last = sb.steps[sb.finalIndex]
    expect(last.result).toBe(true)
    expect(last.caption).toContain('1:15')
  })

  test('4 phases: show, minutes, hours, result; hands sweep forward', () => {
    const sb = buildClockAfterSteps(3, 0, 1, 15, 'en')
    expect(sb.steps.map((s) => s.phase)).toEqual(['show', 'minutes', 'hours', 'result'])
    // minute hand sweeps forward by addMin * 6 degrees on the 'minutes' beat
    expect(sb.steps[1].minAngle).toBe(sb.steps[0].minAngle + 15 * 6)
    // hour hand sweeps further forward on the 'hours' beat
    expect(sb.steps[2].hourAngle).toBeGreaterThan(sb.steps[1].hourAngle)
    expect(sb.finalIndex).toBe(3)
  })

  test('language switches the caption text', () => {
    expect(buildClockAfterSteps(3, 0, 1, 15, 'id').steps[0].caption).toContain('Jam menunjukkan')
    expect(buildClockAfterSteps(3, 0, 1, 15, 'en').steps[0].caption).toContain('clock shows')
  })
})
