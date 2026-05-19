// api/services/gamification/questEvaluator.ts
//
// Evaluate active quests against incoming events. For each event the
// gamification orchestrator emits, walk the child's active quests for
// today's WIB window and increment progress on matching templates.
//
// Quests are matched primarily by `target_metric == event.eventType`,
// with extra constraints for type-specific quests:
//   - `subject_focus` only progresses if the event's metadata.subjectId
//     matches the quest's metadata.subjectId.
//   - `streak` progresses on QUIZ_SCORE_SUBMITTED only when the
//     metadata.min_current_streak threshold is satisfied.
//
// On completion: status → 'completed' AND a DAILY_QUEST_XP ledger row
// is appended (idempotent on the quest instance id).

import type { PoolClient } from 'pg'
import { query } from '../../db.js'
import { appendLedger } from './ledger.js'

export interface QuestEventInput {
  childId: string
  eventType: string
  eventSourceType: string
  eventSourceId: string
  videoSubjectId?: string | null
  currentStreakDays?: number
}

export interface QuestProgressResult {
  questId: string
  code: string
  title: string
  status: 'active' | 'completed' | 'claimed' | 'expired'
  progressValue: number
  targetValue: number
  justCompleted: boolean
  xpAwarded: number
}

interface ActiveQuestRow {
  id: string
  template_id: string
  code: string
  quest_type: string
  target_metric: string
  target_value: number
  xp_reward: number
  progress_value: number
  status: 'active' | 'completed' | 'claimed' | 'expired'
  title_rendered: string
  template_metadata: Record<string, unknown>
  instance_metadata: Record<string, unknown>
}

function questMatches(
  row: ActiveQuestRow,
  event: QuestEventInput,
): boolean {
  if (row.status !== 'active') return false
  if (row.target_metric !== event.eventType) return false

  if (row.quest_type === 'subject_focus') {
    const targetSubjectId = (row.instance_metadata?.subjectId as string | undefined) ?? null
    if (!targetSubjectId) return false
    return targetSubjectId === event.videoSubjectId
  }

  if (row.quest_type === 'streak') {
    const minStreak = Number(row.template_metadata?.min_current_streak ?? 0)
    return (event.currentStreakDays ?? 0) >= minStreak
  }

  return true
}

export async function evaluateForEvent(
  client: PoolClient,
  today: string, // YYYY-MM-DD WIB
  event: QuestEventInput,
): Promise<QuestProgressResult[]> {
  // Bulk fetch all active quests for the child in today's window with
  // both template and instance metadata. Single round-trip — eng review
  // F5 (no N+1).
  const rows = await query<ActiveQuestRow>(
    `SELECT cqi.id,
            cqi.quest_template_id AS template_id,
            qt.code,
            qt.quest_type,
            qt.target_metric,
            cqi.target_value,
            qt.xp_reward,
            cqi.progress_value,
            cqi.status,
            cqi.title_rendered,
            qt.metadata AS template_metadata,
            cqi.metadata AS instance_metadata
       FROM child_quest_instances cqi
       JOIN quest_templates qt ON qt.id = cqi.quest_template_id
       WHERE cqi.child_id = $1
         AND cqi.window_start = $2
         AND cqi.status = 'active'`,
    [event.childId, today],
    client,
  )

  const results: QuestProgressResult[] = []
  for (const row of rows) {
    if (!questMatches(row, event)) continue

    const newProgress = Math.min(Number(row.progress_value) + 1, Number(row.target_value))
    const justCompleted = newProgress >= Number(row.target_value)
    const newStatus = justCompleted ? 'completed' : 'active'

    await client.query(
      `UPDATE child_quest_instances
          SET progress_value = $1,
              status = $2,
              completed_at = CASE WHEN $2 = 'completed' THEN NOW() ELSE completed_at END,
              updated_at = NOW()
          WHERE id = $3`,
      [newProgress, newStatus, row.id],
    )

    let xpAwarded = 0
    if (justCompleted && Number(row.xp_reward) > 0) {
      // Append daily quest XP; idempotent on the quest instance id.
      const led = await appendLedger(client, {
        childId: event.childId,
        rewardType: 'DAILY_QUEST_XP',
        sourceType: 'child_quest_instance',
        sourceId: row.id,
        xpDelta: Number(row.xp_reward),
        metadata: { questCode: row.code, questType: row.quest_type },
      })
      if (led.appended) xpAwarded = led.xpDelta
    }

    results.push({
      questId: row.id,
      code: row.code,
      title: row.title_rendered,
      status: newStatus,
      progressValue: newProgress,
      targetValue: Number(row.target_value),
      justCompleted,
      xpAwarded,
    })
  }

  return results
}
