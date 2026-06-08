import { describe, test, expect } from 'vitest'
import { paperCode, questionCode } from './paperCode.js'

describe('paperCode / questionCode', () => {
  test('paperCode formats WMI-[YY][F|P][grade][A|B] (matches the frontend util)', () => {
    expect(paperCode({ year: 2019, round: 'final', grade: 1, variant: 'A' })).toBe('WMI-19F1A')
    expect(paperCode({ year: 2020, round: 'semifinal', grade: 3, variant: 'B' })).toBe('WMI-20P3B')
    expect(paperCode({ year: 2025, round: 'final', grade: 0, variant: 'A' })).toBe('WMI-25F0A')
  })

  test('questionCode appends -Q<number>', () => {
    expect(questionCode({ year: 2019, round: 'final', grade: 1, variant: 'A' }, 1)).toBe('WMI-19F1A-Q1')
    expect(questionCode({ year: 2019, round: 'final', grade: 1, variant: 'A' }, 16)).toBe('WMI-19F1A-Q16')
  })
})
