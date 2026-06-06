import { describe, test, expect } from 'vitest'
import { buildCoinGroupSteps } from './coinGroupSteps'

const COINS = [10, 5, 25, 10, 1, 5] // total 56 -> needs 44 for a dollar

describe('buildCoinGroupSteps', () => {
  test('total is the coin sum; needed completes the dollar', () => {
    const s = buildCoinGroupSteps(COINS, 'en')
    expect(s.total).toBe(56)
    expect(s.target).toBe(100)
    expect(s.needed).toBe(44)
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

  test('sum beat shows the total; the final beat completes the dollar', () => {
    const s = buildCoinGroupSteps(COINS, 'en')
    const sumBeat = s.steps.find((x) => x.showSum && !x.showDollar)!
    expect(sumBeat.caption).toContain('56')
    expect(sumBeat.result).toBe(false)

    const last = s.steps[s.finalIndex]
    expect(last.result).toBe(true)
    expect(last.showDollar).toBe(true)
    expect(last.caption).toContain('100 − 56 = 44')
  })

  test('first beat is ungrouped; grouping comes after', () => {
    const s = buildCoinGroupSteps(COINS, 'en')
    expect(s.steps[0].grouped).toBe(false)
    expect(s.steps.some((x) => x.grouped)).toBe(true)
  })

  test('language selects captions', () => {
    expect(buildCoinGroupSteps(COINS, 'en').steps[0].caption).toContain('group')
    expect(buildCoinGroupSteps(COINS, 'id').steps[0].caption).toContain('kelompok')
    expect(buildCoinGroupSteps(COINS, 'id').steps.at(-1)?.caption).toContain('Lengkapi satu dolar')
  })

  test('does not throw on missing/garbage coins', () => {
    expect(() => buildCoinGroupSteps(undefined as unknown as number[], 'en')).not.toThrow()
    const s = buildCoinGroupSteps(undefined as unknown as number[], 'en')
    expect(s.total).toBe(0)
    expect(s.needed).toBe(100)
  })
})
