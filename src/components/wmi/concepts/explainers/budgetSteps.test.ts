import { describe, test, expect } from 'vitest'
import { buildBudgetSteps } from './budgetSteps'

describe('buildBudgetSteps', () => {
  test('affordable = price <= budget for each check', () => {
    const prices = [120, 300, 80, 260]
    const budget = 250
    const sb = buildBudgetSteps(prices, budget, 'en')
    sb.checks.forEach((c) => expect(c.affordable).toBe(c.price <= budget))
  })

  test('answer = max of affordable prices', () => {
    // prices [120,300,80,260], budget 250 → affordable [120,80] → answer 120
    const sb = buildBudgetSteps([120, 300, 80, 260], 250, 'en')
    expect(sb.answer).toBe(120)
  })

  test('winnerIndex points to the answer price in the prices array', () => {
    const prices = [120, 300, 80, 260]
    const budget = 250
    const sb = buildBudgetSteps(prices, budget, 'en')
    expect(sb.winnerIndex).toBe(0) // prices[0] === 120
    expect(prices[sb.winnerIndex]).toBe(sb.answer)
  })

  test('checked sequence is [0,1,2,3,4,4]', () => {
    const sb = buildBudgetSteps([120, 300, 80, 260], 250, 'en')
    expect(sb.steps.map((s) => s.checked)).toEqual([0, 1, 2, 3, 4, 4])
  })

  test('last step has result:true and answer in caption', () => {
    const sb = buildBudgetSteps([120, 300, 80, 260], 250, 'en')
    const last = sb.steps[sb.finalIndex]
    expect(last.result).toBe(true)
    expect(last.caption).toContain('120')
    expect(sb.finalIndex).toBe(sb.steps.length - 1)
  })

  test('finalIndex is always steps.length - 1', () => {
    const sb = buildBudgetSteps([50, 200, 150, 300], 175, 'en')
    expect(sb.finalIndex).toBe(sb.steps.length - 1)
    expect(sb.steps.length).toBe(6)
  })

  test('language switch: id uses "Coret", en uses "Cross"', () => {
    const id = buildBudgetSteps([120, 300, 80, 260], 250, 'id')
    const en = buildBudgetSteps([120, 300, 80, 260], 250, 'en')
    expect(id.steps[0].caption).toContain('Coret')
    expect(en.steps[0].caption).toContain('Cross')
  })

  test('language switch: id result caption uses "termahal"', () => {
    const id = buildBudgetSteps([120, 300, 80, 260], 250, 'id')
    const last = id.steps[id.finalIndex]
    expect(last.caption).toContain('termahal')
  })

  test('different prices/budget: answer = max affordable', () => {
    // prices [50,200,150,300], budget 175 → affordable [50,150] → answer 150
    const sb = buildBudgetSteps([50, 200, 150, 300], 175, 'en')
    expect(sb.answer).toBe(150)
    expect(sb.checks.filter((c) => c.affordable).map((c) => c.price)).toEqual([50, 150])
  })

  test('winnerIndex correct for second example', () => {
    // prices [50,200,150,300], budget 175 → answer 150 at index 2
    const prices = [50, 200, 150, 300]
    const sb = buildBudgetSteps(prices, 175, 'en')
    expect(sb.winnerIndex).toBe(2)
    expect(prices[sb.winnerIndex]).toBe(150)
  })
})
