import { describe, expect, test } from 'vitest'
import {
  buildAssignmentCycleSteps,
  buildCountShapesSteps,
  buildOperatorFillSteps,
  buildPositionLineSteps,
  buildRangeCountSteps,
  buildSumPartitionSteps,
  buildVennSteps,
  buildWhichMightBeSteps,
} from './logicSteps'

describe('logic explainer step builders', () => {
  test('L1 position-in-line computes front + self + back', () => {
    const story = buildPositionLineSteps({ name: 'Maya', fromFront: 4, fromBack: 6 }, 'en')
    expect(story.total).toBe(9)
    expect(story.frontCount).toBe(3)
    expect(story.backCount).toBe(5)
    expect(story.steps.at(-1)?.caption).toContain('3 + 1 + 5 = 9')
  })

  test('L2 assignment-cycle uses kid-friendly skip-count + count-on (no remainder/division)', () => {
    const story = buildAssignmentCycleSteps({ cycle: 4, n: 14 }, 'en')
    expect(story.fullTrips).toBe(3)
    expect(story.lastFull).toBe(12)
    expect(story.leftover).toBe(2)
    expect(story.answer).toBe('B')
    const captions = story.steps.map((s) => s.caption).join(' ')
    expect(captions).not.toMatch(/remainder|divided|\bmod\b/i)
    expect(story.steps.at(-1)?.caption).toContain('B')
  })

  test('L3 operator-fill finds the option whose signs hit the target', () => {
    const story = buildOperatorFillSteps(
      { nums: [10, 3, 2, 1], target: 8, options: [['+', '+', '+'], ['-', '+', '-'], ['-', '-', '+'], ['+', '-', '-']] },
      'en',
    )
    expect(story.correctLabel).toBe('B')
    expect(story.rows.find((row) => row.label === 'B')?.result).toBe(8)
  })

  test('L4 which-might-be accepts only candidate passing all clues', () => {
    const story = buildWhichMightBeSteps({ lo: 20, hi: 40, k: 10, options: [37, 28, 41, 35] }, 'en')
    expect(story.correctLabel).toBe('A')
    expect(story.rows[0]).toMatchObject({ odd: true, range: true, digit: true })
  })

  test('L5 range-count-evaluate counts expression results in inclusive range', () => {
    const story = buildRangeCountSteps(
      { lo: 10, hi: 20, exprs: [{ op: '+', x: 7, y: 8 }, { op: '-', x: 40, y: 10 }, { op: '+', x: 9, y: 2 }, { op: '-', x: 18, y: 8 }] },
      'en',
    )
    expect(story.count).toBe(3)
    expect(story.rows.map((row) => row.inRange)).toEqual([true, false, true, true])
  })

  test('L6 sum-partition-split divides total parts into one part', () => {
    const story = buildSumPartitionSteps({ small: 12, k: 3 }, 'en')
    expect(story.total).toBe(48)
    expect(story.parts).toBe(4)
    expect(story.answer).toBe(12)
  })

  test('L7 venn-set-membership sums A-only numbers', () => {
    const story = buildVennSteps({ aOnly: [3, 8], both: [5], bOnly: [7, 9] }, 'en')
    expect(story.answer).toBe(11)
    expect(story.steps.at(-1)?.caption).toContain('3 + 8 = 11')
  })

  test('C3 count-shapes-in-figure counts fan triangles by width', () => {
    const story = buildCountShapesSteps({ segments: 4 }, 'en')
    expect(story.groups.map((group) => [group.width, group.count])).toEqual([[1, 4], [2, 3], [3, 2], [4, 1]])
    expect(story.total).toBe(10)
  })
})
