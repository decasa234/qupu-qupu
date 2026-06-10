// Pure predicate logic for the WMI achievement types added in migration
// 0037 (concept_mahir_first, chapter_test_passed_first,
// konsep_sessions_completed) plus the extended streak family and the
// migration-0042 long-arc extensions (streak_100 / garden_10_mahir /
// first_gold_chapter via the gold_chapter_first type).

import { describe, it, expect } from 'vitest'
import { __test__ } from './achievementEvaluator.js'

const { predicateSatisfied, progressFor } = __test__

type Template = Parameters<typeof predicateSatisfied>[0]
type State = Parameters<typeof predicateSatisfied>[1]
type Streak = Parameters<typeof predicateSatisfied>[2]

function template(overrides: Partial<Template>): Template {
  return {
    id: 't1',
    code: 'x',
    title: 'X',
    description: '',
    achievement_type: 'concept_mahir_first',
    target_value: 1,
    xp_reward: 0,
    icon_key: null,
    sort_order: 0,
    ...overrides,
  }
}

function state(overrides: Partial<State> = {}): State {
  return {
    unlocksCount: 0,
    badgesSum: 0,
    distinctSubjects: 0,
    eventTypes: new Set<string>(),
    mahirConcepts: 0,
    chapterTestsPassed: 0,
    konsepSessions: 0,
    goldChapters: 0,
    ...overrides,
  }
}

const noStreak: Streak = {
  currentStreakDays: 0,
  longestStreakDays: 0,
  preBreakStreakDays: 0,
  lastActivityDate: null,
  recoveryEligible: false,
}

describe('WMI achievement predicates', () => {
  it('concept_mahir_first unlocks at the first Mahir-tier concept', () => {
    const tpl = template({ achievement_type: 'concept_mahir_first', target_value: 1 })
    expect(predicateSatisfied(tpl, state(), noStreak)).toBe(false)
    expect(predicateSatisfied(tpl, state({ mahirConcepts: 1 }), noStreak)).toBe(true)
  })

  it('chapter_test_passed_first unlocks on the first passed Tes Bab', () => {
    const tpl = template({ achievement_type: 'chapter_test_passed_first', target_value: 1 })
    expect(predicateSatisfied(tpl, state(), noStreak)).toBe(false)
    expect(predicateSatisfied(tpl, state({ chapterTestsPassed: 1 }), noStreak)).toBe(true)
  })

  it('konsep_sessions_completed counts committed sessions toward target', () => {
    const tpl = template({ achievement_type: 'konsep_sessions_completed', target_value: 5 })
    expect(predicateSatisfied(tpl, state({ konsepSessions: 4 }), noStreak)).toBe(false)
    expect(predicateSatisfied(tpl, state({ konsepSessions: 5 }), noStreak)).toBe(true)
  })

  it('streak_threshold covers the extended 14/30-day family', () => {
    const tpl14 = template({ achievement_type: 'streak_threshold', target_value: 14 })
    const tpl30 = template({ achievement_type: 'streak_threshold', target_value: 30 })
    const streak14: Streak = { ...noStreak, currentStreakDays: 14 }
    expect(predicateSatisfied(tpl14, state(), streak14)).toBe(true)
    expect(predicateSatisfied(tpl30, state(), streak14)).toBe(false)
  })

  it('unknown achievement types never unlock', () => {
    const tpl = template({ achievement_type: 'made_up_type' })
    expect(predicateSatisfied(tpl, state({ mahirConcepts: 99 }), noStreak)).toBe(false)
  })
})

describe('0042 long-arc achievement predicates', () => {
  it('streak_100 rides streak_threshold with target 100 from the seed row', () => {
    const tpl = template({ achievement_type: 'streak_threshold', target_value: 100 })
    expect(predicateSatisfied(tpl, state(), { ...noStreak, currentStreakDays: 99 })).toBe(false)
    expect(predicateSatisfied(tpl, state(), { ...noStreak, currentStreakDays: 100 })).toBe(true)
  })

  it('garden_10_mahir rides concept_mahir_first with target 10', () => {
    const tpl = template({ achievement_type: 'concept_mahir_first', target_value: 10 })
    expect(predicateSatisfied(tpl, state({ mahirConcepts: 9 }), noStreak)).toBe(false)
    expect(predicateSatisfied(tpl, state({ mahirConcepts: 10 }), noStreak)).toBe(true)
  })

  it('gold_chapter_first fires only when a whole chapter is grown', () => {
    const tpl = template({ achievement_type: 'gold_chapter_first', target_value: 1 })
    // Lots of Mahir plants spread across chapters is NOT enough — the SQL
    // aggregate only counts chapters where EVERY enabled concept is grown.
    expect(predicateSatisfied(tpl, state({ mahirConcepts: 25, goldChapters: 0 }), noStreak)).toBe(
      false,
    )
    expect(predicateSatisfied(tpl, state({ goldChapters: 1 }), noStreak)).toBe(true)
  })
})

describe('WMI achievement progress', () => {
  it('reports raw counters for the new types', () => {
    const s = state({ mahirConcepts: 2, chapterTestsPassed: 1, konsepSessions: 3, goldChapters: 1 })
    expect(progressFor(template({ achievement_type: 'concept_mahir_first' }), s, noStreak)).toBe(2)
    expect(progressFor(template({ achievement_type: 'chapter_test_passed_first' }), s, noStreak)).toBe(1)
    expect(progressFor(template({ achievement_type: 'konsep_sessions_completed' }), s, noStreak)).toBe(3)
    expect(progressFor(template({ achievement_type: 'gold_chapter_first' }), s, noStreak)).toBe(1)
  })
})
