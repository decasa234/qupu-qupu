import { describe, expect, test } from 'vitest'
import { buildMissingAddendStory } from './missingAddendStory'

describe('buildMissingAddendStory', () => {
  test('teaches the missing addend by switching the term across the = sign', () => {
    const story = buildMissingAddendStory({ a: 23, b: 19 })

    expect(story.a).toBe(23)
    expect(story.b).toBe(19)
    expect(story.sum).toBe(42)
    expect(story.finalIndex).toBe(4)
    expect(story.steps.map((step) => step.phase)).toEqual(['equation', 'isolate', 'switch', 'solve', 'answer'])
    expect(story.steps.map((step) => step.caption)).toEqual([
      'Find the missing number: ? + 19 = 42.',
      'To get ? by itself, switch +19 across the = sign.',
      'Crossing the = sign, +19 becomes −19.',
      'Now ? = 42 − 19 = 23.',
      'So ? = 23.',
    ])
    expect(story.steps.slice(0, -1).every((step) => step.hold >= 1300)).toBe(true)
    expect(story.steps.at(-1)?.hold).toBe(0)
    expect(story.steps.at(-1)?.result).toBe(true)
  })

  test('the switch step states the sign-flip rule', () => {
    const switchStep = buildMissingAddendStory({ a: 23, b: 19 }).steps.find((s) => s.phase === 'switch')!
    expect(switchStep.caption).toMatch(/becomes/i)
    expect(switchStep.caption).toContain('+19')
    expect(switchStep.caption).toContain('−19')
  })

  test('Indonesian captions translate the steps', () => {
    const id = buildMissingAddendStory({ a: 8, b: 5 }, 'id')
    expect(id.steps[0].caption).toContain('Cari bilangan yang hilang')
    expect(id.steps[2].caption).toContain('menjadi −5')
    expect(id.steps.at(-1)?.caption).toBe('Jadi ? = 8.')
  })
})
