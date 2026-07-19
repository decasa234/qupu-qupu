-- db/migrations/0052_track_lessons.sql
-- One-shot lesson sessions (Plan 3): commitLesson must reference a lesson
-- built by buildLesson; committing marks it consumed, killing replay and
-- instance-substitution grinding.
CREATE TABLE IF NOT EXISTS wmi_track_lessons (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id      UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  track_id      TEXT NOT NULL,
  focus_slug    TEXT NOT NULL,
  focus_level   SMALLINT NOT NULL CHECK (focus_level BETWEEN 1 AND 5),
  instance_ids  UUID[] NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  committed_at  TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS wmi_track_lessons_child_idx
  ON wmi_track_lessons (child_id, created_at DESC);
