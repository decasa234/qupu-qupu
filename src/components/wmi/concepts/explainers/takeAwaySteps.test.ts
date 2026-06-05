import { describe, test, expect } from 'vitest'
import { buildTakeAwaySteps } from './takeAwaySteps'

const PAIRS: Array<[number, number]> = [
  [8, 3], [9, 1], [9, 8], [5, 2], [2, 1], [7, 4], [6, 5], [4, 3],
]

describe('buildTakeAwaySteps', () => {
  test('left equals a − b for every pair', () => {
    for (const [a, b] of PAIRS) {
      expect(buildTakeAwaySteps(a, b, 'en').left).toBe(a - b)
    }
  })

  test('final step is the result, everything gone, and states a − b', () => {
    for (const [a, b] of PAIRS) {
      const s = buildTakeAwaySteps(a, b, 'en')
      const last = s.steps[s.finalIndex]
      expect(last.result).toBe(true)
      expect(last.gone).toBe(true)
      expect(last.caption).toContain(String(a - b))
    }
  })

  test('removal is ordered: a marked beat precedes a gone beat', () => {
    for (const [a, b] of PAIRS) {
      const s = buildTakeAwaySteps(a, b, 'en')
      const firstMarked = s.steps.findIndex((x) => x.marked)
      const firstGone = s.steps.findIndex((x) => x.gone)
      expect(firstMarked).toBeGreaterThanOrEqual(0)
      expect(firstGone).toBeGreaterThan(firstMarked)
    }
  })

  test('first beat shows the whole — nothing marked or gone', () => {
    for (const [a, b] of PAIRS) {
      const first = buildTakeAwaySteps(a, b, 'en').steps[0]
      expect(first.marked).toBe(false)
      expect(first.gone).toBe(false)
    }
  })

  test('language selects caption text', () => {
    expect(buildTakeAwaySteps(8, 3, 'en').steps[0].caption).toContain('start')
    expect(buildTakeAwaySteps(8, 3, 'id').steps[0].caption).toContain('mulai')
  })

  test('clamps b so the result stays positive (b < a)', () => {
    const s = buildTakeAwaySteps(5, 99, 'en')
    expect(s.b).toBe(4)
    expect(s.left).toBe(1)
  })

  test('non-finite input clamps safely', () => {
    const s = buildTakeAwaySteps(NaN, NaN, 'en')
    expect(s.a).toBe(2)
    expect(s.b).toBe(1)
    expect(s.left).toBe(1)
    expect(s.steps[s.finalIndex].caption).not.toContain('NaN')
  })
})
