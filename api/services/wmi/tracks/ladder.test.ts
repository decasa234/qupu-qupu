import { describe, expect, it } from 'vitest'
import {
  GOLD_LEVEL, GATE_BAR_LEVEL, FOCUS_COUNT, RECALL_COUNT, LESSON_SIZE,
  LESSON_PASS_XP, LESSON_PASS_COINS,
  mapTierToLevel, passesFocus, effectiveLevel, canViewTrack,
} from './ladder.js'

describe('ladder', () => {
  it('spec constants', () => {
    expect(GOLD_LEVEL).toBe(5)
    expect(GATE_BAR_LEVEL).toBe(4)
    expect(FOCUS_COUNT).toBe(6)
    expect(RECALL_COUNT).toBe(2)
    expect(LESSON_SIZE).toBe(8)
    expect(LESSON_PASS_XP).toBe(10)
    expect(LESSON_PASS_COINS).toBe(2)
  })

  it('maps old tiers preserving unlock semantics (0,1,2,3→4,4→5)', () => {
    expect([0, 1, 2, 3, 4].map(mapTierToLevel)).toEqual([0, 1, 2, 4, 5])
  })

  it('clamps garbage tiers into 0..5', () => {
    expect(mapTierToLevel(-1)).toBe(0)
    expect(mapTierToLevel(9)).toBe(5)
  })

  it('one-miss pass rule on focus questions', () => {
    expect(passesFocus([true, true, true, true, true, true])).toBe(true)
    expect(passesFocus([true, false, true, true, true, true])).toBe(true)
    expect(passesFocus([false, false, true, true, true, true])).toBe(false)
    expect(passesFocus([])).toBe(false) // no evidence, no pass
  })

  it('effectiveLevel prefers the stored level, else derives from tier', () => {
    expect(effectiveLevel(3, 4)).toBe(3)
    expect(effectiveLevel(0, 3)).toBe(0)
    expect(effectiveLevel(null, 3)).toBe(4)
    expect(effectiveLevel(null, 0)).toBe(0)
  })

  it('canViewTrack: published is visible to everyone', () => {
    expect(canViewTrack('published', 'admin')).toBe(true)
    expect(canViewTrack('published', 'parent')).toBe(true)
    expect(canViewTrack('published', undefined)).toBe(true)
  })

  it('canViewTrack: review is admin-only', () => {
    expect(canViewTrack('review', 'admin')).toBe(true)
    expect(canViewTrack('review', 'parent')).toBe(false)
    expect(canViewTrack('review', undefined)).toBe(false)
  })

  it('canViewTrack: draft is hidden from everyone, even admin', () => {
    expect(canViewTrack('draft', 'admin')).toBe(false)
    expect(canViewTrack('draft', 'parent')).toBe(false)
    expect(canViewTrack('draft', undefined)).toBe(false)
  })
})
