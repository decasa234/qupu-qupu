import { describe, test, expect } from 'vitest'
import { paperCode, questionCode } from './paperCode.js'

describe('paperCode', () => {
  test('legacy WMI shape is unchanged', () => {
    expect(paperCode({ year: 2019, round: 'final', grade: 1, variant: 'A' })).toBe('WMI-19F1A')
    expect(paperCode({ year: 2020, round: 'semifinal', grade: 3, variant: 'B' })).toBe('WMI-20P3B')
    expect(questionCode({ year: 2019, round: 'final', grade: 1, variant: 'A' }, 1)).toBe('WMI-19F1A-Q1')
  })
  test('brand-aware SASMO shape', () => {
    expect(paperCode({ brand: 'sasmo', year: 2019, round: 'contest', level: 'g2' })).toBe('SASMO-19-G2')
  })
})
