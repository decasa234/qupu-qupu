// api/services/gamification/achievementEvaluator.ts
//
// Achievement unlock evaluator. Runs after quest evaluation in the
// orchestrator. Pulls the full achievement state for the child in ONE
// aggregate query, then evaluates every active template against it in
// JS — no N+1.
//
// Unlocks are idempotent via UNIQUE (child_id, achievement_template_id);
// XP grants via reward_ledger's UNIQUE (child_id, reward_type,
// source_type, source_id) where source_id is the achievement template id.
//
// Achievement types (discriminator on the template):
//   - first_quiz_completed  : ≥1 user_badge_unlocks row exists
//   - streak_threshold      : current_streak_days >= target_value
//   - high_score_first      : HIGH_SCORE_REACHED or PERFECT_SCORE_REACHED event present
//   - perfect_score_first   : PERFECT_SCORE_REACHED event present
//   - videos_completed      : COUNT(user_badge_unlocks) >= target_value
//   - subjects_tried        : COUNT(DISTINCT v.subject_id) >= target_value
//   - improvement_first     : SCORE_IMPROVED event present
//   - badges_total          : SUM(badge_count) >= target_value
//
// WMI garden types (migration 0037):
//   - concept_mahir_first        : COUNT(wmi_concept_progress at tier >= Mahir) >= target_value
//   - chapter_test_passed_first  : COUNT(passed wmi_chapter_tests) >= target_value
//   - konsep_sessions_completed  : COUNT(KONSEP_SESSION_COMPLETED events) >= target_value

import type { PoolClient } from 'pg'
import { query, queryOne } from '../../db.js'
import { appendLedger } from './ledger.js'
import type { StreakState } from './streakUpdater.js'
import { PROFICIENT_TIER } from '../wmi/concepts/comprehension.js'

export interface UnlockedAchievement {
  id: string
  templateId: string
  code: string
  title: string
  iconKey: string | null
  xpAwarded: number
}

interface AchievementState {
  unlocksCount: number              // COUNT(user_badge_unlocks) for child
  badgesSum: number                 // SUM(badge_count)
  distinctSubjects: number
  eventTypes: Set<string>           // distinct gamification_events.event_type
  mahirConcepts: number             // COUNT(wmi_concept_progress) at tier >= Mahir
  chapterTestsPassed: number        // COUNT(wmi_chapter_tests) where passed
  konsepSessions: number            // COUNT(KONSEP_SESSION_COMPLETED events)
}

interface AchievementTemplate {
  id: string
  code: string
  title: string
  description: string
  achievement_type: string
  target_value: number
  xp_reward: number
  icon_key: string | null
  sort_order: number
}

async function fetchAchievementState(
  client: PoolClient,
  childId: string,
): Promise<AchievementState> {
  // Single round-trip: all aggregates needed for predicate evaluation.
  const row = await queryOne<{
    unlocks_count: string
    badges_sum: string
    distinct_subjects: string
    event_types: string[] | null
    mahir_concepts: string
    chapter_tests_passed: string
    konsep_sessions: string
  }>(
    `SELECT
       (SELECT COUNT(*)::text FROM user_badge_unlocks WHERE child_id = $1) AS unlocks_count,
       (SELECT COALESCE(SUM(badge_count), 0)::text FROM user_badge_unlocks WHERE child_id = $1) AS badges_sum,
       (SELECT COUNT(DISTINCT v.subject_id)::text
          FROM user_badge_unlocks ubu
          JOIN videos v ON v.id = ubu.video_id
          WHERE ubu.child_id = $1) AS distinct_subjects,
       (SELECT array_agg(DISTINCT event_type)
          FROM gamification_events WHERE child_id = $1) AS event_types,
       (SELECT COUNT(*)::text FROM wmi_concept_progress
          WHERE child_id = $1 AND best_tier >= $2) AS mahir_concepts,
       (SELECT COUNT(*)::text FROM wmi_chapter_tests
          WHERE child_id = $1 AND passed) AS chapter_tests_passed,
       (SELECT COUNT(*)::text FROM gamification_events
          WHERE child_id = $1 AND event_type = 'KONSEP_SESSION_COMPLETED') AS konsep_sessions`,
    [childId, PROFICIENT_TIER],
    client,
  )
  return {
    unlocksCount: Number(row?.unlocks_count ?? 0),
    badgesSum: Number(row?.badges_sum ?? 0),
    distinctSubjects: Number(row?.distinct_subjects ?? 0),
    eventTypes: new Set(row?.event_types ?? []),
    mahirConcepts: Number(row?.mahir_concepts ?? 0),
    chapterTestsPassed: Number(row?.chapter_tests_passed ?? 0),
    konsepSessions: Number(row?.konsep_sessions ?? 0),
  }
}

