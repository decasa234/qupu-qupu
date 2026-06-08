import { describe, expect, test } from 'vitest'
import { buildCountRectanglesSteps } from './countRectanglesSteps'

describe('buildCountRectanglesSteps', () => {
  test('2x2 grid has 5 total squares including the 2x2 square', () => {
    const story = buildCountRectanglesSteps(2, 2, 'en')

    expect(story.cols).toBe(2)
    expect(story.rows).toBe(2)
    expect(story.groups.map((g) => [g.size, g.count])).toEqual([
      [1, 4],
      [2, 1],
    ])
    expect(story.total).toBe(5)
    expect(story.steps.at(-1)?.caption).toContain('4 + 1 = 5')
  })

  test('4x3 grid counts squares by size', () => {
    const story = buildCountRectanglesSteps(4, 3, 'en')

    expect(story.groups.map((g) => [g.size, g.count])).toEqual([
      [1, 12],
      [2, 6],
      [3, 2],
    ])
    expect(story.total).toBe(20)
  })

  test('Indonesian caption explains all square sizes', () => {
    const story = buildCountRectanglesSteps(3, 2, 'id')

    expect(story.steps[1].caption.toLowerCase()).toContain('persegi 1x1')
    expect(story.steps.at(-1)?.caption).toContain('6 + 2 = 8')
  })

  test('autoplay has positive holds before the final result beat', () => {
    const story = buildCountRectanglesSteps(4, 3, 'en')
    const holds = story.steps.map((s) => s.hold)

    expect(story.finalIndex).toBeGreaterThan(1)
    expect(holds.slice(0, story.finalIndex).every((hold) => hold > 0)).toBe(true)
    expect(holds[story.finalIndex]).toBe(0)
  })
})
