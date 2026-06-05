import { describe, test, expect } from 'vitest'
import { buildExpressionSteps, type ExprParams } from './expressionSteps'

describe('buildExpressionSteps', () => {
  test('sum-list accumulates left to right', () => {
    const p: ExprParams = { mode: 'sum-list', a: 23, b: 31, c: 45, d: 18 }
    const s = buildExpressionSteps(p, 'en')
    expect(s.answer).toBe(117)
    expect(s.lines).toEqual(['23 + 31 + 45 + 18', '54 + 45 + 18', '99 + 18', '117'])
    expect(s.steps[s.finalIndex].result).toBe(true)
    expect(s.steps[s.finalIndex].caption).toContain('117')
  })

  test('product-plus does the product before adding', () => {
    const p: ExprParams = { mode: 'product-plus', a: 7, b: 6, c: 5, d: 1 }
    const s = buildExpressionSteps(p, 'en')
    expect(s.answer).toBe(47)
    expect(s.lines).toEqual(['7 × 6 + 5', '42 + 5', '47'])
  })

  test('product-diff resolves both products first', () => {
    const p: ExprParams = { mode: 'product-diff', a: 8, b: 7, c: 5, d: 4 }
    const s = buildExpressionSteps(p, 'en')
    expect(s.answer).toBe(36)
    expect(s.lines).toEqual(['8 × 7 − 5 × 4', '56 − 5 × 4', '56 − 20', '36'])
  })

  test('one beat per line, reveal monotonic, last states the answer', () => {
    for (const p of [
      { mode: 'sum-list', a: 11, b: 12, c: 13, d: 14 },
      { mode: 'product-plus', a: 3, b: 9, c: 8, d: 1 },
      { mode: 'product-diff', a: 9, b: 9, c: 2, d: 2 },
    ] as ExprParams[]) {
      const s = buildExpressionSteps(p, 'en')
      expect(s.steps.length).toBe(s.lines.length)
      s.steps.forEach((st, i) => expect(st.linesShown).toBe(i + 1))
      expect(s.lines[s.lines.length - 1]).toBe(String(s.answer))
    }
  })

  test('language selects the opening caption', () => {
    const p: ExprParams = { mode: 'product-diff', a: 8, b: 7, c: 5, d: 4 }
    expect(buildExpressionSteps(p, 'en').steps[0].caption).toContain('product')
    expect(buildExpressionSteps(p, 'id').steps[0].caption).toContain('perkalian')
  })
})
