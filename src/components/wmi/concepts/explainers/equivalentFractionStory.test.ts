import { describe, expect, test } from 'vitest'
import { buildEquivalentFractionStory } from './equivalentFractionStory'

describe('buildEquivalentFractionStory', () => {
  test('scales numerator and denominator by the same factor', () => {
    const story = buildEquivalentFractionStory(2, 3, 4)
    expect(story.newDen).toBe(12)
    expect(story.answer).toBe(8)
  })

  test('5 phases ending in the result; never uses the □ square', () => {
    const story = buildEquivalentFractionStory(2, 3, 4)
    expect(story.finalIndex).toBe(4)
    expect(story.steps.map((s) => s.phase)).toEqual(['show', 'denom', 'same', 'solve', 'answer'])
    expect(story.steps.at(-1)?.result).toBe(true)
    const all = story.steps.map((s) => s.caption).join(' ')
    expect(all).not.toContain('□')
    expect(story.steps[0].caption).toContain('?/12')
  })

  test('Indonesian translation', () => {
    const id = buildEquivalentFractionStory(2, 3, 4, 'id')
    expect(id.steps[0].caption).toContain('Cari bilangan atas')
    expect(id.steps[1].caption).toContain('Penyebut dikali 4')
    expect(id.steps.at(-1)?.caption).toBe('Jadi 2/3 = 8/12.')
  })
})
