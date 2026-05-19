CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS age_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  min_age INTEGER NOT NULL,
  max_age INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  slug VARCHAR(60) NOT NULL UNIQUE,
  color_hex VARCHAR(7) NOT NULL DEFAULT '#7C3AED',
  description TEXT,
  default_badge_ranges JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) UNIQUE,
  name VARCHAR(100) NOT NULL,
  age INTEGER CHECK (age IS NULL OR (age >= 6 AND age <= 120)),
  age_group_id UUID REFERENCES age_groups(id) ON DELETE SET NULL,
  password_hash VARCHAR(255),
  google_sub VARCHAR(255) UNIQUE,
  role VARCHAR(20) NOT NULL DEFAULT 'parent' CHECK (role IN ('student', 'teacher', 'parent', 'admin')),
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  verification_token VARCHAR(255),
  reset_token VARCHAR(255),
  reset_token_expires TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(80) NOT NULL,
  age_group_id UUID REFERENCES age_groups(id) ON DELETE SET NULL,
  avatar_color VARCHAR(20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(200) NOT NULL UNIQUE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  youtube_url VARCHAR(500) NOT NULL,
  youtube_video_id VARCHAR(32) NOT NULL,
  thumbnail_url VARCHAR(500),
  -- Drafts (is_published=false) may leave subject_id, age_group_id, and
  -- number_of_questions NULL; the videos_publish_required CHECK below
  -- enforces they're populated before is_published can flip to true.
  -- See db/migrations/0007_video_drafts.sql for the migration history.
  subject_id UUID REFERENCES subjects(id) ON DELETE RESTRICT,
  age_group_id UUID REFERENCES age_groups(id) ON DELETE RESTRICT,
  number_of_questions INTEGER CHECK (number_of_questions IS NULL OR number_of_questions > 0),
  difficulty VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT videos_publish_required CHECK (
    is_published = false OR (
      subject_id IS NOT NULL
      AND age_group_id IS NOT NULL
      AND number_of_questions IS NOT NULL
    )
  )
);

