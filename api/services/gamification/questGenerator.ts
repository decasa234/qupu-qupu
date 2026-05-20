// api/services/gamification/questGenerator.ts
//
// Lazy daily quest generation. `ensureTodaysQuests` is idempotent and
// called from both submitVideoScore (so newly-active quests can evaluate
// against the incoming event) and the dashboard read (so the panel
// always has 3 slots to show).
//
// Smart-select rule for the 3 active slots per child per WIB day:
//   - Slot 1: `daily_completion_1` (always — easy entry)
//   - Slot 2: `daily_subject_focus` personalized to weakest subject if
//     the kid has played before; else `daily_high_score` as fallback
//   - Slot 3: `daily_streak_keeper` if current_streak_days >= 2;
//             else `daily_improvement`
//
// Title personalization replaces `{{subject}}` with the actual subject
// name and stores the rendered string in `child_quest_instances.title_rendered`.

import type { PoolClient } from 'pg'
import { query, queryOne } from '../../db.js'

export interface ActiveQuest {
  id: string
  templateId: string
  code: string
  title: string
  description: string
  questType: string
  targetMetric: string
  progressValue: number
  targetValue: number
  status: 'active' | 'completed' | 'claimed' | 'expired'
  xpReward: number
  metadata: Record<string, unknown>
}

interface QuestTemplate {
  id: string
  code: string
  title: string
  description: string
  quest_type: string
  target_metric: string
  target_value: number
  xp_reward: number
  metadata: Record<string, unknown>
}

async function fetchTemplates(client: PoolClient): Promise<Map<string, QuestTemplate>> {
  const rows = await query<QuestTemplate>(
    `SELECT id, code, title, description, quest_type, target_metric,
            target_value, xp_reward, metadata
       FROM quest_templates
       WHERE is_active = TRUE AND cadence = 'daily'`,
    [],
    client,
  )
  const map = new Map<string, QuestTemplate>()
  for (const r of rows) map.set(r.code, r)
  return map
}

async function findWeakestSubject(
  client: PoolClient,
  childId: string,
  ageGroupId: string | null,
): Promise<{ id: string; name: string } | null> {
  // Lowest-scoring subject among ones the child has attempted, restricted
  // to videos in the child's age group when available.
  const row = await queryOne<{ subject_id: string; subject_name: string }>(
    `WITH child_age AS (
       SELECT $2::uuid AS age_group_id
     ),
     available_videos AS (
       SELECT v.id, v.subject_id
         FROM videos v, child_age
         WHERE v.is_published = TRUE
           AND (child_age.age_group_id IS NULL OR v.age_group_id = child_age.age_group_id)
     )
     SELECT s.id AS subject_id, s.name AS subject_name
       FROM score_attempts sa
       JOIN available_videos av ON av.id = sa.video_id
       JOIN subjects s ON s.id = av.subject_id
       WHERE sa.child_id = $1
       GROUP BY s.id, s.name
       HAVING COUNT(*) > 0
       ORDER BY AVG(sa.score_percentage) ASC, s.name ASC
       LIMIT 1`,
    [childId, ageGroupId],
    client,
  )
  if (!row) return null
  return { id: row.subject_id, name: row.subject_name }
}

async function fetchChildContext(
  client: PoolClient,
  childId: string,
): Promise<{ ageGroupId: string | null; currentStreak: number; lastQuestRefreshDate: string | null }> {
  const row = await queryOne<{
    age_group_id: string | null
    current_streak_days: number
    last_quest_refresh_date: string | null
  }>(
    `SELECT c.age_group_id, gp.current_streak_days, gp.last_quest_refresh_date
       FROM children c
       LEFT JOIN gamification_profiles gp ON gp.child_id = c.id
       WHERE c.id = $1`,
    [childId],
    client,
  )
  return {
    ageGroupId: row?.age_group_id ?? null,
    currentStreak: Number(row?.current_streak_days ?? 0),
    lastQuestRefreshDate: row?.last_quest_refresh_date ?? null,
  }
}

interface SlotPick {
  template: QuestTemplate
  titleRendered: string
  metadata: Record<string, unknown>
}

function renderSubjectFocusTitle(template: QuestTemplate, subjectName: string): string {
  return template.title.replace(/\{\{subject\}\}/g, subjectName)
}

