-- Migration 0005: Per-subject default badge range templates
-- Each subject can carry a default set of badge ranges. AdminVideos applies
-- the template when a new video's subject is chosen (admin can still edit per video).

ALTER TABLE subjects
  ADD COLUMN IF NOT EXISTS default_badge_ranges JSONB NOT NULL DEFAULT '[]'::jsonb;
