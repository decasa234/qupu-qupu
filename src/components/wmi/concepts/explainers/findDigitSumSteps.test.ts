import { describe, test, expect } from 'vitest'
import { buildFindDigitSumSteps } from './findDigitSumSteps'

describe('buildFindDigitSumSteps', () => {
  // options: 23 (2+3=5), 41 (4+1=5 ✓ when k=5... let's use k=7), 34 (3+4=7 ✓), 52 (5+2=7 ✓)
  // Use: k=7, options=[23, 41, 34, 52] → 34 and 52 both sum to 7 — need exactly one match.
  // Use: k=5, options=[23, 41, 32, 64] → 23(2+3=5 ✓), 41(4+1=5 ✓) — need exactly one.
  // Use: k=7, options=[23, 45, 34, 62] → 23(5), 45(9), 34(7 ✓), 62(8) — exactly one match at index 2.

  const K = 7
  const OPTIONS = [23, 45, 34, 62]

  test('digit-sum and match computed correctly', () => {
    const sb = buildFindDigitSumSteps(K, OPTIONS, 'en')
    expect(sb.checks[0]).toEqual({ n: 23, tens: 2, ones: 3, sum: 5, match: false })
    expect(sb.checks[1]).toEqual({ n: 45, tens: 4, ones: 5, sum: 9, match: false })
    expect(sb.checks[2]).toEqual({ n: 34, tens: 3, ones: 4, sum: 7, match: true })
    expect(sb.checks[3]).toEqual({ n: 62, tens: 6, ones: 2, sum: 8, match: false })
    expect(sb.correctIndex).toBe(2)
  })

  test('6 steps in order: checked values are 0,1,2,3,4,4', () => {
    const sb = buildFindDigitSumSteps(K, OPTIONS, 'en')
    expect(sb.steps).toHaveLength(6)
    expect(sb.steps.map((s) => s.checked)).toEqual([0, 1, 2, 3, 4, 4])
  })

  test('last step has result:true and caption contains the correct value', () => {
    const sb = buildFindDigitSumSteps(K, OPTIONS, 'en')
    const last = sb.steps[sb.finalIndex]
    expect(last.result).toBe(true)
    expect(last.caption).toContain(String(OPTIONS[sb.correctIndex]))
    expect(sb.finalIndex).toBe(sb.steps.length - 1)
  })

  test('language switches caption: id contains Cari, en contains Find', () => {
    const sbId = buildFindDigitSumSteps(K, OPTIONS, 'id')
    const sbEn = buildFindDigitSumSteps(K, OPTIONS, 'en')
    expect(sbId.steps[0].caption).toContain('Cari')
    expect(sbEn.steps[0].caption).toContain('Find')
  })

  test('result step caption contains correct value in both languages', () => {
    const sbId = buildFindDigitSumSteps(K, OPTIONS, 'id')
    const sbEn = buildFindDigitSumSteps(K, OPTIONS, 'en')
    const correctVal = String(OPTIONS[2]) // 34
    expect(sbId.steps[5].caption).toContain(correctVal)
    expect(sbEn.steps[5].caption).toContain(correctVal)
  })

  test('id result caption contains cocok', () => {
    const sb = buildFindDigitSumSteps(K, OPTIONS, 'id')
    expect(sb.steps[5].caption).toContain('cocok')
  })

  test('en result caption contains works', () => {
    const sb = buildFindDigitSumSteps(K, OPTIONS, 'en')
    expect(sb.steps[5].caption).toContain('works')
  })
})
