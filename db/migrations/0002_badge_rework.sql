-- Migration 0002: Badge system rework
-- Drop tier-based badges. Replace with per-video badge counts.
-- Subject implicitly defines the badge design (color from subjects.color_hex).
-- Per video, admin defines 1-N range rows mapping correct-answer ranges to badge counts.

-- Drop columns that reference badge_families / badge_tiers first.
ALTER TABLE user_badge_unlocks DROP COLUMN IF EXISTS badge_tier_id;
ALTER TABLE user_badge_unlocks DROP COLUMN IF EXISTS badge_family_id;
ALTER TABLE user_badge_unlocks
  ADD COLUMN IF NOT EXISTS badge_count INTEGER NOT NULL DEFAULT 0 CHECK (badge_count >= 0);

ALTER TABLE video_badge_rules DROP COLUMN IF EXISTS badge_tier_id;
ALTER TABLE video_badge_rules
  ADD COLUMN IF NOT EXISTS badge_count INTEGER NOT NULL DEFAULT 0 CHECK (badge_count >= 0);

ALTER TABLE videos DROP COLUMN IF EXISTS badge_family_id;

DROP TABLE IF EXISTS badge_tiers;
DROP TABLE IF EXISTS badge_families;
