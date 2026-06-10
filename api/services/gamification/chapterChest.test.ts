// Pure tests for the chapter-chest crossing math (P2.2). The grant itself is
// ledger-idempotent (covered by the konsepCommit DB suite); this verifies
// which thresholds a before→after grown-share move makes due.

import { describe, it, expect } from 'vitest'
import { chestThresholdsToGrant } from './chapterChest.js'

describe('chestThresholdsToGrant', () => {
  it('crossing 50% grants the 50 chest', () => {
    expect(chestThresholdsToGrant(9, 10, 20)).toEqual([50])
    expect(chestThresholdsToGrant(0, 1, 2)).toEqual([50])
  })

  it('crossing 100% grants the 100 chest (50 re-attempt is a ledger no-op)', () => {
    expect(chestThresholdsToGrant(19, 20, 20)).toEqual([50, 100])
    expect(chestThresholdsToGrant(1, 2, 2)).toEqual([50, 100])
  })

  it('a single commit can cross both thresholds at once', () => {
    expect(chestThresholdsToGrant(0, 2, 2)).toEqual([50, 100])
    expect(chestThresholdsToGrant(4, 10, 10)).toEqual([50, 100])
  })

  it('below 50% grants nothing', () => {
    expect(chestThresholdsToGrant(0, 1, 3)).toEqual([])
    expect(chestThresholdsToGrant(2, 4, 10)).toEqual([])
  })

  it('exactly at a threshold counts as reached (integer math, no float drift)', () => {
    // 5/10 = exactly 50%
    expect(chestThresholdsToGrant(4, 5, 10)).toEqual([50])
    // 3/7 ≈ 42.9% — not yet; 4/7 ≈ 57.1% — reached
    expect(chestThresholdsToGrant(2, 3, 7)).toEqual([])
    expect(chestThresholdsToGrant(3, 4, 7)).toEqual([50])
  })

  it('self-heals thresholds already reached before (drill grew the chapter silently)', () => {
    // before is already past 50% — re-attempting [50] is intentional; the
    // ledger UNIQUE absorbs it when the chest was already paid.
    expect(chestThresholdsToGrant(10, 11, 20)).toEqual([50])
  })

  it('no growth means nothing to grant — callers skip the chapter count query', () => {
    expect(chestThresholdsToGrant(10, 10, 20)).toEqual([])
    expect(chestThresholdsToGrant(20, 20, 20)).toEqual([])
    expect(chestThresholdsToGrant(5, 4, 20)).toEqual([])
  })

  it('empty chapter grants nothing', () => {
    expect(chestThresholdsToGrant(0, 0, 0)).toEqual([])
    expect(chestThresholdsToGrant(0, 1, 0)).toEqual([])
  })
})
