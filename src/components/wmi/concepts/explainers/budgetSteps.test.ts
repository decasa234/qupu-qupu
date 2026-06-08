import { describe, test, expect } from 'vitest'
import { buildBudgetSteps } from './budgetSteps'

describe('buildBudgetSteps', () => {
  test('answer = biggest pair total within budget; winner is that pair', () => {
    // prices 30,90,100,250, budget 200 → pairs ≤200: 120,130,190 → 190 (90+100)
    const sb = buildBudgetSteps([30, 90, 100, 250], 200, 'en')
    expect(sb.answer).toBe(190)
    expect([...sb.winner].sort((a, b) => a - b)).toEqual([90, 100])
  })

  test('tries pair totals from largest down, rejecting over-budget ones until the winner', () => {
    const sb = buildBudgetSteps([30, 90, 100, 250], 200, 'en')
    // intro beat carries no pair
    expect(sb.steps[0].pair).toBeNull()
    // every non-intro beat before the last is over budget (✗), the last is the winner
    const pairBeats = sb.steps.slice(1)
    expect(pairBeats.every((s, i) => (i < pairBeats.length - 1 ? s.fits === false : s.fits === true))).toBe(true)
    // sums strictly descending across the tried pairs
    const sums = pairBeats.map((s) => s.sum as number)
    expect(sums).toEqual([...sums].sort((a, b) => b - a))
  })

  test('last step is the result and names the winning total', () => {
    const sb = buildBudgetSteps([30, 90, 100, 250], 200, 'en')
    const last = sb.steps[sb.finalIndex]
    expect(last.result).toBe(true)
    expect(last.fits).toBe(true)
    expect(last.caption).toContain('190')
    expect(sb.finalIndex).toBe(sb.steps.length - 1)
  })

  test('language switch: en uses "Best pair", id uses "Pasangan terbaik"', () => {
    const en = buildBudgetSteps([30, 90, 100, 250], 200, 'en')
    const id = buildBudgetSteps([30, 90, 100, 250], 200, 'id')
    expect(en.steps[en.finalIndex].caption).toContain('Best pair')
    expect(id.steps[id.finalIndex].caption).toContain('Pasangan terbaik')
    expect(id.steps[0].caption).toContain('Beli dua tiket')
  })
})
