import { describe, test, expect } from 'vitest'
import { buildFractionRegionSteps } from './fractionRegionSteps'

describe('buildFractionRegionSteps', () => {
  test('unshaded = answer = parts - shaded (parts=5, shaded=2 → 3)', () => {
    const sb = buildFractionRegionSteps(5, 2, 'en')
    expect(sb.unshaded).toBe(3)
    expect(sb.answer).toBe(3)
    expect(sb.parts).toBe(5)
    expect(sb.shaded).toBe(2)
  })

  test('unshaded = answer = parts - shaded for other values', () => {
    const sb = buildFractionRegionSteps(8, 3, 'en')
    expect(sb.unshaded).toBe(5)
    expect(sb.answer).toBe(5)
  })

  test('4 phases in order: whole -> shade -> count -> result', () => {
    const sb = buildFractionRegionSteps(5, 2, 'en')
    expect(sb.steps.map((s) => s.phase)).toEqual(['whole', 'shade', 'count', 'result'])
    expect(sb.steps.length).toBe(4)
  })

  test('last step has result:true and caption contains the answer', () => {
    const sb = buildFractionRegionSteps(5, 2, 'en')
    const last = sb.steps[sb.finalIndex]
    expect(last.result).toBe(true)
    expect(last.caption).toContain(String(sb.answer))
    expect(sb.finalIndex).toBe(sb.steps.length - 1)
  })

  test('language switch: id caption contains "Batang", en caption contains "bar"', () => {
    const id = buildFractionRegionSteps(5, 2, 'id')
    const en = buildFractionRegionSteps(5, 2, 'en')
    expect(id.steps[0].caption).toContain('Batang')
    expect(en.steps[0].caption).toContain('bar')
  })

  test('id result caption contains "bagian"', () => {
    const sb = buildFractionRegionSteps(6, 4, 'id')
    const last = sb.steps[sb.finalIndex]
    expect(last.caption).toContain('bagian')
    expect(last.result).toBe(true)
  })

  test('all non-result steps have result:false', () => {
    const sb = buildFractionRegionSteps(7, 3, 'en')
    sb.steps.slice(0, sb.finalIndex).forEach((s) => {
      expect(s.result).toBe(false)
    })
  })
})
