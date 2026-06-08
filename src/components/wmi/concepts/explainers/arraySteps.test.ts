import { describe, test, expect } from 'vitest'
import { buildArraySteps } from './arraySteps'

const PAIRS: Array<[number, number]> = [
  [3, 4], [2, 2], [5, 5], [2, 5], [5, 2], [4, 3],
]

describe('buildArraySteps', () => {
  test('product equals a × b', () => {
    for (const [a, b] of PAIRS) {
      expect(buildArraySteps(a, b).product).toBe(a * b)
    }
  })

  test('one beat per row, rows count up 1..a', () => {
    for (const [a, b] of PAIRS) {
      const s = buildArraySteps(a, b)
      expect(s.steps.length).toBe(a)
      s.steps.forEach((st, i) => expect(st.rows).toBe(i + 1))
    }
  })

  test('final beat is the result, full grid, states the product', () => {
    for (const [a, b] of PAIRS) {
      const s = buildArraySteps(a, b)
      const last = s.steps[s.finalIndex]
      expect(last.result).toBe(true)
      expect(last.rows).toBe(a)
      expect(last.caption).toContain(String(a * b))
    }
  })

  test('each beat caption shows the running product r × b', () => {
    const s = buildArraySteps(3, 4)
    expect(s.steps[0].caption).toContain('4') // 1 × 4 = 4
    expect(s.steps[1].caption).toContain('8') // 2 × 4 = 8
    expect(s.steps[2].caption).toContain('12') // 3 × 4 = 12
  })

  test('clamps out-of-range factors into 1..9', () => {
    const s = buildArraySteps(0, 99)
    expect(s.a).toBe(1)
    expect(s.b).toBe(9)
    expect(s.product).toBe(9)
  })
})
