import { describe, test, expect } from 'vitest'
import { buildDrtSteps } from './drtSteps'

describe('buildDrtSteps', () => {
  test('distance mode: answer = rate * t (60, 3 → 180)', () => {
    const sb = buildDrtSteps('distance', 60, 3, 'en')
    expect(sb.answer).toBe(180)
    expect(sb.distance).toBe(180)
    expect(sb.rate).toBe(60)
    expect(sb.t).toBe(3)
  })

  test('time mode: answer = t and distance = rate * t (60, 3 → distance 180, answer 3)', () => {
    const sb = buildDrtSteps('time', 60, 3, 'en')
    expect(sb.distance).toBe(180)
    expect(sb.answer).toBe(3)
  })

  test('always produces 4 phases: setup, formula, compute, result', () => {
    const dist = buildDrtSteps('distance', 50, 2, 'en')
    expect(dist.steps.map((s) => s.phase)).toEqual(['setup', 'formula', 'compute', 'result'])
    expect(dist.steps.length).toBe(4)
    expect(dist.finalIndex).toBe(3)

    const time = buildDrtSteps('time', 50, 2, 'en')
    expect(time.steps.map((s) => s.phase)).toEqual(['setup', 'formula', 'compute', 'result'])
  })

  test('last step has result:true and contains the answer in caption', () => {
    const dist = buildDrtSteps('distance', 60, 3, 'en')
    const lastDist = dist.steps[dist.finalIndex]
    expect(lastDist.result).toBe(true)
    expect(lastDist.caption).toContain('180')

    const time = buildDrtSteps('time', 60, 3, 'en')
    const lastTime = time.steps[time.finalIndex]
    expect(lastTime.result).toBe(true)
    expect(lastTime.caption).toContain('3')
  })

  test('language switch: id captions contain "Mobil", en captions contain "car"', () => {
    const id = buildDrtSteps('distance', 60, 3, 'id')
    expect(id.steps[0].caption).toContain('Mobil')

    const en = buildDrtSteps('distance', 60, 3, 'en')
    expect(en.steps[0].caption).toContain('car')
  })

  test('id time mode setup contains "Mobil"', () => {
    const id = buildDrtSteps('time', 60, 3, 'id')
    expect(id.steps[0].caption).toContain('Mobil')
  })
})
