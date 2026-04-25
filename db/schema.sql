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
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS badge_families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(60) NOT NULL UNIQUE,
  slug VARCHAR(70) NOT NULL UNIQUE,
  description TEXT,
  color_hex VARCHAR(7) NOT NULL DEFAULT '#F97316',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS badge_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES badge_families(id) ON DELETE CASCADE,
  tier INTEGER NOT NULL CHECK (tier BETWEEN 1 AND 3),
  name VARCHAR(80) NOT NULL,
  icon_name VARCHAR(40) NOT NULL,
  color_hex VARCHAR(7) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (family_id, tier)
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  age INTEGER CHECK (age IS NULL OR (age >= 6 AND age <= 120)),
  age_group_id UUID REFERENCES age_groups(id) ON DELETE SET NULL,
  password_hash VARCHAR(255) NOT NULL,
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
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
  age_group_id UUID NOT NULL REFERENCES age_groups(id) ON DELETE RESTRICT,
  badge_family_id UUID NOT NULL REFERENCES badge_families(id) ON DELETE RESTRICT,
  number_of_questions INTEGER NOT NULL CHECK (number_of_questions > 0),
  difficulty VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS video_badge_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  badge_tier_id UUID NOT NULL REFERENCES badge_tiers(id) ON DELETE CASCADE,
  min_correct INTEGER NOT NULL CHECK (min_correct >= 0),
  max_correct INTEGER CHECK (max_correct IS NULL OR max_correct >= min_correct),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (video_id, badge_tier_id)
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
  badge_family_id UUID NOT NULL REFERENCES badge_families(id) ON DELETE CASCADE,
  badge_tier_id UUID NOT NULL REFERENCES badge_tiers(id) ON DELETE CASCADE,
  best_correct_answers INTEGER NOT NULL CHECK (best_correct_answers >= 0),
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (child_id, video_id)
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_children_parent ON children(parent_user_id);
CREATE INDEX IF NOT EXISTS idx_videos_subject ON videos(subject_id);
CREATE INDEX IF NOT EXISTS idx_videos_age_group ON videos(age_group_id);
CREATE INDEX IF NOT EXISTS idx_videos_badge_family ON videos(badge_family_id);
CREATE INDEX IF NOT EXISTS idx_videos_published ON videos(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_score_attempts_child_created ON score_attempts(child_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_score_attempts_video ON score_attempts(video_id);
CREATE INDEX IF NOT EXISTS idx_user_badge_unlocks_child ON user_badge_unlocks(child_id, updated_at DESC);
