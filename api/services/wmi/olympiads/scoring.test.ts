import { describe, it, expect } from 'vitest'
import { computeScore, getBrand } from './registry.js'

describe('computeScore', () => {
  it('WMI: no penalty — wrong answers never reduce the score', () => {
    const wmi = getBrand('wmi').scoring
    // 12 correct, 3 wrong, 10 blank → only the 12 correct count.
    expect(computeScore(wmi, [{ correct: 12, wrong: 3, blank: 10 }])).toBe(12 * 4)
    // Same correct count, fewer wrong → identical score (no penalty).
    expect(computeScore(wmi, [{ correct: 12, wrong: 0, blank: 13 }])).toBe(12 * 4)
  })

  it('SASMO: Section A penalizes wrong answers, Section B does not', () => {
    const sasmo = getBrand('sasmo').scoring
    // A: 10 correct (+20), 3 wrong (−3); B: 5 correct (+20) → 37.
    expect(
      computeScore(sasmo, [
        { correct: 10, wrong: 3, blank: 2 },
        { correct: 5, wrong: 0, blank: 5 },
      ]),
    ).toBe(10 * 2 - 3 * 1 + 5 * 4)
  })

  it('a careless wrong guess in Section A is strictly worse than leaving it blank', () => {
    const sasmo = getBrand('sasmo').scoring
    const blank = computeScore(sasmo, [{ correct: 8, wrong: 0, blank: 1 }])
    const guessedWrong = computeScore(sasmo, [{ correct: 8, wrong: 1, blank: 0 }])
    expect(guessedWrong).toBeLessThan(blank)
  })

  it('includes startingPoints and treats missing section counts as zero', () => {
    const scoring = {
      startingPoints: 10,
      sections: [
        { key: 'x', labelEn: '', labelId: '', pointsPerCorrect: 5, penaltyPerWrong: -2, pointsPerBlank: 0 },
        { key: 'y', labelEn: '', labelId: '', pointsPerCorrect: 3, penaltyPerWrong: 0, pointsPerBlank: 0 },
      ],
    }
    // Only the first section supplied; second defaults to 0s.
    expect(computeScore(scoring, [{ correct: 2, wrong: 1, blank: 0 }])).toBe(10 + 2 * 5 - 1 * 2)
  })
})
