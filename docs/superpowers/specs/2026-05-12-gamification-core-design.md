# Gamification Core Schema and Reward Model — Design

**Date:** 2026-05-12
**Status:** Draft for user review
**Goal:** Add a durable gamification foundation for daily quests, achievements, level tiers, streaks, and post-quiz rewards while preserving QUPU's existing per-child learning progress model.

---

## Context

QUPU already has a learning-progress foundation:

- `children` own progress under a parent account.
- `score_attempts` records quiz submissions and corrections.
- `user_badge_unlocks` stores the canonical per-video badge result for each child.
- `/dashboard` already displays derived level, XP, streak, daily goal, badges, and recommendations, but those values are not backed by a durable gamification schema.

The new system should make gamification first-class without weakening learning integrity. Daily quests should bring children back, but long-term progress should reflect mastery and consistent completion, not empty repetition.

---

## Product Direction

The selected direction is a **balanced hybrid**:

- **Daily habit loop:** daily quests, streaks, small XP rewards, and parent-friendly nudges.
- **Mastery loop:** achievements, level tiers, subject progress, video badges, score improvement, and high-quality quiz outcomes.
- **Auditability:** reward grants are recorded separately from learning facts so score corrections, duplicate submissions, and future rule changes are manageable.

This design deliberately avoids casino-style mechanics. Copy and data surfaces should frame rewards as learning progress: "Target hari ini", "Konsistensi belajar", "Pencapaian baru", and "Naik level karena latihan".

---

## Core Principle

Separate **learning facts** from **reward facts**.

Learning facts answer: "What did the child do?"

- Example: a child scored 8/10 on a video at a specific time.
- Existing source: `score_attempts`.

Reward facts answer: "What did the system grant because of that activity?"

- Example: the child earned 25 XP for completing a quiz.
- New source: `reward_ledger`.

Current gamified state answers: "What should the dashboard show right now?"

- Example: the child has 430 XP, Level 4, a 3-day streak, and 2 completed quests today.
- New source: `gamification_profiles` plus quest and achievement state.

This separation prevents duplicate rewards when parents correct scores and allows explicit backfills if reward rules change later.

---

## Schema Overview

### `gamification_profiles`

One row per `child_id`. This is the fast-read summary for dashboards and profile surfaces.

Recommended fields:

- `child_id UUID PRIMARY KEY REFERENCES children(id) ON DELETE CASCADE`
- `total_xp INTEGER NOT NULL DEFAULT 0`
- `current_level INTEGER NOT NULL DEFAULT 1`
- `current_tier_id UUID REFERENCES level_tiers(id)`
- `current_streak_days INTEGER NOT NULL DEFAULT 0`
- `longest_streak_days INTEGER NOT NULL DEFAULT 0`
- `last_activity_date DATE`
- `last_quest_refresh_date DATE`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

The profile is a cached read model. The reward ledger remains the audit trail.

### `gamification_events`

Normalized, idempotent events emitted from learning actions.

Recommended fields:

- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE`
- `event_type VARCHAR(80) NOT NULL`
- `source_type VARCHAR(80) NOT NULL`
- `source_id UUID NOT NULL`
- `event_date DATE NOT NULL`
- `metadata JSONB NOT NULL DEFAULT '{}'::jsonb`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `UNIQUE (child_id, event_type, source_type, source_id)`

Example events:

- `QUIZ_SCORE_SUBMITTED`
- `VIDEO_FIRST_COMPLETED`
- `SCORE_IMPROVED`
- `HIGH_SCORE_REACHED`
- `PERFECT_SCORE_REACHED`
- `DAILY_ACTIVITY_RECORDED`

Score corrections should emit correction-aware events without re-granting one-time rewards.

### `reward_ledger`

Immutable append-only reward grants.

Recommended fields:

- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE`
- `reward_type VARCHAR(80) NOT NULL`
- `source_type VARCHAR(80) NOT NULL`
- `source_id UUID NOT NULL`
- `xp_delta INTEGER NOT NULL DEFAULT 0`
- `metadata JSONB NOT NULL DEFAULT '{}'::jsonb`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `UNIQUE (child_id, reward_type, source_type, source_id)`

Example reward types:

- `QUIZ_COMPLETION_XP`
- `DAILY_QUEST_XP`
- `ACHIEVEMENT_XP`
- `STREAK_BONUS_XP`

The unique key prevents duplicate grants for the same reward source.

### `level_tiers`

Seeded configuration for level thresholds and presentation.

Recommended fields:

- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `level_number INTEGER NOT NULL UNIQUE`
- `tier_name VARCHAR(80) NOT NULL`
- `min_xp INTEGER NOT NULL UNIQUE`
- `theme_key VARCHAR(80)`
- `sort_order INTEGER NOT NULL`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

Seed examples:

- Level 1, `Pemula`, 0 XP
- Level 2, `Penjelajah`, 100 XP
- Level 3, `Jago Muda`, 250 XP
- Level 4, `Bintang Belajar`, 500 XP
- Level 5, `Master Cilik`, 900 XP

Levels are derived from total XP. They are not granted directly.

---

## Quest Model

### `quest_templates`

Reusable DB-backed quest templates. Templates are seeded initially and admin-editable later.

Recommended fields:

- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `code VARCHAR(80) NOT NULL UNIQUE`
- `title VARCHAR(120) NOT NULL`
- `description TEXT NOT NULL`
- `quest_type VARCHAR(40) NOT NULL`
- `cadence VARCHAR(40) NOT NULL`
- `target_metric VARCHAR(80) NOT NULL`
- `target_value INTEGER NOT NULL`
- `xp_reward INTEGER NOT NULL DEFAULT 0`
- `is_active BOOLEAN NOT NULL DEFAULT TRUE`
- `metadata JSONB NOT NULL DEFAULT '{}'::jsonb`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

Initial cadence should be `daily`. Weekly quests are a later extension.

### `child_quest_instances`

Actual quest assignments for a child and a date window.

Recommended fields:

- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE`
- `quest_template_id UUID NOT NULL REFERENCES quest_templates(id) ON DELETE RESTRICT`
- `window_start DATE NOT NULL`
- `window_end DATE NOT NULL`
- `status VARCHAR(30) NOT NULL DEFAULT 'active'`
- `progress_value INTEGER NOT NULL DEFAULT 0`
- `target_value INTEGER NOT NULL`
- `completed_at TIMESTAMPTZ`
- `claimed_at TIMESTAMPTZ`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `UNIQUE (child_id, quest_template_id, window_start)`

For v1, completing a quest can auto-claim its XP. A separate claim button can be added later if the product wants an explicit reward moment.

### V1 Daily Quest Templates

Seed these initial quests:

- Complete 1 quiz today.
- Score at least 80% on any quiz today.
- Complete 1 quiz from a recommended weak subject.
- Improve a previous video score.
- Keep the streak alive.

Each quest can reward XP only once per child per quest window. Corrections can update progress but cannot duplicate rewards.

---

## Achievement Model

### `achievement_templates`

Long-term milestone definitions.

Recommended fields:

- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `code VARCHAR(80) NOT NULL UNIQUE`
- `title VARCHAR(120) NOT NULL`
- `description TEXT NOT NULL`
- `achievement_type VARCHAR(80) NOT NULL`
- `target_value INTEGER NOT NULL`
- `xp_reward INTEGER NOT NULL DEFAULT 0`
- `icon_key VARCHAR(80)`
- `is_active BOOLEAN NOT NULL DEFAULT TRUE`
- `metadata JSONB NOT NULL DEFAULT '{}'::jsonb`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

### `child_achievements`

Unlocked achievement rows.

Recommended fields:

- `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE`
- `achievement_template_id UUID NOT NULL REFERENCES achievement_templates(id) ON DELETE RESTRICT`
- `unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `source_event_id UUID REFERENCES gamification_events(id) ON DELETE SET NULL`
- `metadata JSONB NOT NULL DEFAULT '{}'::jsonb`
- `UNIQUE (child_id, achievement_template_id)`

### V1 Achievement Templates

Seed these initial achievements:

- First Quiz Completed
- 3-Day Streak
- 7-Day Streak
- First 80% Score
- Perfect Score
- 5 Videos Completed
- 3 Subjects Tried
- Improve a Previous Score
- Earn 50 Total Video Badges

Achievements grant XP once. Existing video badges remain learning-specific rewards; achievements and quests belong to the broader gamification layer.

---

## Reward Flow

When a child submits or corrects a quiz score:

1. `submitVideoScore` validates parent-child ownership and writes the learning result.
2. A gamification service receives the submitted result inside the same request flow.
3. The service emits idempotent `gamification_events`.
4. Quest evaluators update active `child_quest_instances`.
5. Achievement evaluators unlock any newly satisfied `child_achievements`.
6. Earned XP is appended to `reward_ledger`.
7. `gamification_profiles` updates `total_xp`, level/tier, streak counters, and activity dates.
8. The API returns a reward summary for post-quiz UI.

Recommended service boundary:

