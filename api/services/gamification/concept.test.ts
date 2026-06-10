// Pure unit tests for the P2.1 mastery-scaled concept XP economy.
// No DB — the curve, the bonus table, and the tier-crossing helper.

import { describe, test, expect } from 'vitest'
import { conceptXpForTier, crossedTiers, TIER_UP_BONUS, CONCEPT_CORRECT_COINS } from './concept.js'

describe('conceptXpForTier', () => {
  test('scales down with mastery: 5 / 4 / 2 / 1', () => {
    expect(conceptXpForTier(0)).toBe(5)
    expect(conceptXpForTier(1)).toBe(5)
    expect(conceptXpForTier(2)).toBe(4)
    expect(conceptXpForTier(3)).toBe(2)
    expect(conceptXpForTier(4)).toBe(1)
  })

  test('kindness floor: never zero, even past Dikuasai', () => {
    expect(conceptXpForTier(5)).toBe(1)
    expect(conceptXpForTier(99)).toBe(1)
  })

  test('coins stay flat at 1 per correct answer', () => {
    expect(CONCEPT_CORRECT_COINS).toBe(1)
  })
})

describe('TIER_UP_BONUS', () => {
  test('Berlatih +5, Mahir +20 (+5 koin), Dikuasai +40 (+10 koin)', () => {
    expect(TIER_UP_BONUS[2]).toEqual({ xp: 5, coins: 0 })
    expect(TIER_UP_BONUS[3]).toEqual({ xp: 20, coins: 5 })
    expect(TIER_UP_BONUS[4]).toEqual({ xp: 40, coins: 10 })
  })
})

describe('crossedTiers', () => {
  test('single-step crossings', () => {
    expect(crossedTiers(1, 2)).toEqual([2])
    expect(crossedTiers(2, 3)).toEqual([3])
    expect(crossedTiers(3, 4)).toEqual([4])
  })

  test('multi-tier jumps cross every threshold in between', () => {
    expect(crossedTiers(0, 3)).toEqual([2, 3])
    expect(crossedTiers(0, 4)).toEqual([2, 3, 4])
    expect(crossedTiers(2, 4)).toEqual([3, 4])
  })

  test('no crossing below the bonus tiers or without a rise', () => {
    expect(crossedTiers(0, 1)).toEqual([])
    expect(crossedTiers(2, 2)).toEqual([])
    expect(crossedTiers(4, 4)).toEqual([])
    // best_tier is monotonic, but a (bad) downward input must not grant.
    expect(crossedTiers(3, 2)).toEqual([])
  })
})
