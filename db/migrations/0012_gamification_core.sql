-- Plan 1 of the gamification track: schema for XP, levels, events, and the
-- reward ledger. Quest, achievement, and streak-recovery tables ship in
-- later migrations (0013, 0014, 0015).
--
-- Design principle: separate learning facts (score_attempts, user_badge_unlocks)
-- from reward facts (gamification_events, reward_ledger). Profiles are a
-- cached read model; the ledger is the audit trail.
--
-- Idempotency: every event and ledger row carries a UNIQUE natural key
-- (child_id, type, source_type, source_id) so retried HTTP requests and
-- double-clicks cannot grant duplicate XP.

BEGIN;

-- ─────────────────────────────────────────────────────────────────────
-- level_tiers — seeded config; levels derive from total_xp, not granted.
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
  (1, 'Pemula',          0,   'pemula',   1),
  (2, 'Penjelajah',      100, 'penjelajah', 2),
  (3, 'Jago Muda',       250, 'jago_muda',  3),
  (4, 'Bintang Belajar', 500, 'bintang',    4),
  (5, 'Master Cilik',    900, 'master',     5)
ON CONFLICT (level_number) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────
-- gamification_profiles — one row per child. Cached read model.
-- ─────────────────────────────────────────────────────────────────────

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

-- ─────────────────────────────────────────────────────────────────────
-- gamification_events — append-only, idempotent.
-- Source of truth for "what happened" feeding quests, achievements, etc.
-- ─────────────────────────────────────────────────────────────────────

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

-- ─────────────────────────────────────────────────────────────────────
-- reward_ledger — immutable XP grants. Audit trail for all XP movements.
-- ─────────────────────────────────────────────────────────────────────

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

COMMIT;
