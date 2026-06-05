import { describe, test, expect } from 'vitest'
import { buildWalkSteps, type WalkParams } from './walkSteps'

const PARAMS: WalkParams = {
  start: 30,
  steps: [
    { op: '+', n: 12 }, // 42
    { op: '-', n: 7 }, // 35
    { op: '+', n: 5 }, // 40
  ],
}

describe('buildWalkSteps', () => {
  test('running total tracks the chain and the answer is the final total', () => {
    const s = buildWalkSteps(PARAMS, 'en')
    expect(s.steps.map((b) => b.total)).toEqual([30, 42, 35, 40])
    expect(s.answer).toBe(40)
  })

  test('one beat for start plus one per step; start hop is null', () => {
    const s = buildWalkSteps(PARAMS, 'en')
    expect(s.steps.length).toBe(PARAMS.steps.length + 1)
    expect(s.steps[0].hop).toBeNull()
    expect(s.steps[1].hop).toBe('+12')
    expect(s.steps[2].hop).toBe('−7')
  })

  test('every marker position stays within 0..1', () => {
    for (const b of buildWalkSteps(PARAMS, 'en').steps) {
      expect(b.frac).toBeGreaterThanOrEqual(0)
      expect(b.frac).toBeLessThanOrEqual(1)
    }
  })

  test('final beat is the result and states the answer', () => {
    const s = buildWalkSteps(PARAMS, 'en')
    const last = s.steps[s.finalIndex]
    expect(last.result).toBe(true)
    expect(last.caption).toContain('40')
  })

  test('language selects the start caption', () => {
    expect(buildWalkSteps(PARAMS, 'en').steps[0].caption).toContain('start')
    expect(buildWalkSteps(PARAMS, 'id').steps[0].caption).toContain('mulai')
  })
})
