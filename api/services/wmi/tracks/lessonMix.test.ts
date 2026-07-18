import { describe, expect, it } from 'vitest'
import { pickRecall } from './lessonMix.js'

describe('pickRecall', () => {
  it('picks the least-recently-practiced first', () => {
    const picked = pickRecall(
      [
        { slug: 'fresh', level: 3, lastPracticedMs: 3000 },
        { slug: 'stale', level: 2, lastPracticedMs: 1000 },
        { slug: 'mid', level: 4, lastPracticedMs: 2000 },
      ],
      2,
    )
    expect(picked.map((p) => p.slug)).toEqual(['stale', 'mid'])
  })

  it('returns fewer when the pool is small, empty when none', () => {
    expect(pickRecall([{ slug: 'a', level: 1, lastPracticedMs: 1 }], 2)).toHaveLength(1)
    expect(pickRecall([], 2)).toEqual([])
  })

  it('does not mutate the input array', () => {
    const input = [
      { slug: 'b', level: 1, lastPracticedMs: 2 },
      { slug: 'a', level: 1, lastPracticedMs: 1 },
    ]
    const copy = [...input]
    pickRecall(input, 2)
    expect(input).toEqual(copy)
  })
})
