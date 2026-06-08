import { describe, test, expect } from 'vitest'
import { buildCorrectionSteps, type CorrectionParams } from './correctionSteps'

describe('buildCorrectionSteps', () => {
  test('units misread: delta = (wrong − right) × 1, got = correct + delta', () => {
    const p: CorrectionParams = { name: 'Zoey', right: 3, wrong: 8, place: 'units', correct: 142 }
    const s = buildCorrectionSteps(p, 'en')
    expect(s.delta).toBe(5)
    expect(s.got).toBe(147)
    expect(s.lines[2]).toBe('147 − 5 = 142')
  })

  test('tens misread: delta scales by 10', () => {
    const p: CorrectionParams = { name: 'Budi', right: 2, wrong: 6, place: 'tens', correct: 230 }
    const s = buildCorrectionSteps(p, 'en')
    expect(s.delta).toBe(40)
    expect(s.got).toBe(270)
    expect(s.lines[1]).toBe('(6 − 2) × 10 = 40')
  })

  test('one beat per line, reveal monotonic, last states the correct sum', () => {
    const p: CorrectionParams = { name: 'Maya', right: 1, wrong: 9, place: 'tens', correct: 305 }
    const s = buildCorrectionSteps(p, 'en')
    expect(s.steps.length).toBe(3)
    s.steps.forEach((st, i) => expect(st.linesShown).toBe(i + 1))
    const last = s.steps[s.finalIndex]
    expect(last.result).toBe(true)
    expect(last.caption).toContain('305')
  })

  test('language selects the opening caption', () => {
    const p: CorrectionParams = { name: 'Sari', right: 3, wrong: 8, place: 'units', correct: 142 }
    expect(buildCorrectionSteps(p, 'en').steps[0].caption).toContain('instead')
    expect(buildCorrectionSteps(p, 'id').steps[0].caption).toContain('bukan')
  })
})
