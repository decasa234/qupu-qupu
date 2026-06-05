import { describe, test, expect } from 'vitest'
import { digitSumModel, dotGridPositions } from './digitSumModel'

describe('digitSumModel', () => {
  test('splits a two-digit number into digits and sums their face values', () => {
    expect(digitSumModel(47)).toEqual({ n: 47, tens: 4, ones: 7, sum: 11 })
    expect(digitSumModel(40)).toEqual({ n: 40, tens: 4, ones: 0, sum: 4 })
    expect(digitSumModel(10)).toEqual({ n: 10, tens: 1, ones: 0, sum: 1 })
    expect(digitSumModel(99)).toEqual({ n: 99, tens: 9, ones: 9, sum: 18 })
  })

  test('dotGridPositions lays out k dots in rows of 5', () => {
    expect(dotGridPositions(0, 0, 0)).toEqual([])
    const six = dotGridPositions(6, 10, 20, 5, 22)
    expect(six).toHaveLength(6)
    expect(six[0]).toEqual({ x: 10, y: 20 })
    expect(six[4]).toEqual({ x: 10 + 4 * 22, y: 20 }) // last of row 1
    expect(six[5]).toEqual({ x: 10, y: 20 + 22 }) // wraps to row 2
  })
})
