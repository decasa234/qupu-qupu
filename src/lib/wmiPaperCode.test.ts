import { describe, test, expect } from 'vitest'
import { paperCode } from './wmiPaperCode'

describe('paperCode', () => {
  test('formats WMI-[YY][F|P][grade]', () => {
    expect(paperCode({ year: 2019, round: 'final', grade: 1 })).toBe('WMI-19F1')
    expect(paperCode({ year: 2020, round: 'semifinal', grade: 3 })).toBe('WMI-20P3')
    expect(paperCode({ year: 2019, round: 'final', grade: 0 })).toBe('WMI-19F0')
    expect(paperCode({ year: 2025, round: 'final', grade: 2 })).toBe('WMI-25F2')
  })
})
