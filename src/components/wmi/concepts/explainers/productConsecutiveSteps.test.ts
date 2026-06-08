import { describe, test, expect } from 'vitest'
import { buildProductConsecutiveSteps } from './productConsecutiveSteps'

describe('buildProductConsecutiveSteps', () => {
  test('k=7: product=56, answer=8', () => {
    const sb = buildProductConsecutiveSteps(7, 'en')
    expect(sb.product).toBe(56)
    expect(sb.answer).toBe(8)
    expect(sb.smaller).toBe(7)
    expect(sb.larger).toBe(8)
    expect(sb.k).toBe(7)
  })

  test('product equals k*(k+1)', () => {
    const sb = buildProductConsecutiveSteps(5, 'en')
    expect(sb.product).toBe(5 * 6)
    expect(sb.answer).toBe(6)
  })

  test('answer is always k+1 (the larger)', () => {
    const sb = buildProductConsecutiveSteps(12, 'en')
    expect(sb.answer).toBe(13)
    expect(sb.answer).toBe(sb.larger)
  })

  test('5 phases in order: intro -> near -> pair -> verify -> result', () => {
    const sb = buildProductConsecutiveSteps(7, 'en')
    expect(sb.steps.map((s) => s.phase)).toEqual(['intro', 'near', 'pair', 'verify', 'result'])
  })

  test('last step has result:true and caption contains k+1', () => {
    const sb = buildProductConsecutiveSteps(7, 'en')
    const last = sb.steps[sb.finalIndex]
    expect(last.result).toBe(true)
    expect(last.caption).toContain(String(8))
    expect(sb.finalIndex).toBe(sb.steps.length - 1)
  })

  test('language switch: id contains "berurutan", en contains "consecutive"', () => {
    const id = buildProductConsecutiveSteps(7, 'id')
    const en = buildProductConsecutiveSteps(7, 'en')
    expect(id.steps[0].caption).toContain('berurutan')
    expect(en.steps[0].caption).toContain('consecutive')
  })

  test('id near step contains "berurutan"', () => {
    const id = buildProductConsecutiveSteps(7, 'id')
    expect(id.steps[1].caption).toContain('berurutan')
  })
})
