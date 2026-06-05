import { describe, test, expect } from 'vitest'
import { buildClockAfterSteps } from './clockAfterSteps'

describe('buildClockAfterSteps', () => {
  test('wrap case: hour 10 + add 5 = result 3', () => {
    const sb = buildClockAfterSteps(10, 5, 'en')
    expect(sb.result).toBe(3)
    expect(sb.hour).toBe(10)
    expect(sb.add).toBe(5)
  })

  test('no-wrap case: hour 2 + add 3 = result 5', () => {
    const sb = buildClockAfterSteps(2, 3, 'en')
    expect(sb.result).toBe(5)
    expect(sb.hour).toBe(2)
    expect(sb.add).toBe(3)
  })

  test('phases run show -> add -> wrap -> result (4 phases in order)', () => {
    const sb = buildClockAfterSteps(10, 5, 'en')
    expect(sb.steps.map((s) => s.phase)).toEqual(['show', 'add', 'wrap', 'result'])
  })

  test('last step has result:true and contains the result hour in caption', () => {
    const sb = buildClockAfterSteps(10, 5, 'en')
    const last = sb.steps[sb.finalIndex]
    expect(last.result).toBe(true)
    expect(last.caption).toContain('3')
    expect(sb.finalIndex).toBe(sb.steps.length - 1)
  })

  test('language switch: id contains "Jam", en contains "clock"', () => {
    const id = buildClockAfterSteps(2, 3, 'id')
    const en = buildClockAfterSteps(2, 3, 'en')
    expect(id.steps[0].caption).toContain('Jam')
    expect(en.steps[0].caption).toContain('clock')
  })

  test('wrap caption contains wrap suffix in en', () => {
    const sb = buildClockAfterSteps(10, 5, 'en')
    const wrapStep = sb.steps.find((s) => s.phase === 'wrap')!
    expect(wrapStep.caption).toContain('start again from 1')
  })

  test('no-wrap caption does not contain wrap suffix', () => {
    const sb = buildClockAfterSteps(2, 3, 'en')
    const wrapStep = sb.steps.find((s) => s.phase === 'wrap')!
    expect(wrapStep.caption).not.toContain('start again from 1')
  })

  test('wrap suffix in id language', () => {
    const sb = buildClockAfterSteps(10, 5, 'id')
    const wrapStep = sb.steps.find((s) => s.phase === 'wrap')!
    expect(wrapStep.caption).toContain('lewat 12 mulai lagi dari 1')
  })

  test('result step contains the result value (no-wrap case)', () => {
    const sb = buildClockAfterSteps(2, 3, 'en')
    const resultStep = sb.steps[sb.finalIndex]
    expect(resultStep.caption).toContain('5')
    expect(resultStep.result).toBe(true)
  })
})