function predicateSatisfied(
  template: AchievementTemplate,
  state: AchievementState,
  streak: StreakState,
): boolean {
  switch (template.achievement_type) {
    case 'first_quiz_completed':
      return state.unlocksCount >= template.target_value
    case 'streak_threshold':
      return streak.currentStreakDays >= template.target_value
    case 'high_score_first':
      return (
        state.eventTypes.has('HIGH_SCORE_REACHED') ||
        state.eventTypes.has('PERFECT_SCORE_REACHED')
      )
    case 'perfect_score_first':
      return state.eventTypes.has('PERFECT_SCORE_REACHED')
    case 'videos_completed':
      return state.unlocksCount >= template.target_value
    case 'subjects_tried':
      return state.distinctSubjects >= template.target_value
    case 'improvement_first':
      return state.eventTypes.has('SCORE_IMPROVED')
    case 'badges_total':
      return state.badgesSum >= template.target_value
    case 'concept_mahir_first':
      return state.mahirConcepts >= template.target_value
    case 'chapter_test_passed_first':
      return state.chapterTestsPassed >= template.target_value
    case 'konsep_sessions_completed':
      return state.konsepSessions >= template.target_value
    default:
      return false
  }
}

export async function evaluateAchievements(
  client: PoolClient,
  childId: string,
  streak: StreakState,
): Promise<UnlockedAchievement[]> {
  // Load templates + existing unlocks in parallel (2 round-trips total
  // counting the state aggregate below = 3, all cheap).
  const [templates, existingUnlocks, state] = await Promise.all([
    query<AchievementTemplate>(
      `SELECT id, code, title, description, achievement_type,
              target_value, xp_reward, icon_key, sort_order
         FROM achievement_templates
         WHERE is_active = TRUE
         ORDER BY sort_order ASC`,
      [],
      client,
    ),
    query<{ achievement_template_id: string }>(
      `SELECT achievement_template_id FROM child_achievements WHERE child_id = $1`,
      [childId],
      client,
    ),
    fetchAchievementState(client, childId),
  ])

  const alreadyUnlocked = new Set(existingUnlocks.map((r) => r.achievement_template_id))

  const newlyUnlocked: UnlockedAchievement[] = []
  for (const tpl of templates) {
    if (alreadyUnlocked.has(tpl.id)) continue
    if (!predicateSatisfied(tpl, state, streak)) continue

    // INSERT child_achievements; idempotent via UNIQUE.
    const insertRow = await queryOne<{ id: string }>(
      `INSERT INTO child_achievements (child_id, achievement_template_id)
         VALUES ($1, $2)
         ON CONFLICT (child_id, achievement_template_id) DO NOTHING
         RETURNING id`,
      [childId, tpl.id],
      client,
    )
    if (!insertRow) continue // raced with another transaction; skip

    // Append XP via the ledger. source_id = template id so the UNIQUE
    // constraint catches retries.
    let xpAwarded = 0
    if (tpl.xp_reward > 0) {
      const led = await appendLedger(client, {
        childId,
        rewardType: 'ACHIEVEMENT_XP',
        sourceType: 'achievement_template',
        sourceId: tpl.id,
        xpDelta: tpl.xp_reward,
        metadata: { code: tpl.code, type: tpl.achievement_type },
      })
      if (led.appended) xpAwarded = led.xpDelta
    }

    newlyUnlocked.push({
      id: insertRow.id,
      templateId: tpl.id,
      code: tpl.code,
      title: tpl.title,
      iconKey: tpl.icon_key,
      xpAwarded,
    })
  }

  return newlyUnlocked
}

