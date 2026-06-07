-- Per-paper admin review verdict for imported WMI papers (mirror of
-- wmi_concept_reviews, keyed by paper). Cascade-deletes with its paper.
-- Idempotent; safe to re-run.
BEGIN;

CREATE TABLE IF NOT EXISTS wmi_paper_reviews (
  paper_id    UUID PRIMARY KEY REFERENCES wmi_papers(id) ON DELETE CASCADE,
  status      TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','approved','needs_changes')),
  notes       TEXT NOT NULL DEFAULT '',
  reviewed_by TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMIT;