- `api/services/gamification.ts` owns event emission, quest progress, achievements, reward ledger writes, and profile updates.
- `api/services/member.ts` continues to own learning-score validation and badge recalculation.
- `api/services/dashboard.ts` reads gamification profile and active quest state for dashboard presentation.

---

## UI Surfaces

### Dashboard

Add first-class gamification state:

- Level number and tier name.
- XP progress to next level.
- Current streak and longest streak.
- Today quest completion summary.
- A compact daily quest panel with at most 3 active quests.

### Post-Quiz Reward Summary

After score save, show a single reward summary that can include:

- Quiz score and video badge result.
- XP earned from quiz completion.
- Daily quest completed.
- Achievement unlocked.
- Level up or tier change.

The summary should merge multiple reward facts into one child-friendly moment instead of stacking many unrelated toasts.

### Achievements Surface

Start inside the existing `/badges` trophy wall rather than adding a new route in v1.

Show:

- Unlocked achievements.
- Locked achievements.
- "Almost there" achievements when progress is meaningful.

### Admin UI

Admin tuning is out of v1 UI scope. Seed templates in SQL first. Add admin editing after the core engine proves stable.

---

## API Shape

Recommended new or extended API outputs:

### `GET /api/me/dashboard`

Extend the payload with:

```ts
gamification: {
  totalXp: number
  currentLevel: number
  currentTierName: string
  xpIntoCurrentLevel: number
  xpToNextLevel: number
  currentStreakDays: number
  longestStreakDays: number
  dailyQuests: Array<{
    id: string
    code: string
    title: string
    description: string
    progressValue: number
    targetValue: number
    xpReward: number
    status: 'active' | 'completed' | 'claimed' | 'expired'
  }>
}
```

### `POST /api/me/video-scores`

Extend the existing response with:

```ts
gamification?: {
  xpEarned: number
  ledgerEntries: Array<{
    rewardType: string
    xpDelta: number
  }>
  completedQuests: Array<{
    id: string
    title: string
    xpReward: number
  }>
  unlockedAchievements: Array<{
    id: string
    title: string
    xpReward: number
  }>
  levelUp?: {
    previousLevel: number
    currentLevel: number
    currentTierName: string
  }
}
```

The property is optional during rollout so the frontend can land incrementally.

---

## Implementation Plan Decomposition

This design should produce several implementation plans instead of one large plan:

1. **Gamification core schema and reward engine**
   - Migrations, seed data, `gamification_profiles`, `gamification_events`, `reward_ledger`, `level_tiers`, and service skeleton.

2. **Daily quests and streaks**
   - Quest templates, daily quest instance generation, progress evaluation, streak updates, and dashboard quest payload.

3. **Achievements and level tiers**
   - Achievement templates, unlock evaluation, level recalculation, and achievement read APIs.

4. **Dashboard and post-quiz UI**
   - Daily quest panel, XP/level display backed by real data, post-quiz reward summary, and achievements section in `/badges`.

5. **Admin tuning and analytics**
   - Template management, reward analytics, quest completion analytics, and tuning tools. This is later scope.

---

## Out of Scope for V1

- Leaderboards or peer competition.
- Coins, shops, avatars, or purchasable cosmetics.
- Weekly/monthly seasonal events.
- Admin UI for editing quest or achievement templates.
- Push notifications.
- Parent reward approval workflows.
- Rebuilding historical XP automatically when templates change.

---

## Risks

1. **Duplicate reward grants**
   - Mitigation: use unique keys on `gamification_events`, `reward_ledger`, `child_quest_instances`, and `child_achievements`.

2. **Score corrections causing confusing rewards**
   - Mitigation: grant completion XP once, allow mastery-related events to be correction-aware, and never duplicate daily quest rewards for the same window.

3. **Over-rewarding volume**
   - Mitigation: cap daily quest count and reward daily quality objectives, not only raw quiz count.

4. **Dashboard drift**
   - Mitigation: `gamification_profiles` is updated through the gamification service; ledger remains available for explicit rebuilds if needed.

5. **Schema overreach**
   - Mitigation: seed templates and evaluate rules in code for v1; defer admin UI and arbitrary rule builders.

---

## Acceptance Criteria

- The schema can represent XP, levels, streaks, daily quests, and achievements per child.
- Rewards are auditable through `reward_ledger`.
- A score correction cannot grant duplicate one-time rewards.
- Level and tier are derived from XP thresholds.
- Daily quests can be generated from DB templates.
- Achievements can unlock once per child.
- Dashboard and post-quiz UI can consume a compact gamification summary.
- The implementation can be split into independently shippable plans.
