import { describe, test, expect } from 'vitest'
import { paperCode } from './wmiPaperCode'

describe('paperCode', () => {
  test('formats WMI-[YY][F|P][grade][A|B]', () => {
    expect(paperCode({ year: 2019, round: 'final', grade: 1, variant: 'A' })).toBe('WMI-19F1A')
    expect(paperCode({ year: 2020, round: 'semifinal', grade: 3, variant: 'B' })).toBe('WMI-20P3B')
    expect(paperCode({ year: 2019, round: 'final', grade: 0, variant: 'A' })).toBe('WMI-19F0A')
    expect(paperCode({ year: 2025, round: 'final', grade: 2, variant: 'B' })).toBe('WMI-25F2B')
  })
})
