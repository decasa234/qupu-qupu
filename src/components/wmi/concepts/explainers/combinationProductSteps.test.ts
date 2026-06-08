import { describe, expect, test } from 'vitest'
import { buildCombinationProductSteps } from './combinationProductSteps'

describe('buildCombinationProductSteps', () => {
  test('candidate rows keep the target sum and final match has the target product', () => {
    const story = buildCombinationProductSteps(4, 9, 'en')

    expect(story.sum).toBe(13)
    expect(story.product).toBe(36)
    expect(story.answer).toBe(9)
    expect(story.rows.map((r) => [r.a, r.b, r.product])).toEqual([
      [1, 12, 12],
      [2, 11, 22],
      [3, 10, 30],
      [4, 9, 36],
    ])
    expect(story.rows.every((r) => r.a + r.b === story.sum)).toBe(true)
    expect(story.rows.at(-1)?.matches).toBe(true)
    expect(story.steps.at(-1)?.phase).toBe('result')
  })

  test('Indonesian captions explain the same sum-pair strategy', () => {
    const story = buildCombinationProductSteps(3, 8, 'id')

    expect(story.steps[0].caption).toContain('jumlah')
    expect(story.steps.at(-1)?.caption.toLowerCase()).toContain('bilangan yang lebih besar')
  })
})
