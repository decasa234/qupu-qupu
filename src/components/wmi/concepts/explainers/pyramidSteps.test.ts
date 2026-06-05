import { describe, test, expect } from 'vitest'
import { buildPyramidSteps } from './pyramidSteps'

describe('buildPyramidSteps', () => {
  test('mid = [a+b, b+c] and top = sum for a=3, b=5, c=2', () => {
    const sb = buildPyramidSteps(3, 5, 2, 'en')
    expect(sb.mid).toEqual([8, 7])
    expect(sb.top).toBe(15)
  })

  test('has exactly 4 phases', () => {
    const sb = buildPyramidSteps(3, 5, 2, 'en')
    expect(sb.steps).toHaveLength(4)
    expect(sb.steps.map((s) => s.phase)).toEqual(['bottom', 'middle', 'top', 'result'])
  })

  test('last step has result:true and contains the top value in caption', () => {
    const sb = buildPyramidSteps(3, 5, 2, 'en')
    const last = sb.steps[sb.finalIndex]
    expect(last.result).toBe(true)
    expect(last.caption).toContain('15')
    expect(sb.finalIndex).toBe(sb.steps.length - 1)
  })

  test('language switch: id captions use Indonesian text', () => {
    const sbId = buildPyramidSteps(3, 5, 2, 'id')
    expect(sbId.steps[0].caption).toContain('Baris bawah')
    expect(sbId.steps[1].caption).toContain('Jumlahkan tetangga')
    expect(sbId.steps[2].caption).toContain('Jumlahkan baris tengah')
    expect(sbId.steps[3].caption).toContain('Puncaknya')
  })

  test('language switch: en captions use English text', () => {
    const sbEn = buildPyramidSteps(3, 5, 2, 'en')
    expect(sbEn.steps[0].caption).toContain('The bottom row is')
    expect(sbEn.steps[1].caption).toContain('Add neighbours')
    expect(sbEn.steps[2].caption).toContain('Add the middle row')
    expect(sbEn.steps[3].caption).toContain('The top is')
  })

  test('storyboard carries through a, b, c, mid, top', () => {
    const sb = buildPyramidSteps(4, 6, 3, 'en')
    expect(sb.a).toBe(4)
    expect(sb.b).toBe(6)
    expect(sb.c).toBe(3)
    expect(sb.mid).toEqual([10, 9])
    expect(sb.top).toBe(19)
  })
})
