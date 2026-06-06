import { describe, test, expect } from 'vitest'
import { buildDiceOppositeSteps } from './diceOppositeSteps'

describe('buildDiceOppositeSteps', () => {
  test('each opposite is 7 − the shown face, and they sum to the hidden total', () => {
    const sb = buildDiceOppositeSteps(2, 4, 5, 'en')
    expect([sb.tOpp, sb.fOpp, sb.rOpp]).toEqual([5, 3, 2])
    expect(sb.hidden).toBe(10)
    // The opposite-add method must agree with the all-faces-sum-to-21 identity.
    expect(sb.hidden).toBe(21 - sb.visible)
  })

  test('5 phases ending in the result; the add step shows the opposites summed', () => {
    const sb = buildDiceOppositeSteps(1, 2, 3, 'en') // a valid die view (one face per opposite pair)
    expect(sb.steps.map((s) => s.phase)).toEqual(['rule', 'visible', 'opposites', 'add', 'result'])
    const add = sb.steps.find((s) => s.phase === 'add')!
    expect(add.caption).toContain(`${sb.tOpp} + ${sb.fOpp} + ${sb.rOpp} = ${sb.hidden}`)
    const last = sb.steps[sb.finalIndex]
    expect(last.result).toBe(true)
    expect(last.caption).toContain(String(sb.hidden))
  })

  test('language switches the caption text', () => {
    expect(buildDiceOppositeSteps(1, 2, 3, 'id').steps[0].caption).toContain('berhadapan')
    expect(buildDiceOppositeSteps(1, 2, 3, 'en').steps[0].caption).toContain('opposite')
  })
})
