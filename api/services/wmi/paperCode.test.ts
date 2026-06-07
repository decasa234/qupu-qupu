import { describe, test, expect } from 'vitest'
import { paperCode, questionCode } from './paperCode.js'

describe('paperCode / questionCode', () => {
  test('paperCode formats WMI-[YY][F|P][grade] (matches the frontend util)', () => {
    expect(paperCode({ year: 2019, round: 'final', grade: 1 })).toBe('WMI-19F1')
    expect(paperCode({ year: 2020, round: 'semifinal', grade: 3 })).toBe('WMI-20P3')
    expect(paperCode({ year: 2025, round: 'final', grade: 0 })).toBe('WMI-25F0')
  })

  test('questionCode appends -Q<number>', () => {
    expect(questionCode({ year: 2019, round: 'final', grade: 1 }, 1)).toBe('WMI-19F1-Q1')
    expect(questionCode({ year: 2019, round: 'final', grade: 1 }, 16)).toBe('WMI-19F1-Q16')
  })
})
