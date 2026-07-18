import { describe, expect, it } from 'vitest'
import { pickRecall, buildRecallCandidates, type RecallProgressInput } from './lessonMix.js'
import { GOLD_LEVEL } from './ladder.js'

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

describe('buildRecallCandidates', () => {
  const spine = ['a', 'b', 'c', 'd']
  const ISO = '2024-06-15T12:00:00.000Z'

  function progressMap(entries: Record<string, RecallProgressInput>): Map<string, RecallProgressInput> {
    return new Map(Object.entries(entries))
  }

  it('only considers slugs strictly before focusIdx', () => {
    const progress = progressMap({
      a: { level: 2, best_tier: 0, updated_at: ISO },
      b: { level: 2, best_tier: 0, updated_at: ISO },
      c: { level: 2, best_tier: 0, updated_at: ISO },
      d: { level: 2, best_tier: 0, updated_at: ISO },
    })
    const candidates = buildRecallCandidates(spine, 2, progress)
    expect(candidates.map((c) => c.slug)).toEqual(['a', 'b'])
  })

  it('excludes level-0 and missing progress', () => {
    const progress = progressMap({
      a: { level: 0, best_tier: 0, updated_at: ISO },
      // b, c intentionally absent from progress (never played)
    })
    const candidates = buildRecallCandidates(spine, 3, progress)
    expect(candidates).toEqual([])
  })

  it('prefers stored level over the tier-derived level', () => {
    // best_tier 3 -> mapTierToLevel(3) === 4, but a stored level always wins.
    const progress = progressMap({
      a: { level: 1, best_tier: 3, updated_at: ISO },
    })
    const candidates = buildRecallCandidates(spine, 1, progress)
    expect(candidates).toEqual([{ slug: 'a', level: 1, lastPracticedMs: new Date(ISO).getTime() }])
  })

  it('clamps level to GOLD_LEVEL', () => {
    const progress = progressMap({
      a: { level: GOLD_LEVEL + 3, best_tier: 0, updated_at: ISO },
    })
    const candidates = buildRecallCandidates(spine, 1, progress)
    expect(candidates[0].level).toBe(GOLD_LEVEL)
  })

  it('derives staleness ms from a Date object', () => {
    const date = new Date(ISO)
    const progress = progressMap({
      a: { level: 1, best_tier: 0, updated_at: date },
    })
    const candidates = buildRecallCandidates(spine, 1, progress)
    expect(candidates[0].lastPracticedMs).toBe(date.getTime())
  })

  it('derives staleness ms from an ISO string', () => {
    const progress = progressMap({
      a: { level: 1, best_tier: 0, updated_at: ISO },
    })
    const candidates = buildRecallCandidates(spine, 1, progress)
    expect(candidates[0].lastPracticedMs).toBe(new Date(ISO).getTime())
  })
})
