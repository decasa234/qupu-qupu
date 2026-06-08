import { describe, expect, test } from 'vitest'
import { buildArrangeDigitsStory } from './arrangeDigitsStory'

describe('buildArrangeDigitsStory', () => {
  test('forms 6 two-digit numbers, sorts them, and picks the rank-th smallest', () => {
    const story = buildArrangeDigitsStory([7, 3, 5], 3) // unsorted digits so sorting does work

    expect(story.formed).toEqual([73, 75, 37, 35, 57, 53])
    expect(story.sorted).toEqual([35, 37, 53, 57, 73, 75])
    expect(story.answer).toBe(53) // 3rd smallest
    expect(story.formed).toHaveLength(6)
  })

  test('5 phases ending in the result', () => {
    const story = buildArrangeDigitsStory([7, 3, 5], 3)
    expect(story.finalIndex).toBe(4)
    expect(story.steps.map((s) => s.phase)).toEqual(['digits', 'form', 'sort', 'count', 'answer'])
    expect(story.steps.at(-1)?.result).toBe(true)
    expect(story.steps.at(-1)?.caption).toContain('53')
    expect(story.steps.slice(0, -1).every((s) => s.hold >= 1300)).toBe(true)
  })

  test('English ordinals and Indonesian translation', () => {
    expect(buildArrangeDigitsStory([7, 3, 5], 2, 'en').steps[3].caption).toContain('2nd')
    expect(buildArrangeDigitsStory([7, 3, 5], 3, 'en').steps[3].caption).toContain('3rd')
    const id = buildArrangeDigitsStory([7, 3, 5], 3, 'id')
    expect(id.steps[0].caption).toContain('Gunakan angka')
    expect(id.steps[3].caption).toContain('urutan ke-3')
    expect(id.steps.at(-1)?.caption).toContain('Bilangan terkecil ke-3')
  })
})