async function pickSlots(
  client: PoolClient,
  childId: string,
  templates: Map<string, QuestTemplate>,
): Promise<SlotPick[]> {
  const ctx = await fetchChildContext(client, childId)
  const picks: SlotPick[] = []

  const completion = templates.get('daily_completion_1')
  if (completion) {
    picks.push({ template: completion, titleRendered: completion.title, metadata: {} })
  }

  // Slot 2: personalized weak-subject if available, else high-score.
  const weakest = await findWeakestSubject(client, childId, ctx.ageGroupId)
  if (weakest) {
    const focusTpl = templates.get('daily_subject_focus')
    if (focusTpl) {
      picks.push({
        template: focusTpl,
        titleRendered: renderSubjectFocusTitle(focusTpl, weakest.name),
        metadata: { subjectId: weakest.id, subjectName: weakest.name },
      })
    }
  } else {
    const highTpl = templates.get('daily_high_score')
    if (highTpl) {
      picks.push({ template: highTpl, titleRendered: highTpl.title, metadata: {} })
    }
  }

  // Slot 3: streak-keeper when current streak ≥ 2, else improvement.
  if (ctx.currentStreak >= 2) {
    const streakTpl = templates.get('daily_streak_keeper')
    if (streakTpl) {
      picks.push({ template: streakTpl, titleRendered: streakTpl.title, metadata: {} })
    }
  } else {
    const improveTpl = templates.get('daily_improvement')
    if (improveTpl) {
      picks.push({ template: improveTpl, titleRendered: improveTpl.title, metadata: {} })
    }
  }

  return picks
}

export async function ensureTodaysQuests(
  client: PoolClient,
  childId: string,
  today: string, // YYYY-MM-DD WIB
): Promise<ActiveQuest[]> {
  // Cheap exit: if today's instances already exist, return them.
  const existing = await query<{
    id: string
    template_id: string
    code: string
    title_rendered: string
    description: string
    quest_type: string
    target_metric: string
    progress_value: number
    target_value: number
    status: 'active' | 'completed' | 'claimed' | 'expired'
    xp_reward: number
    metadata: Record<string, unknown>
  }>(
    `SELECT cqi.id,
            cqi.quest_template_id AS template_id,
            qt.code,
            cqi.title_rendered,
            qt.description,
            qt.quest_type,
            qt.target_metric,
            cqi.progress_value,
            cqi.target_value,
            cqi.status,
            qt.xp_reward,
            cqi.metadata
       FROM child_quest_instances cqi
       JOIN quest_templates qt ON qt.id = cqi.quest_template_id
       WHERE cqi.child_id = $1 AND cqi.window_start = $2
       ORDER BY qt.quest_type, qt.code`,
    [childId, today],
    client,
  )

  if (existing.length > 0) {
    return existing.map((r) => ({
      id: r.id,
      templateId: r.template_id,
      code: r.code,
      title: r.title_rendered,
      description: r.description,
      questType: r.quest_type,
      targetMetric: r.target_metric,
      progressValue: Number(r.progress_value),
      targetValue: Number(r.target_value),
      status: r.status,
      xpReward: Number(r.xp_reward),
      metadata: r.metadata ?? {},
    }))
  }

  // Generate: pick slots, then INSERT ON CONFLICT (idempotent under race).
  const templates = await fetchTemplates(client)
  const picks = await pickSlots(client, childId, templates)

  for (const pick of picks) {
    await client.query(
      `INSERT INTO child_quest_instances
         (child_id, quest_template_id, window_start, window_end,
          target_value, title_rendered, metadata)
       VALUES ($1, $2, $3, $3, $4, $5, $6::jsonb)
       ON CONFLICT (child_id, quest_template_id, window_start) DO NOTHING`,
      [
        childId,
        pick.template.id,
        today,
        pick.template.target_value,
        pick.titleRendered,
        JSON.stringify(pick.metadata),
      ],
    )
  }

  // Stamp last_quest_refresh_date so we know quests have been generated
  // for this WIB day (cheap follow-up; idempotent).
  await client.query(
    `UPDATE gamification_profiles
        SET last_quest_refresh_date = $1, updated_at = NOW()
        WHERE child_id = $2`,
    [today, childId],
  )

  // Re-fetch so caller sees what's actually in the DB after generation.
  return ensureTodaysQuests(client, childId, today)
}