// Read service for GET /api/me/achievements — exposed for routes layer.
export interface AchievementListItem {
  code: string
  title: string
  description: string
  iconKey: string | null
  achievementType: string
  targetValue: number
  xpReward: number
  unlocked: boolean
  unlockedAt: string | null
  progressValue: number
  progressPercent: number       // 0-100 toward target
  almostThere: boolean          // >= 80% done, not yet unlocked
}

function progressFor(
  template: AchievementTemplate,
  state: AchievementState,
  streak: StreakState,
): number {
  switch (template.achievement_type) {
    case 'first_quiz_completed':
    case 'videos_completed':
      return state.unlocksCount
    case 'streak_threshold':
      return streak.currentStreakDays
    case 'subjects_tried':
      return state.distinctSubjects
    case 'badges_total':
      return state.badgesSum
    case 'high_score_first':
      return state.eventTypes.has('HIGH_SCORE_REACHED') ||
        state.eventTypes.has('PERFECT_SCORE_REACHED') ? 1 : 0
    case 'perfect_score_first':
      return state.eventTypes.has('PERFECT_SCORE_REACHED') ? 1 : 0
    case 'improvement_first':
      return state.eventTypes.has('SCORE_IMPROVED') ? 1 : 0
    case 'concept_mahir_first':
      return state.mahirConcepts
    case 'chapter_test_passed_first':
      return state.chapterTestsPassed
    case 'konsep_sessions_completed':
      return state.konsepSessions
    default:
      return 0
  }
}

export async function listAchievementsForChild(
  client: PoolClient,
  childId: string,
): Promise<AchievementListItem[]> {
  const [templates, unlocked, state, streakRow] = await Promise.all([
    query<AchievementTemplate>(
      `SELECT id, code, title, description, achievement_type,
              target_value, xp_reward, icon_key, sort_order
         FROM achievement_templates
         WHERE is_active = TRUE
         ORDER BY sort_order ASC`,
      [],
      client,
    ),
    query<{ achievement_template_id: string; unlocked_at: string }>(
      `SELECT achievement_template_id, unlocked_at
         FROM child_achievements WHERE child_id = $1`,
      [childId],
      client,
    ),
    fetchAchievementState(client, childId),
    queryOne<{ current_streak_days: number; longest_streak_days: number }>(
      `SELECT current_streak_days, longest_streak_days
         FROM gamification_profiles WHERE child_id = $1`,
      [childId],
      client,
    ),
  ])

  const streakState: StreakState = {
    currentStreakDays: Number(streakRow?.current_streak_days ?? 0),
    longestStreakDays: Number(streakRow?.longest_streak_days ?? 0),
    preBreakStreakDays: 0,
    lastActivityDate: null,
    recoveryEligible: false,
  }
  const unlockedMap = new Map(unlocked.map((u) => [u.achievement_template_id, u.unlocked_at]))

  return templates.map((tpl) => {
    const isUnlocked = unlockedMap.has(tpl.id)
    const progress = isUnlocked ? tpl.target_value : progressFor(tpl, state, streakState)
    const progressPercent = Math.min(100, Math.round((progress / tpl.target_value) * 100))
    return {
      code: tpl.code,
      title: tpl.title,
      description: tpl.description,
      iconKey: tpl.icon_key,
      achievementType: tpl.achievement_type,
      targetValue: tpl.target_value,
      xpReward: tpl.xp_reward,
      unlocked: isUnlocked,
      unlockedAt: unlockedMap.get(tpl.id) ?? null,
      progressValue: progress,
      progressPercent,
      almostThere: !isUnlocked && progressPercent >= 80,
    }
  })
}

export const __test__ = { predicateSatisfied, progressFor }
