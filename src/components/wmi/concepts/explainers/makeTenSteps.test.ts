import { describe, test, expect } from 'vitest'
import { buildMakeTenSteps } from './makeTenSteps'

const PAIRS: Array<[number, number]> = [
  [8, 5], [7, 6], [9, 9], [6, 4], [3, 4], [1, 1], [5, 8], [9, 1], [2, 7],
]

describe('buildMakeTenSteps', () => {
  test('every step conserves the total (blue + orange + loose === a + b)', () => {
    for (const [a, b] of PAIRS) {
      for (const s of buildMakeTenSteps(a, b, 'en').steps) {
        expect(s.blue + s.orange + s.loose).toBe(a + b)
      }
    }
  })

  test('ten-frame never overfills (blue + orange <= 10)', () => {
    for (const [a, b] of PAIRS) {
      for (const s of buildMakeTenSteps(a, b, 'en').steps) {
        expect(s.blue + s.orange).toBeLessThanOrEqual(10)
      }
    }
  })

  test('final step is flagged result and states the correct sum', () => {
    for (const [a, b] of PAIRS) {
      const story = buildMakeTenSteps(a, b, 'en')
      const last = story.steps[story.finalIndex]
      expect(last.result).toBe(true)
      expect(last.caption).toContain(String(a + b))
    }
  })

  test('bridges and shows a split iff the sum crosses ten', () => {
    for (const [a, b] of PAIRS) {
      const story = buildMakeTenSteps(a, b, 'en')
      const crosses = a + b > 10
      expect(story.bridges).toBe(crosses)
      expect(story.steps.some((s) => s.split !== null)).toBe(crosses)
    }
  })

  test('larger addend always fills the frame first', () => {
    for (const [a, b] of PAIRS) {
      expect(buildMakeTenSteps(a, b, 'en').steps[0].blue).toBe(Math.max(a, b))
    }
  })

  test('commutative: a+b and b+a produce identical storyboards', () => {
    expect(buildMakeTenSteps(8, 5, 'en')).toEqual(buildMakeTenSteps(5, 8, 'en'))
    expect(buildMakeTenSteps(3, 4, 'id')).toEqual(buildMakeTenSteps(4, 3, 'id'))
  })

  test('perfect ten fills exactly, no leftover, no split', () => {
    const story = buildMakeTenSteps(6, 4, 'en')
    expect(story.bridges).toBe(false)
    expect(story.leftover).toBe(0)
    const last = story.steps[story.finalIndex]
    expect(last.blue + last.orange).toBe(10)
    expect(last.loose).toBe(0)
  })

  test('language selects caption text', () => {
    expect(buildMakeTenSteps(8, 5, 'en').steps[0].caption).toContain('start')
    expect(buildMakeTenSteps(8, 5, 'id').steps[0].caption).toContain('mulai')
  })

  test('clamps out-of-range inputs into 1..9', () => {
    const story = buildMakeTenSteps(0, 99, 'en')
    expect(story.big).toBe(9)
    expect(story.small).toBe(1)
    expect(story.steps.length).toBeGreaterThan(0)
    expect(story.steps[story.finalIndex].result).toBe(true)
    for (const s of story.steps) {
      expect(s.blue + s.orange + s.loose).toBe(10)
    }
  })

  test('non-finite input clamps safely', () => {
    const story = buildMakeTenSteps(NaN, 5, 'en')
    expect(Number.isFinite(story.big)).toBe(true)
    expect(Number.isFinite(story.sum)).toBe(true)
    expect(story.steps[story.finalIndex].caption).not.toContain('NaN')
  })
})
