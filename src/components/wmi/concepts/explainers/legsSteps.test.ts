import { describe, test, expect } from 'vitest'
import { buildLegsSteps } from './legsSteps'

describe('buildLegsSteps', () => {
  test('subtotals = count×legs and total = sum of subtotals', () => {
    const sb = buildLegsSteps(['cat', 'chicken', 'spider'], [2, 3, 1], 'en')
    // cat: 2×4=8, chicken: 3×2=6, spider: 1×8=8  → total 22
    expect(sb.rows[0].subtotal).toBe(8)
    expect(sb.rows[1].subtotal).toBe(6)
    expect(sb.rows[2].subtotal).toBe(8)
    expect(sb.total).toBe(22)
  })

  test('revealed sequence is [0, 1, 2, 3, 3]', () => {
    const sb = buildLegsSteps(['cat', 'chicken', 'spider'], [2, 3, 1], 'en')
    expect(sb.steps.map((s) => s.revealed)).toEqual([0, 1, 2, 3, 3])
  })

  test('last step has result:true and total in caption', () => {
    const sb = buildLegsSteps(['cat', 'chicken', 'spider'], [2, 3, 1], 'en')
    const last = sb.steps[sb.finalIndex]
    expect(last.result).toBe(true)
    expect(last.caption).toContain('22')
    expect(sb.finalIndex).toBe(sb.steps.length - 1)
  })

  test('language switch: id captions contain "Kalikan", en contain "Multiply"', () => {
    const id = buildLegsSteps(['dog', 'duck', 'ant'], [1, 2, 3], 'id')
    const en = buildLegsSteps(['dog', 'duck', 'ant'], [1, 2, 3], 'en')
    expect(id.steps[0].caption).toContain('Kalikan')
    expect(en.steps[0].caption).toContain('Multiply')
  })

  test('id result caption contains "kaki"', () => {
    const sb = buildLegsSteps(['cat', 'chicken', 'spider'], [2, 3, 1], 'id')
    const last = sb.steps[sb.finalIndex]
    expect(last.caption).toContain('kaki')
  })

  test('5 steps total (beats 0-4)', () => {
    const sb = buildLegsSteps(['cat', 'chicken', 'spider'], [2, 3, 1], 'en')
    expect(sb.steps.length).toBe(5)
  })

  test('rows carry correct animal names per lang', () => {
    const sb = buildLegsSteps(['spider', 'ant', 'cow'], [2, 5, 3], 'id')
    expect(sb.rows[0].id).toBe('laba-laba')
    expect(sb.rows[1].id).toBe('semut')
    expect(sb.rows[2].id).toBe('sapi')
  })
})
