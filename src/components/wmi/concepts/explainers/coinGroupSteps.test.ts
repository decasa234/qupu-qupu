import { describe, test, expect } from 'vitest'
import { buildCoinGroupSteps } from './coinGroupSteps'

const COINS = [10, 5, 25, 10, 1, 5] // total 56

describe('buildCoinGroupSteps', () => {
  test('total is the coin sum', () => {
    expect(buildCoinGroupSteps(COINS, 'en').total).toBe(56)
  })

  test('groups descending by value with correct counts and subtotals', () => {
    expect(buildCoinGroupSteps(COINS, 'en').groups).toEqual([
      { value: 25, count: 1, subtotal: 25 },
      { value: 10, count: 2, subtotal: 20 },
      { value: 5, count: 2, subtotal: 10 },
      { value: 1, count: 1, subtotal: 1 },
    ])
  })

  test('subtotals add up to the total', () => {
    const s = buildCoinGroupSteps(COINS, 'en')
    expect(s.groups.reduce((a, g) => a + g.subtotal, 0)).toBe(s.total)
  })

  test('final beat sums the groups and states the total', () => {
    const s = buildCoinGroupSteps(COINS, 'en')
    const last = s.steps[s.finalIndex]
    expect(last.result).toBe(true)
    expect(last.showSum).toBe(true)
    expect(last.caption).toContain('56')
  })

  test('first beat is ungrouped; grouping comes after', () => {
    const s = buildCoinGroupSteps(COINS, 'en')
    expect(s.steps[0].grouped).toBe(false)
    expect(s.steps.some((x) => x.grouped)).toBe(true)
  })

  test('language selects the opening caption', () => {
    expect(buildCoinGroupSteps(COINS, 'en').steps[0].caption).toContain('group')
    expect(buildCoinGroupSteps(COINS, 'id').steps[0].caption).toContain('kelompok')
  })

  test('does not throw on missing/garbage coins', () => {
    expect(() => buildCoinGroupSteps(undefined as unknown as number[], 'en')).not.toThrow()
    expect(buildCoinGroupSteps(undefined as unknown as number[], 'en').total).toBe(0)
  })
})
