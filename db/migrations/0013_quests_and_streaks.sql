-- Plan 2 of the gamification track: daily quests, streaks, and
-- streak-recovery. Builds on Plan 1 (0012_gamification_core.sql).
--
-- Daily quests are per-child instances generated lazily from seeded
-- templates, one window per WIB day. Streak recovery lets a kid restore
-- a broken streak ONCE per rolling 30 days when they return after
-- skipping exactly one day.

BEGIN;

-- ─────────────────────────────────────────────────────────────────────
-- pre_break_streak_days on gamification_profiles
-- Records the streak value at the moment of reset, so streak-recovery
-- can restore it. Cleared when the kid continues a streak normally OR
-- when a recovery is consumed.
-- ─────────────────────────────────────────────────────────────────────

ALTER TABLE gamification_profiles
  ADD COLUMN IF NOT EXISTS pre_break_streak_days INTEGER NOT NULL DEFAULT 0
    CHECK (pre_break_streak_days >= 0);

-- ─────────────────────────────────────────────────────────────────────
-- quest_templates — seeded daily quest definitions.
-- code is the stable identifier the evaluator switches on.
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS quest_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(80) NOT NULL UNIQUE,
  title VARCHAR(160) NOT NULL,
  description TEXT NOT NULL,
  quest_type VARCHAR(40) NOT NULL,       -- 'completion' | 'high_score' | 'subject_focus' | 'improvement' | 'streak'
  cadence VARCHAR(40) NOT NULL DEFAULT 'daily',
  target_metric VARCHAR(80) NOT NULL,    -- event_type the evaluator listens for
  target_value INTEGER NOT NULL CHECK (target_value > 0),
  xp_reward INTEGER NOT NULL DEFAULT 0 CHECK (xp_reward >= 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO quest_templates
  (code, title, description, quest_type, cadence, target_metric, target_value, xp_reward, metadata)
VALUES
  ('daily_completion_1',
   'Selesaikan 1 quiz hari ini',
   'Pilih video apa saja dan selesaikan quizz-nya untuk hari ini.',
   'completion', 'daily', 'QUIZ_SCORE_SUBMITTED', 1, 15,
   '{}'::jsonb),

  ('daily_high_score',
   'Skor minimal 80% di satu quiz hari ini',
   'Jawab dengan teliti — target skor minimal 80%.',
   'high_score', 'daily', 'HIGH_SCORE_REACHED', 1, 20,
   '{}'::jsonb),

  ('daily_subject_focus',
   'Selesaikan 1 quiz {{subject}} hari ini',
   'Latih subject yang masih perlu fokus. Title diisi nama subject saat dipersonalisasi.',
   'subject_focus', 'daily', 'QUIZ_SCORE_SUBMITTED', 1, 25,
   '{"requires_personalization":true}'::jsonb),

  ('daily_improvement',
   'Perbaiki skor di salah satu video sebelumnya',
   'Buka video yang skornya belum maksimal dan coba lagi.',
   'improvement', 'daily', 'SCORE_IMPROVED', 1, 20,
   '{}'::jsonb),

  ('daily_streak_keeper',
   'Jaga streak hari ini',
   'Selesaikan minimal 1 quiz untuk menjaga streak harian tetap hidup.',
   'streak', 'daily', 'QUIZ_SCORE_SUBMITTED', 1, 10,
   '{"min_current_streak":2}'::jsonb)
ON CONFLICT (code) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────
-- child_quest_instances — actual quest assignments per child per window.
-- window_start/window_end are WIB calendar days (DATE).
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS child_quest_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  quest_template_id UUID NOT NULL REFERENCES quest_templates(id) ON DELETE RESTRICT,
  window_start DATE NOT NULL,
  window_end DATE NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'completed', 'claimed', 'expired')),
  progress_value INTEGER NOT NULL DEFAULT 0 CHECK (progress_value >= 0),
  target_value INTEGER NOT NULL CHECK (target_value > 0),
  title_rendered VARCHAR(200) NOT NULL,    -- denormalized for stable display
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  completed_at TIMESTAMPTZ,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT child_quest_instance_per_window_unique
    UNIQUE (child_id, quest_template_id, window_start)
);

CREATE INDEX IF NOT EXISTS idx_child_quest_instances_active
  ON child_quest_instances (child_id, window_start DESC)
  WHERE status = 'active';

-- ─────────────────────────────────────────────────────────────────────
-- streak_recoveries — one row per recovery used.
-- Used to enforce the rolling-30-day cap.
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS streak_recoveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  recovered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recovered_for_date DATE NOT NULL,        -- WIB date the recovery restores
  pre_break_streak_value INTEGER NOT NULL CHECK (pre_break_streak_value >= 0),
  resulting_streak_value INTEGER NOT NULL CHECK (resulting_streak_value >= 0)
);

CREATE INDEX IF NOT EXISTS idx_streak_recoveries_child_recovered_at
  ON streak_recoveries (child_id, recovered_at DESC);

COMMIT;
