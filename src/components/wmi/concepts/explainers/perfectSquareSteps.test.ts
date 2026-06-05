import { describe, test, expect } from 'vitest'
import { buildPerfectSquareSteps } from './perfectSquareSteps'

describe('buildPerfectSquareSteps', () => {
  test('n=50: root=7, answer=64', () => {
    const sb = buildPerfectSquareSteps(50, 'en')
    expect(sb.root).toBe(7)
    expect(sb.answer).toBe(64)
    expect(sb.n).toBe(50)
  })

  test('n=20: answer=25', () => {
    const sb = buildPerfectSquareSteps(20, 'en')
    expect(sb.root).toBe(4)
    expect(sb.answer).toBe(25)
  })

  test('n=300: answer=324', () => {
    const sb = buildPerfectSquareSteps(300, 'en')
    expect(sb.root).toBe(17)
    expect(sb.answer).toBe(324)
  })

  test('squares are ascending and include root² and (root+1)²', () => {
    const sb = buildPerfectSquareSteps(50, 'en')
    const values = sb.squares.map((s) => s.value)
    // ascending
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThan(values[i - 1])
    }
    // includes root² = 49 and (root+1)² = 64
    expect(values).toContain(49)
    expect(values).toContain(64)
  })

  test('squares k and value are consistent', () => {
    const sb = buildPerfectSquareSteps(50, 'en')
    for (const sq of sb.squares) {
      expect(sq.value).toBe(sq.k * sq.k)
    }
  })

  test('4 phases in order: intro -> squares -> locate -> result', () => {
    const sb = buildPerfectSquareSteps(50, 'en')
    expect(sb.steps.map((s) => s.phase)).toEqual(['intro', 'squares', 'locate', 'result'])
  })

  test('last step has result:true and caption contains the answer', () => {
    const sb = buildPerfectSquareSteps(50, 'en')
    const last = sb.steps[sb.finalIndex]
    expect(last.result).toBe(true)
    expect(last.caption).toContain('64')
    expect(sb.finalIndex).toBe(sb.steps.length - 1)
  })

  test('language switch: id caption contains "Cari", en contains "Find"', () => {
    const sbId = buildPerfectSquareSteps(50, 'id')
    const sbEn = buildPerfectSquareSteps(50, 'en')
    expect(sbId.steps[0].caption).toContain('Cari')
    expect(sbEn.steps[0].caption).toContain('Find')
  })

  test('language switch: id result caption contains "Jawabannya"', () => {
    const sbId = buildPerfectSquareSteps(50, 'id')
    const last = sbId.steps[sbId.finalIndex]
    expect(last.caption).toContain('Jawabannya')
  })
})
