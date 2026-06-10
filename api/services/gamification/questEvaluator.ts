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
// On completion: status → 'completed' and completed_at is stamped — and
// NOTHING is paid out here (P2.2 claim ritual). The reward grants on an
// explicit POST /me/quests/:id/claim (see quests.ts claimQuestReward), which
// appends the DAILY_QUEST_XP ledger row keyed to the instance id — the SAME
// key the old auto-grant used, so historical auto-paid rows collide on the
// ledger UNIQUE and can never pay twice.

import type { PoolClient } from 'pg'
import { query } from '../../db.js'

export interface QuestEventInput {
  childId: string
  eventType: string
  eventSourceType: string
  eventSourceId: string
  videoSubjectId?: string | null
  currentStreakDays?: number
  // How much progress this event represents. Defaults to 1 (the video-quiz
  // contract: one event = one unit). WMI konsep sessions batch 20 graded
  // answers into a single KONSEP_QUESTION_ANSWERED event, so they pass the
  // real count instead of emitting 20 rows.
  incrementBy?: number
}

export interface QuestProgressResult {
  questId: string
  code: string
  title: string
  status: 'active' | 'completed' | 'claimed' | 'expired'
  progressValue: number
  targetValue: number
  justCompleted: boolean
  // CLAIMABLE template reward — NOT paid by this evaluation (P2.2 claim
  // ritual). Callers must fold ZERO of this into profile deltas; it exists
  // so completion UIs can show what the kid will get when they claim.
  rewardXp: number
  rewardCoins: number
}

interface ActiveQuestRow {
  id: string
  template_id: string
  code: string
  quest_type: string
  target_metric: string
  target_value: number
  xp_reward: number
  coin_reward: number
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

// Pure progress step: clamp to target, never move backwards, treat a
// missing/invalid incrementBy as 1.
function nextProgress(progress: number, target: number, incrementBy?: number): number {
  const step = Math.max(1, Math.floor(incrementBy ?? 1))
  return Math.min(progress + step, target)
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
            qt.coin_reward,
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

    const newProgress = nextProgress(
      Number(row.progress_value),
      Number(row.target_value),
      event.incrementBy,
    )
    const justCompleted = newProgress >= Number(row.target_value)
    const newStatus = justCompleted ? 'completed' : 'active'

    // Reusing $2 across `status = $2` (varchar) and `$2 = 'completed'`
    // (text-literal) made Postgres bail with "inconsistent types deduced
    // for parameter $2". Compute completed_at as a separate timestamp
    // param instead; null means "leave existing completed_at alone".
    await client.query(
      `UPDATE child_quest_instances
          SET progress_value = $1,
              status = $2,
              completed_at = COALESCE($3::timestamptz, completed_at),
              updated_at = NOW()
          WHERE id = $4`,
      [
        newProgress,
        newStatus,
        justCompleted ? new Date().toISOString() : null,
        row.id,
      ],
    )

    // No payout here: completion only stamps completed_at. The reward pays
    // on the explicit claim (quests.ts claimQuestReward) — rewardXp/-Coins
    // below are display-only claimable amounts.
    results.push({
      questId: row.id,
      code: row.code,
      title: row.title_rendered,
      status: newStatus,
      progressValue: newProgress,
      targetValue: Number(row.target_value),
      justCompleted,
      rewardXp: Number(row.xp_reward),
      rewardCoins: Number(row.coin_reward),
    })
  }

  return results
}

export const __test__ = { questMatches, nextProgress }
