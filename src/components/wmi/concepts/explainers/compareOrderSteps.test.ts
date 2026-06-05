import { describe, test, expect } from 'vitest'
import { buildCompareOrderSteps } from './compareOrderSteps'

describe('buildCompareOrderSteps', () => {
  test('orders the three numbers largest to smallest', () => {
    const sb = buildCompareOrderSteps(42, 78, 15, 'en')
    expect(sb.given).toEqual([42, 78, 15])
    expect(sb.ordered).toEqual([78, 42, 15])
    expect(sb.chain).toBe('78 > 42 > 15')
  })

  test('runs intro -> bars -> reorder -> > signs -> result chain', () => {
    const sb = buildCompareOrderSteps(42, 78, 15, 'en')
    expect(sb.steps[0].showBars).toBe(false)
    expect(sb.steps[1].showBars).toBe(true)
    expect(sb.steps[1].ordered).toBe(false)
    expect(sb.steps[2].ordered).toBe(true)
    expect(sb.steps[3].showGt).toBe(true)
    const last = sb.steps[sb.finalIndex]
    expect(last.result).toBe(true)
    expect(last.caption).toBe('78 > 42 > 15')
    expect(sb.finalIndex).toBe(sb.steps.length - 1)
  })

  test('result chain is descending regardless of input order', () => {
    const sb = buildCompareOrderSteps(15, 42, 78, 'en')
    expect(sb.chain).toBe('78 > 42 > 15')
    expect(sb.steps[sb.finalIndex].caption).toBe('78 > 42 > 15')
  })

  test('language switches the caption text', () => {
    expect(buildCompareOrderSteps(20, 30, 40, 'id').steps[0].caption).toContain('Tiga bilangan')
    expect(buildCompareOrderSteps(20, 30, 40, 'en').steps[0].caption).toContain('Three numbers')
  })

  test('clamps out-of-range numbers to 11..98', () => {
    const sb = buildCompareOrderSteps(5, 200, 50, 'en')
    expect(sb.given).toEqual([11, 98, 50])
  })
})
