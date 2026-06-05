import { describe, test, expect } from 'vitest'
import { buildExpressionSteps, type ExprParams, type ExprToken } from './expressionSteps'

const join = (tokens: ExprToken[]) => tokens.map((t) => t.text).join('')
const SAMPLES: ExprParams[] = [
  { mode: 'sum-list', a: 23, b: 31, c: 45, d: 18 },
  { mode: 'product-plus', a: 7, b: 6, c: 5, d: 1 },
  { mode: 'product-diff', a: 8, b: 7, c: 5, d: 4 },
]

describe('buildExpressionSteps', () => {
  test('sum-list pairs the four numbers and answers 117', () => {
    const s = buildExpressionSteps({ mode: 'sum-list', a: 23, b: 31, c: 45, d: 18 }, 'en')
    expect(s.answer).toBe(117)
    expect(join(s.steps[0].tokens)).toBe('23 + 31 + 45 + 18')
    expect(s.steps[0].tokens.filter((t) => t.active).map((t) => t.text)).toEqual(['23 + 31', '45 + 18'])
  })

  test('product-plus does the product before adding', () => {
    const s = buildExpressionSteps({ mode: 'product-plus', a: 7, b: 6, c: 5, d: 1 }, 'en')
    expect(s.answer).toBe(47)
    expect(join(s.steps[1].tokens)).toBe('42 + 5')
  })

  test('product-diff resolves both products first', () => {
    const s = buildExpressionSteps({ mode: 'product-diff', a: 8, b: 7, c: 5, d: 4 }, 'en')
    expect(s.answer).toBe(36)
    expect(join(s.steps[3].tokens)).toBe('56 − 20')
  })

  test('final beat is the result, states the answer; earlier beats hold > 1600ms', () => {
    for (const p of SAMPLES) {
      const s = buildExpressionSteps(p, 'en')
      const last = s.steps[s.finalIndex]
      expect(last.result).toBe(true)
      expect(last.caption).toContain(String(s.answer))
      s.steps.slice(0, -1).forEach((st) => expect(st.hold).toBeGreaterThan(1600))
    }
  })

  test('every beat boxes at least one group (active token)', () => {
    for (const p of SAMPLES) {
      for (const st of buildExpressionSteps(p, 'en').steps) {
        expect(st.tokens.some((t) => t.active)).toBe(true)
      }
    }
  })

  test('language selects the opening caption', () => {
    const p: ExprParams = { mode: 'product-diff', a: 8, b: 7, c: 5, d: 4 }
    expect(buildExpressionSteps(p, 'en').steps[0].caption).toContain('product')
    expect(buildExpressionSteps(p, 'id').steps[0].caption).toContain('perkalian')
  })
})
