import { describe, test, expect } from 'vitest'
import { figureName } from './figures.js'

describe('figureName', () => {
  test('builds a stable lowercase name from paper meta + question number', () => {
    expect(figureName({ year: 2019, round: 'final', grade: 1, variant: 'A' }, 3, 'jpg')).toBe('2019-final-g1-a-q3.jpg')
    expect(figureName({ year: 2019, round: 'final', grade: 0, variant: 'A' }, 12, '.PNG')).toBe('2019-final-g0-a-q12.png')
    expect(figureName({ year: 2020, round: 'semifinal', grade: 3, variant: 'B' }, 7, 'jpeg')).toBe('2020-semifinal-g3-b-q7.jpeg')
  })
})
