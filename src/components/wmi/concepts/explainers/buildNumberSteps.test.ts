import { describe, test, expect } from 'vitest'
import { buildBuildNumberSteps } from './buildNumberSteps'

describe('buildBuildNumberSteps', () => {
  test('number = 10*tens + units', () => {
    const sb = buildBuildNumberSteps(3, 7, 5, 'more', 'en')
    expect(sb.number).toBe(37)
    expect(sb.tens).toBe(3)
    expect(sb.units).toBe(7)
  })

  test('answer for dir=more is number + k', () => {
    const sb = buildBuildNumberSteps(4, 2, 10, 'more', 'en')
    expect(sb.number).toBe(42)
    expect(sb.answer).toBe(52)
  })

  test('answer for dir=less is number - k', () => {
    const sb = buildBuildNumberSteps(6, 5, 20, 'less', 'en')
    expect(sb.number).toBe(65)
    expect(sb.answer).toBe(45)
  })

  test('4 phases in order: clues, number, op, result', () => {
    const sb = buildBuildNumberSteps(2, 8, 7, 'more', 'en')
    expect(sb.steps.map((s) => s.phase)).toEqual(['clues', 'number', 'op', 'result'])
    expect(sb.steps).toHaveLength(4)
  })

  test('last step has result:true and caption contains the answer', () => {
    const sb = buildBuildNumberSteps(5, 3, 4, 'more', 'en')
    const last = sb.steps[sb.finalIndex]
    expect(last.result).toBe(true)
    expect(last.caption).toContain(String(sb.answer))
    expect(sb.finalIndex).toBe(sb.steps.length - 1)
  })

  test('language switch: id contains puluhan, en contains Tens', () => {
    const sbId = buildBuildNumberSteps(3, 6, 5, 'more', 'id')
    const sbEn = buildBuildNumberSteps(3, 6, 5, 'more', 'en')
    expect(sbId.steps[0].caption).toContain('puluhan')
    expect(sbEn.steps[0].caption).toContain('Tens')
  })

  test('id phase op uses lebih dari or kurang dari', () => {
    const sbMore = buildBuildNumberSteps(4, 1, 9, 'more', 'id')
    const sbLess = buildBuildNumberSteps(4, 1, 9, 'less', 'id')
    expect(sbMore.steps[2].caption).toContain('lebih dari')
    expect(sbLess.steps[2].caption).toContain('kurang dari')
  })

  test('en phase op uses more than or less than', () => {
    const sbMore = buildBuildNumberSteps(7, 0, 3, 'more', 'en')
    const sbLess = buildBuildNumberSteps(7, 0, 3, 'less', 'en')
    expect(sbMore.steps[2].caption).toContain('more than')
    expect(sbLess.steps[2].caption).toContain('less than')
  })

  test('units=0 edge case: number is 10*tens', () => {
    const sb = buildBuildNumberSteps(9, 0, 1, 'less', 'en')
    expect(sb.number).toBe(90)
    expect(sb.answer).toBe(89)
  })
})
