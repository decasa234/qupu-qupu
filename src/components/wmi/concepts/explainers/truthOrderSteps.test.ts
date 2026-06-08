import { describe, test, expect } from 'vitest'
import { buildTruthOrderSteps } from './truthOrderSteps'

const ORDER = ['Cody', 'Amy', 'Evan', 'Ben', 'Dina'] // true first→last
const CLUE_ORDER = [2, 0, 3, 1] // scrambled presentation

describe('buildTruthOrderSteps', () => {
  test('answer is the head of the chain', () => {
    const sb = buildTruthOrderSteps(ORDER, CLUE_ORDER, 'en')
    expect(sb.answer).toBe('Cody')
    expect(sb.order).toEqual(ORDER)
  })

  test('opens with the scrambled clues, then links one person per beat, then reveals first', () => {
    const sb = buildTruthOrderSteps(ORDER, CLUE_ORDER, 'en')
    // First beat shows the jumbled clues (presented in clueOrder), no cards yet.
    expect(sb.steps[0].placed).toEqual([])
    expect(sb.steps[0].caption).toContain('Evan→Ben') // consecutive[2] = Evan→Ben, shown first
    // The line grows by one each beat: 2,3,4,5 cards.
    const placedCounts = sb.steps.map((s) => s.placed.length)
    expect(placedCounts).toEqual([0, 2, 3, 4, 5, 5])
    // Final beat reveals the head.
    const last = sb.steps[sb.finalIndex]
    expect(last.result).toBe(true)
    expect(last.placed).toEqual(ORDER)
    expect(last.caption).toContain('Cody')
  })

  test('Indonesian translation', () => {
    const sb = buildTruthOrderSteps(ORDER, CLUE_ORDER, 'id')
    expect(sb.steps[0].caption).toContain('teracak')
    expect(sb.steps.at(-1)?.caption).toContain('pertama')
  })
})
