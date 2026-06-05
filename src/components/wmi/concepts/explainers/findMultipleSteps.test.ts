import { describe, test, expect } from 'vitest'
import { buildFindMultipleSteps } from './findMultipleSteps'

describe('buildFindMultipleSteps', () => {
  // d=4, options=[22, 30, 36, 25]
  // 22 ÷ 4 = 5 r2 (no), 30 ÷ 4 = 7 r2 (no), 36 ÷ 4 = 9 r0 (yes ✓), 25 ÷ 4 = 6 r1 (no)
  const D = 4
  const OPTIONS = [22, 30, 36, 25]

  test('q, rem, and match computed correctly for each option', () => {
    const sb = buildFindMultipleSteps(D, OPTIONS, 'en')
    expect(sb.checks[0]).toEqual({ n: 22, q: 5, rem: 2, match: false })
    expect(sb.checks[1]).toEqual({ n: 30, q: 7, rem: 2, match: false })
    expect(sb.checks[2]).toEqual({ n: 36, q: 9, rem: 0, match: true })
    expect(sb.checks[3]).toEqual({ n: 25, q: 6, rem: 1, match: false })
  })

  test('correctIndex points to the divisible option', () => {
    const sb = buildFindMultipleSteps(D, OPTIONS, 'en')
    expect(sb.correctIndex).toBe(2)
    expect(sb.checks[sb.correctIndex].match).toBe(true)
    expect(sb.checks[sb.correctIndex].rem).toBe(0)
  })

  test('6 steps with checked sequence 0,1,2,3,4,4', () => {
    const sb = buildFindMultipleSteps(D, OPTIONS, 'en')
    expect(sb.steps).toHaveLength(6)
    expect(sb.steps.map((s) => s.checked)).toEqual([0, 1, 2, 3, 4, 4])
  })

  test('last step has result:true and caption contains the correct value and ×', () => {
    const sb = buildFindMultipleSteps(D, OPTIONS, 'en')
    const last = sb.steps[sb.finalIndex]
    expect(last.result).toBe(true)
    expect(last.caption).toContain(String(OPTIONS[sb.correctIndex]))
    expect(last.caption).toContain('×')
    expect(sb.finalIndex).toBe(sb.steps.length - 1)
  })

  test('language switches: id step 0 contains Cari, en step 0 contains Find', () => {
    const sbId = buildFindMultipleSteps(D, OPTIONS, 'id')
    const sbEn = buildFindMultipleSteps(D, OPTIONS, 'en')
    expect(sbId.steps[0].caption).toContain('Cari')
    expect(sbEn.steps[0].caption).toContain('Find')
  })

  test('language switches: id result caption contains kelipatan, en contains multiple', () => {
    const sbId = buildFindMultipleSteps(D, OPTIONS, 'id')
    const sbEn = buildFindMultipleSteps(D, OPTIONS, 'en')
    expect(sbId.steps[5].caption).toContain('kelipatan')
    expect(sbEn.steps[5].caption).toContain('multiple')
  })

  test('result step caption contains correct value in both languages', () => {
    const sbId = buildFindMultipleSteps(D, OPTIONS, 'id')
    const sbEn = buildFindMultipleSteps(D, OPTIONS, 'en')
    const correctVal = String(OPTIONS[2]) // 36
    expect(sbId.steps[5].caption).toContain(correctVal)
    expect(sbEn.steps[5].caption).toContain(correctVal)
  })

  test('step 0 result is false', () => {
    const sb = buildFindMultipleSteps(D, OPTIONS, 'en')
    expect(sb.steps[0].result).toBe(false)
  })

  test('steps 1-4 result are false', () => {
    const sb = buildFindMultipleSteps(D, OPTIONS, 'en')
    for (let i = 1; i <= 4; i++) {
      expect(sb.steps[i].result).toBe(false)
    }
  })

  test('works with a different divisor — d=3, correct option last', () => {
    // d=3, options=[22, 25, 28, 27]
    // 22 ÷ 3 = 7 r1, 25 ÷ 3 = 8 r1, 28 ÷ 3 = 9 r1, 27 ÷ 3 = 9 r0 (✓)
    const sb = buildFindMultipleSteps(3, [22, 25, 28, 27], 'en')
    expect(sb.correctIndex).toBe(3)
    expect(sb.checks[3]).toEqual({ n: 27, q: 9, rem: 0, match: true })
    const last = sb.steps[sb.finalIndex]
    expect(last.result).toBe(true)
    expect(last.caption).toContain('27')
    expect(last.caption).toContain('×')
  })
})
