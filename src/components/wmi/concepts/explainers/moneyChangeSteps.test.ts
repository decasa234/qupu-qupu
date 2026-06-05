import { describe, test, expect } from 'vitest'
import { buildMoneyChangeSteps } from './moneyChangeSteps'

describe('buildMoneyChangeSteps', () => {
  test('change = pay - cost (50 - 30 = 20)', () => {
    const sb = buildMoneyChangeSteps(30, 50, 'Budi', 'book', 'buku', 'en')
    expect(sb.change).toBe(20)
    expect(sb.pay).toBe(50)
    expect(sb.cost).toBe(30)
  })

  test('4 phases in order: setup -> rule -> compute -> result', () => {
    const sb = buildMoneyChangeSteps(30, 50, 'Budi', 'book', 'buku', 'en')
    expect(sb.steps.map((s) => s.phase)).toEqual(['setup', 'rule', 'compute', 'result'])
  })

  test('last step has result:true and change in caption', () => {
    const sb = buildMoneyChangeSteps(30, 50, 'Budi', 'book', 'buku', 'en')
    const last = sb.steps[sb.finalIndex]
    expect(last.result).toBe(true)
    expect(last.caption).toContain('20')
    expect(sb.finalIndex).toBe(sb.steps.length - 1)
  })

  test('language switch: id uses "membayar", en uses "pays"', () => {
    const sbId = buildMoneyChangeSteps(30, 50, 'Budi', 'book', 'buku', 'id')
    const sbEn = buildMoneyChangeSteps(30, 50, 'Budi', 'book', 'buku', 'en')
    expect(sbId.steps[0].caption).toContain('membayar')
    expect(sbEn.steps[0].caption).toContain('pays')
  })

  test('id rule caption uses "Kembalian"', () => {
    const sb = buildMoneyChangeSteps(10, 25, 'Ana', 'pen', 'pena', 'id')
    expect(sb.steps[1].caption).toContain('Kembalian')
  })

  test('en rule caption uses "Change"', () => {
    const sb = buildMoneyChangeSteps(10, 25, 'Ana', 'pen', 'pena', 'en')
    expect(sb.steps[1].caption).toContain('Change')
  })

  test('compute step contains both pay and cost values', () => {
    const sb = buildMoneyChangeSteps(10, 25, 'Ana', 'pen', 'pena', 'en')
    const compute = sb.steps[2]
    expect(compute.phase).toBe('compute')
    expect(compute.caption).toContain('25')
    expect(compute.caption).toContain('10')
    expect(compute.caption).toContain('15')
  })
})
