import { describe, test, expect } from 'vitest'
import { isCorrectAnswer } from './answerMatch.js'

describe('isCorrectAnswer', () => {
  test('exact and whitespace/case-insensitive matches', () => {
    expect(isCorrectAnswer('20', '20')).toBe(true)
    expect(isCorrectAnswer('20', ' 20 ')).toBe(true)
    expect(isCorrectAnswer('A', 'a')).toBe(true)
    expect(isCorrectAnswer('C', 'C')).toBe(true)
  })

  test('tolerates units, currency, and stray spaces around a numeric answer', () => {
    for (const typed of ['20 cm', '20cm', ' 20 ', '20 centimeters']) {
      expect(isCorrectAnswer('20', typed)).toBe(true)
    }
    expect(isCorrectAnswer('14', '$14')).toBe(true)
    expect(isCorrectAnswer('14', '14 dollars')).toBe(true)
    expect(isCorrectAnswer('340', '340 cm')).toBe(true)
    expect(isCorrectAnswer('5', '5 hours')).toBe(true)
  })

  test('does NOT turn wrong answers right', () => {
    expect(isCorrectAnswer('20', '200')).toBe(false)
    expect(isCorrectAnswer('20', '120')).toBe(false)
    expect(isCorrectAnswer('20', '2 0')).toBe(false) // two separate numbers
    expect(isCorrectAnswer('20', '20 or 30')).toBe(false)
    expect(isCorrectAnswer('8', 'eight')).toBe(false)
    expect(isCorrectAnswer('0', '')).toBe(false)
  })

  test('multiple-choice labels stay strict (letters are not numeric)', () => {
    expect(isCorrectAnswer('A', 'b')).toBe(false)
    expect(isCorrectAnswer('C', 'D')).toBe(false)
  })
})