CREATE TABLE IF NOT EXISTS video_badge_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  min_correct INTEGER NOT NULL CHECK (min_correct >= 0),
  max_correct INTEGER CHECK (max_correct IS NULL OR max_correct >= min_correct),
  badge_count INTEGER NOT NULL DEFAULT 0 CHECK (badge_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS score_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  correct_answers INTEGER NOT NULL CHECK (correct_answers >= 0),
  total_questions INTEGER NOT NULL CHECK (total_questions > 0),
  score_percentage NUMERIC(5,2) NOT NULL CHECK (score_percentage >= 0 AND score_percentage <= 100),
  is_correction BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_badge_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  badge_count INTEGER NOT NULL DEFAULT 0 CHECK (badge_count >= 0),
  correct_answers INTEGER NOT NULL CHECK (correct_answers >= 0),
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (child_id, video_id)
);

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name VARCHAR(80) NOT NULL,
  session_id VARCHAR(80),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  path VARCHAR(500),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Drop the legacy table-level UNIQUE on users.email (no-op on fresh installs;
-- self-heals databases bootstrapped before the partial-index switchover).
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_password_unique ON users(email) WHERE password_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_google_sub ON users(google_sub);
CREATE INDEX IF NOT EXISTS idx_children_parent ON children(parent_user_id);
CREATE INDEX IF NOT EXISTS idx_videos_subject ON videos(subject_id);
CREATE INDEX IF NOT EXISTS idx_videos_age_group ON videos(age_group_id);
CREATE INDEX IF NOT EXISTS idx_videos_published ON videos(is_published, published_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS videos_youtube_video_id_unique ON videos(youtube_video_id);
CREATE INDEX IF NOT EXISTS idx_video_badge_rules_video ON video_badge_rules(video_id);
CREATE INDEX IF NOT EXISTS idx_score_attempts_child_created ON score_attempts(child_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_score_attempts_video ON score_attempts(video_id);
CREATE INDEX IF NOT EXISTS idx_user_badge_unlocks_child ON user_badge_unlocks(child_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_name_created ON analytics_events(event_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events(created_at DESC);

CREATE TABLE IF NOT EXISTS pending_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  name VARCHAR(100) NOT NULL,
  age INTEGER,
  password_hash VARCHAR(255) NOT NULL,
  otp_hash VARCHAR(255) NOT NULL,
  attempts_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  last_sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pending_registrations_email ON pending_registrations(email);
CREATE INDEX IF NOT EXISTS idx_pending_registrations_expires_at ON pending_registrations(expires_at);

CREATE TABLE IF NOT EXISTS youtube_channel_cache (
  playlist_id VARCHAR(64) PRIMARY KEY,
  payload JSONB NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_youtube_channel_cache_expires_at ON youtube_channel_cache(expires_at);

CREATE TABLE IF NOT EXISTS request_rate_limits (
  user_id UUID NOT NULL,
  route VARCHAR(64) NOT NULL,
  window_started_at TIMESTAMPTZ NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, route)
);

CREATE INDEX IF NOT EXISTS idx_request_rate_limits_window ON request_rate_limits(window_started_at);

-- ─────────────────────────────────────────────────────────────────────
-- Gamification core (migration 0012)
-- Separates learning facts (score_attempts, user_badge_unlocks) from
-- reward facts (gamification_events, reward_ledger). Profiles are a
-- cached read model; the ledger is the audit trail.
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS level_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level_number INTEGER NOT NULL UNIQUE,
  tier_name VARCHAR(80) NOT NULL,
  min_xp INTEGER NOT NULL UNIQUE CHECK (min_xp >= 0),
  theme_key VARCHAR(80),
  sort_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO level_tiers (level_number, tier_name, min_xp, theme_key, sort_order) VALUES
  (1, 'Pemula',          0,   'pemula',     1),
  (2, 'Penjelajah',      100, 'penjelajah', 2),
  (3, 'Jago Muda',       250, 'jago_muda',  3),
  (4, 'Bintang Belajar', 500, 'bintang',    4),
  (5, 'Master Cilik',    900, 'master',     5)
ON CONFLICT (level_number) DO NOTHING;

CREATE TABLE IF NOT EXISTS gamification_profiles (
  child_id UUID PRIMARY KEY REFERENCES children(id) ON DELETE CASCADE,
  total_xp INTEGER NOT NULL DEFAULT 0 CHECK (total_xp >= 0),
  current_level INTEGER NOT NULL DEFAULT 1 CHECK (current_level >= 1),
  current_tier_id UUID REFERENCES level_tiers(id) ON DELETE SET NULL,
  current_streak_days INTEGER NOT NULL DEFAULT 0 CHECK (current_streak_days >= 0),
  longest_streak_days INTEGER NOT NULL DEFAULT 0 CHECK (longest_streak_days >= 0),
  last_activity_date DATE,
  last_quest_refresh_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gamification_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  event_type VARCHAR(80) NOT NULL,
  source_type VARCHAR(80) NOT NULL,
  source_id UUID NOT NULL,
  event_date DATE NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT gamification_events_unique
    UNIQUE (child_id, event_type, source_type, source_id)
);

CREATE INDEX IF NOT EXISTS idx_gamification_events_child_date
  ON gamification_events (child_id, event_date DESC);

CREATE TABLE IF NOT EXISTS reward_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  reward_type VARCHAR(80) NOT NULL,
  source_type VARCHAR(80) NOT NULL,
  source_id UUID NOT NULL,
  xp_delta INTEGER NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT reward_ledger_unique
    UNIQUE (child_id, reward_type, source_type, source_id)
);

CREATE INDEX IF NOT EXISTS idx_reward_ledger_child_created
  ON reward_ledger (child_id, created_at DESC);

-- ─────────────────────────────────────────────────────────────────────
-- Quests, streaks, and streak-recovery (migration 0013)
-- ─────────────────────────────────────────────────────────────────────

ALTER TABLE gamification_profiles
  ADD COLUMN IF NOT EXISTS pre_break_streak_days INTEGER NOT NULL DEFAULT 0
    CHECK (pre_break_streak_days >= 0);

CREATE TABLE IF NOT EXISTS quest_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(80) NOT NULL UNIQUE,
  title VARCHAR(160) NOT NULL,
  description TEXT NOT NULL,
  quest_type VARCHAR(40) NOT NULL,
  cadence VARCHAR(40) NOT NULL DEFAULT 'daily',
  target_metric VARCHAR(80) NOT NULL,
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
  title_rendered VARCHAR(200) NOT NULL,
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

CREATE TABLE IF NOT EXISTS streak_recoveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  recovered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recovered_for_date DATE NOT NULL,
  pre_break_streak_value INTEGER NOT NULL CHECK (pre_break_streak_value >= 0),
  resulting_streak_value INTEGER NOT NULL CHECK (resulting_streak_value >= 0)
);

CREATE INDEX IF NOT EXISTS idx_streak_recoveries_child_recovered_at
  ON streak_recoveries (child_id, recovered_at DESC);

-- ─────────────────────────────────────────────────────────────────────
-- Achievements (migration 0014)
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS achievement_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(80) NOT NULL UNIQUE,
  title VARCHAR(160) NOT NULL,
  description TEXT NOT NULL,
  achievement_type VARCHAR(80) NOT NULL,
  target_value INTEGER NOT NULL CHECK (target_value >= 1),
  xp_reward INTEGER NOT NULL DEFAULT 0 CHECK (xp_reward >= 0),
  icon_key VARCHAR(80),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO achievement_templates
  (code, title, description, achievement_type, target_value, xp_reward, icon_key, sort_order, metadata)
VALUES
  ('first_quiz', 'Quiz Pertama!', 'Selamat! Kamu menyelesaikan quiz pertama di QUPU.',
   'first_quiz_completed', 1, 25, 'target', 1, '{}'::jsonb),
  ('streak_3_days', 'Streak 3 Hari', 'Tiga hari berturut-turut latihan. Konsistensi luar biasa!',
   'streak_threshold', 3, 30, 'fire', 2, '{}'::jsonb),
  ('streak_7_days', 'Streak 7 Hari', 'Seminggu penuh latihan tanpa putus!',
   'streak_threshold', 7, 75, 'fire', 3, '{}'::jsonb),
  ('first_high_score', 'Skor Tinggi Pertama', 'Skor minimal 80% di salah satu quiz untuk pertama kali.',
   'high_score_first', 1, 30, 'star', 4, '{}'::jsonb),
  ('perfect_score', 'Skor Sempurna', 'Jawab semua soal benar di salah satu video. 100%!',
   'perfect_score_first', 1, 50, 'crown', 5, '{}'::jsonb),
  ('videos_5_completed', '5 Video Selesai', 'Selesaikan quiz di 5 video berbeda.',
   'videos_completed', 5, 40, 'check-circle', 6, '{}'::jsonb),
  ('subjects_3_tried', '3 Subject Dicoba', 'Mencoba 3 subject berbeda di QUPU.',
   'subjects_tried', 3, 35, 'shapes', 7, '{}'::jsonb),
  ('first_improvement', 'Memperbaiki Skor', 'Buka quiz sebelumnya dan perbaiki skor untuk pertama kali.',
   'improvement_first', 1, 20, 'arrow-up', 8, '{}'::jsonb),
  ('badges_50_earned', '50 Lencana Video', 'Kumpulkan 50 lencana total di trophy wall.',
   'badges_total', 50, 100, 'medal', 9, '{}'::jsonb)
ON CONFLICT (code) DO NOTHING;

CREATE TABLE IF NOT EXISTS child_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  achievement_template_id UUID NOT NULL REFERENCES achievement_templates(id) ON DELETE RESTRICT,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source_event_id UUID REFERENCES gamification_events(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT child_achievement_unique
    UNIQUE (child_id, achievement_template_id)
);

CREATE INDEX IF NOT EXISTS idx_child_achievements_child_unlocked
  ON child_achievements (child_id, unlocked_at DESC);
