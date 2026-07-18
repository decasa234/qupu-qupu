import { describe, expect, it } from 'vitest'
import {
  GOLD_LEVEL, GATE_BAR_LEVEL, FOCUS_COUNT, RECALL_COUNT, LESSON_SIZE,
  mapTierToLevel, passesFocus, effectiveLevel,
} from './ladder.js'

describe('ladder', () => {
  it('spec constants', () => {
    expect(GOLD_LEVEL).toBe(5)
    expect(GATE_BAR_LEVEL).toBe(4)
    expect(FOCUS_COUNT).toBe(6)
    expect(RECALL_COUNT).toBe(2)
    expect(LESSON_SIZE).toBe(8)
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
})
