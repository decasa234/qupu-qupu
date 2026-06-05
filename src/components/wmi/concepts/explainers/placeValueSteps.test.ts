import { describe, test, expect } from 'vitest'
import { buildPlaceValueSteps } from './placeValueSteps'

describe('buildPlaceValueSteps', () => {
  test('derives the tens digit, ones digit, and the tens value', () => {
    const sb = buildPlaceValueSteps(47, 'en')
    expect([sb.tens, sb.ones, sb.tensValue]).toEqual([4, 7, 40])
  })

  test('runs number -> tiles -> ones -> rods (one per ten) -> result', () => {
    const sb = buildPlaceValueSteps(47, 'en')
    expect(sb.steps[0].showNumber).toBe(true)
    expect(sb.steps[1].showTiles).toBe(true)
    expect(sb.steps[2].showOnes).toBe(true)
    // rods reveal one at a time, up to the tens digit
    const revealed = sb.steps.filter((s) => s.showRods).map((s) => s.rodsRevealed)
    expect(Math.max(...revealed)).toBe(4)
    expect(revealed).toContain(1) // counted 10, 20, 30, 40 one rod at a time
    const last = sb.steps[sb.finalIndex]
    expect(last.showResult).toBe(true)
    expect(last.result).toBe(true)
    expect(last.caption).toContain('40')
    expect(sb.finalIndex).toBe(sb.steps.length - 1)
  })

  test('rod count equals the tens digit', () => {
    const teens = buildPlaceValueSteps(13, 'en')
    expect(teens.tensValue).toBe(10)
    expect(Math.max(...teens.steps.map((s) => s.rodsRevealed))).toBe(1)
    expect(Math.max(...buildPlaceValueSteps(90, 'en').steps.map((s) => s.rodsRevealed))).toBe(9)
  })

  test('language switches the caption text', () => {
    expect(buildPlaceValueSteps(40, 'id').steps[0].caption).toContain('Ini 40')
    expect(buildPlaceValueSteps(40, 'en').steps[0].caption).toContain('This is 40')
  })

  test('clamps out-of-range numbers to 10..99', () => {
    expect(buildPlaceValueSteps(5, 'en').n).toBe(10)
    expect(buildPlaceValueSteps(200, 'en').n).toBe(99)
  })
})
