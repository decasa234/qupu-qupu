-- db/migrations/0051_track_engine.sql
-- Track engine (Plan 1): ladder level on progress, leveled instance pools,
-- gate clears. Spec: docs/superpowers/specs/2026-07-18-learning-track-engine-design.md

-- Ladder level 0..5 (5 = gold). NULL = not yet touched by the new engine;
-- readers derive it from best_tier via the spec mapping (0,1,2,3→4,4→5).
ALTER TABLE wmi_concept_progress
  ADD COLUMN IF NOT EXISTS level SMALLINT
  CHECK (level IS NULL OR level BETWEEN 0 AND 5);

-- Instance pools per ladder level. 0 = legacy/unleveled pool (old garden).
ALTER TABLE wmi_concept_instances
  ADD COLUMN IF NOT EXISTS level SMALLINT NOT NULL DEFAULT 0
  CHECK (level BETWEEN 0 AND 5);

CREATE INDEX IF NOT EXISTS wmi_concept_instances_slug_level_idx
  ON wmi_concept_instances (concept_slug, level);

-- One row per (child, track, gate) — passing a synthesis gate is permanent.
CREATE TABLE IF NOT EXISTS wmi_gate_clears (
  child_id   UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  track_id   TEXT NOT NULL,
  gate_key   TEXT NOT NULL,
  cleared_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (child_id, track_id, gate_key)
);
