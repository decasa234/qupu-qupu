import { describe, it, expect } from 'vitest'
import { computeComprehension, PROFICIENT_TIER } from './comprehension.js'

const rep = (n: number, v: boolean) => Array.from({ length: n }, () => v)

describe('computeComprehension', () => {
  it('is Belum dimulai with no attempts', () => {
    expect(computeComprehension({ attempts: 0, correct: 0, recent: [] }).tier).toBe(0)
  })
  it('is Baru belajar once attempted, even if wrong', () => {
    expect(computeComprehension({ attempts: 1, correct: 0, recent: [false] }).tier).toBe(1)
  })
  it('reaches Berlatih at 3 correct', () => {
    expect(computeComprehension({ attempts: 3, correct: 3, recent: rep(3, true) }).tier).toBe(2)
  })
  it('needs accuracy for Mahir: 6 correct but poor recent stays below 3', () => {
    const recent = [...rep(5, false), true, true] // only 2 of last 7
    const r = computeComprehension({ attempts: 12, correct: 6, recent })
    expect(r.tier).toBeLessThan(3)
    expect(r.pct).toBeLessThanOrEqual(65)
  })
  it('reaches Mahir at 6 correct with strong recent', () => {
    const r = computeComprehension({ attempts: 8, correct: 6, recent: rep(7, true) })
    expect(r.tier).toBe(PROFICIENT_TIER)
  })
  it('reaches Dikuasai at 10 correct with a 4-streak', () => {
    const r = computeComprehension({ attempts: 12, correct: 10, recent: rep(7, true) })
    expect(r.tier).toBe(4)
    expect(r.pct).toBe(100)
  })
})
