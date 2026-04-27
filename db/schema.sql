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
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_badge_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  badge_count INTEGER NOT NULL DEFAULT 0 CHECK (badge_count >= 0),
  best_correct_answers INTEGER NOT NULL CHECK (best_correct_answers >= 0),
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
