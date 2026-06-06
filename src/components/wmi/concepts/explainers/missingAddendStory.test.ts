import { describe, expect, test } from 'vitest'
import { buildMissingAddendStory } from './missingAddendStory'

describe('buildMissingAddendStory', () => {
  test('teaches the missing addend as a part–whole inverse operation', () => {
    const story = buildMissingAddendStory({ a: 23, b: 19 })

    expect(story.a).toBe(23)
    expect(story.b).toBe(19)
    expect(story.sum).toBe(42)
    expect(story.finalIndex).toBe(4)
    expect(story.steps.map((step) => step.phase)).toEqual(['equation', 'parts', 'inverse', 'solve', 'answer'])
    expect(story.steps.map((step) => step.caption)).toEqual([
      'Find the missing number: ? + 19 = 42.',
      '? and 19 are two parts that together make 42.',
      'To find a missing part, subtract the part you know.',
      'Whole minus known part: 42 − 19 = 23.',
      'So ? = 23.',
    ])
    expect(story.steps.slice(0, -1).every((step) => step.hold >= 1300)).toBe(true)
    expect(story.steps.at(-1)?.hold).toBe(0)
    expect(story.steps.at(-1)?.result).toBe(true)
  })

  test('does NOT use algebraic transposition language', () => {
    const captions = buildMissingAddendStory({ a: 23, b: 19 }).steps.map((s) => s.caption).join(' ')
    expect(captions).not.toMatch(/across the equals sign/i)
    expect(captions).not.toMatch(/becomes -/i)
  })

  test('Indonesian captions translate the steps', () => {
    const id = buildMissingAddendStory({ a: 8, b: 5 }, 'id')
    expect(id.steps[0].caption).toContain('Cari bilangan yang hilang')
    expect(id.steps[2].caption).toContain('kurangi bagian yang diketahui')
    expect(id.steps.at(-1)?.caption).toBe('Jadi ? = 8.')
  })
})
