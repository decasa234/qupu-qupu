// Pure quest-matching + progress-step logic (no DB). Covers the WMI
// targeting added in migration 0037: 'konsep' quests match purely on
// target_metric == eventType, and batched events advance progress by
// incrementBy with clamping.

import { describe, it, expect } from 'vitest'
import { __test__ } from './questEvaluator.js'

const { questMatches, nextProgress } = __test__

function row(overrides: Partial<Parameters<typeof questMatches>[0]> = {}) {
  return {
    id: 'q1',
    template_id: 't1',
    code: 'konsep_session_1',
    quest_type: 'konsep',
    target_metric: 'KONSEP_SESSION_COMPLETED',
    target_value: 1,
    xp_reward: 20,
    coin_reward: 10,
    progress_value: 0,
    status: 'active' as const,
    title_rendered: 'Selesaikan 1 sesi latihan',
    template_metadata: {},
    instance_metadata: {},
    ...overrides,
  }
}

function event(overrides: Partial<Parameters<typeof questMatches>[1]> = {}) {
  return {
    childId: 'c1',
    eventType: 'KONSEP_SESSION_COMPLETED',
    eventSourceType: 'wmi_session',
    eventSourceId: 's1',
    ...overrides,
  }
}

describe('questMatches', () => {
  it('matches a konsep quest purely on target_metric == eventType', () => {
    expect(questMatches(row(), event())).toBe(true)
  })

  it('rejects when the event type differs from target_metric', () => {
    expect(questMatches(row(), event({ eventType: 'KONSEP_QUESTION_ANSWERED' }))).toBe(false)
    expect(questMatches(row(), event({ eventType: 'QUIZ_SCORE_SUBMITTED' }))).toBe(false)
  })

  it('matches each WMI target metric to its own event only', () => {
    const answers = row({
      code: 'konsep_answers_10',
      target_metric: 'KONSEP_QUESTION_ANSWERED',
      target_value: 10,
    })
    const grow = row({
      code: 'konsep_grow_1',
      target_metric: 'KONSEP_CONCEPT_GROWN',
    })
    expect(questMatches(answers, event({ eventType: 'KONSEP_QUESTION_ANSWERED' }))).toBe(true)
    expect(questMatches(answers, event({ eventType: 'KONSEP_CONCEPT_GROWN' }))).toBe(false)
    expect(questMatches(grow, event({ eventType: 'KONSEP_CONCEPT_GROWN' }))).toBe(true)
    expect(questMatches(grow, event({ eventType: 'KONSEP_SESSION_COMPLETED' }))).toBe(false)
  })

  it('rejects non-active quests', () => {
    expect(questMatches(row({ status: 'completed' }), event())).toBe(false)
    expect(questMatches(row({ status: 'claimed' }), event())).toBe(false)
  })

  it('keeps the subject_focus constraint intact (video path)', () => {
    const focus = row({
      quest_type: 'subject_focus',
      target_metric: 'QUIZ_SCORE_SUBMITTED',
      instance_metadata: { subjectId: 'subj-a' },
    })
    const quizEvent = event({ eventType: 'QUIZ_SCORE_SUBMITTED' })
    expect(questMatches(focus, { ...quizEvent, videoSubjectId: 'subj-a' })).toBe(true)
    expect(questMatches(focus, { ...quizEvent, videoSubjectId: 'subj-b' })).toBe(false)
  })

  it('keeps the streak min_current_streak constraint intact (video path)', () => {
    const streak = row({
      quest_type: 'streak',
      target_metric: 'QUIZ_SCORE_SUBMITTED',
      template_metadata: { min_current_streak: 2 },
    })
    const quizEvent = event({ eventType: 'QUIZ_SCORE_SUBMITTED' })
    expect(questMatches(streak, { ...quizEvent, currentStreakDays: 2 })).toBe(true)
    expect(questMatches(streak, { ...quizEvent, currentStreakDays: 1 })).toBe(false)
  })
})

describe('nextProgress', () => {
  it('defaults to a +1 step (the video-quiz contract)', () => {
    expect(nextProgress(0, 1)).toBe(1)
    expect(nextProgress(2, 5)).toBe(3)
  })

  it('advances by incrementBy for batched WMI events', () => {
    // 20 answers against the "Jawab 10 soal" quest completes it in one go.
    expect(nextProgress(0, 10, 20)).toBe(10)
    expect(nextProgress(3, 10, 4)).toBe(7)
  })

  it('clamps at the target', () => {
    expect(nextProgress(9, 10, 20)).toBe(10)
    expect(nextProgress(10, 10, 1)).toBe(10)
  })

  it('treats invalid increments as 1', () => {
    expect(nextProgress(0, 10, 0)).toBe(1)
    expect(nextProgress(0, 10, -5)).toBe(1)
    expect(nextProgress(0, 10, undefined)).toBe(1)
  })

  it('floors fractional increments', () => {
    expect(nextProgress(0, 10, 2.9)).toBe(2)
  })
})
