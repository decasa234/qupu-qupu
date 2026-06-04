-- Per-concept proofreading verdict + notes (one latest record per concept).
-- concept_slug comes from the code registry (not necessarily a wmi_concepts
-- row), so there is intentionally no foreign key.

BEGIN;

CREATE TABLE IF NOT EXISTS wmi_concept_reviews (
  concept_slug  TEXT PRIMARY KEY,
  status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'approved', 'needs_changes')),
  notes         TEXT NOT NULL DEFAULT '',
  reviewed_by   TEXT,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMIT;
