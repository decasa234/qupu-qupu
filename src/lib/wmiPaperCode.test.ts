import { describe, test, expect } from 'vitest'
import { paperCode } from './wmiPaperCode'

describe('paperCode (client)', () => {
  test('formats WMI codes unchanged', () => {
    expect(paperCode({ year: 2019, round: 'final', grade: 1, variant: 'A' })).toBe('WMI-19F1A')
    expect(paperCode({ year: 2025, round: 'final', grade: 2, variant: 'B' })).toBe('WMI-25F2B')
  })
  test('formats SASMO codes', () => {
    expect(paperCode({ brand: 'sasmo', year: 2019, round: 'contest', level: 'g2' })).toBe('SASMO-19-G2')
  })
})
