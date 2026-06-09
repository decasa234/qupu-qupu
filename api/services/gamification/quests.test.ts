// Pure mapping from a generator quest row to the GET /api/me/quests item.

import { describe, it, expect } from 'vitest'
import { mapQuestForApi } from './quests.js'
import type { ActiveQuest } from './questGenerator.js'

function quest(overrides: Partial<ActiveQuest> = {}): ActiveQuest {
  return {
    id: 'q1',
    templateId: 't1',
    code: 'konsep_answers_10',
    title: 'Jawab 10 soal konsep',
    description: 'Jawab 10 soal latihan konsep di kebun belajarmu hari ini.',
    questType: 'konsep',
    targetMetric: 'KONSEP_QUESTION_ANSWERED',
    progressValue: 3,
    targetValue: 10,
    status: 'active',
    xpReward: 15,
    coinReward: 10,
    claimedAt: null,
    metadata: {},
    ...overrides,
  }
}

describe('mapQuestForApi', () => {
  it('maps generator fields to the API shape', () => {
    expect(mapQuestForApi(quest())).toEqual({
      id: 'q1',
      title: 'Jawab 10 soal konsep',
      description: 'Jawab 10 soal latihan konsep di kebun belajarmu hari ini.',
      progress: 3,
      target: 10,
      rewardCoins: 10,
      rewardXp: 15,
      completed: false,
      claimedAt: null,
    })
  })

  it('marks completed and claimed quests as completed', () => {
    expect(mapQuestForApi(quest({ status: 'completed' })).completed).toBe(true)
    const claimed = mapQuestForApi(
      quest({ status: 'claimed', claimedAt: '2026-06-10T03:00:00.000Z' }),
    )
    expect(claimed.completed).toBe(true)
    expect(claimed.claimedAt).toBe('2026-06-10T03:00:00.000Z')
  })

  it('keeps expired quests not-completed', () => {
    expect(mapQuestForApi(quest({ status: 'expired' })).completed).toBe(false)
  })
})
