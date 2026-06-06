import { describe, test, expect } from 'vitest'
import { buildTallySteps } from './tallySteps'

describe('buildTallySteps', () => {
  test('29 = 5 groups of 5 + 4 leftover; final beat states 29', () => {
    const s = buildTallySteps(29, 'en')
    expect(s.fullGroups).toBe(5)
    expect(s.leftover).toBe(4)
    const groupBeats = s.steps.filter((x) => x.leftover === 0).map((x) => x.groups)
    expect(groupBeats).toEqual([1, 2, 3, 4, 5])
    const last = s.steps[s.finalIndex]
    expect(last.result).toBe(true)
    expect(last.leftover).toBe(4)
    expect(last.caption).toContain('29')
  })

  test('exact multiple of 5 has no leftover beat', () => {
    const s = buildTallySteps(15, 'en')
    expect(s.steps.every((x) => x.leftover === 0)).toBe(true)
    expect(s.steps[s.finalIndex].caption).toContain('15')
  })

  test('fewer than 5 marks: single result beat', () => {
    const s = buildTallySteps(3, 'en')
    expect(s.steps.length).toBe(1)
    expect(s.steps[0].leftover).toBe(3)
    expect(s.steps[0].caption).toContain('3')
  })

  test('language selects caption text', () => {
    expect(buildTallySteps(10, 'en').steps[0].caption).toContain('count')
    expect(buildTallySteps(10, 'id').steps[0].caption).toContain('hitung')
  })

  test('does not throw on garbage input', () => {
    expect(() => buildTallySteps(undefined as unknown as number, 'en')).not.toThrow()
  })
})
