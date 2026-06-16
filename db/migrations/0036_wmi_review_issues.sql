-- 0036_wmi_review_issues.sql
-- Granular, stateful review issues layered over the per-item verdict tables.
-- Human flags a problem on a specific part; Claude Code (or the human) resolves it.
CREATE TABLE IF NOT EXISTS wmi_review_issues (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type   TEXT NOT NULL CHECK (target_type IN ('paper','paper_question','concept')),
  paper_id      UUID REFERENCES wmi_papers(id)    ON DELETE CASCADE,
  question_id   UUID REFERENCES wmi_questions(id) ON DELETE CASCADE,
  concept_slug  TEXT,
  part          TEXT NOT NULL CHECK (part IN
                  ('stem','answer','choices','hint','breakdown','illustration',
                   'steps','animation','trap','meta','other')),
  severity      TEXT NOT NULL DEFAULT 'warning' CHECK (severity IN ('blocker','warning','nit')),
  title         TEXT NOT NULL,
  detail        TEXT NOT NULL DEFAULT '',
  status        TEXT NOT NULL DEFAULT 'open'
                  CHECK (status IN ('open','in_progress','fixed','verified','wont_fix')),
  ai_actionable BOOLEAN NOT NULL DEFAULT TRUE,
  fix_note      TEXT,
  created_by    TEXT,
  resolved_by   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at   TIMESTAMPTZ,
  CHECK (
    (target_type = 'concept'        AND concept_slug IS NOT NULL AND paper_id IS NULL     AND question_id IS NULL) OR
    (target_type = 'paper'          AND paper_id IS NOT NULL     AND question_id IS NULL  AND concept_slug IS NULL) OR
    (target_type = 'paper_question' AND paper_id IS NOT NULL     AND question_id IS NOT NULL AND concept_slug IS NULL)
  )
);
CREATE INDEX IF NOT EXISTS idx_wmi_issues_status_ai ON wmi_review_issues (status, ai_actionable);
CREATE INDEX IF NOT EXISTS idx_wmi_issues_paper     ON wmi_review_issues (paper_id);
CREATE INDEX IF NOT EXISTS idx_wmi_issues_question  ON wmi_review_issues (question_id);
CREATE INDEX IF NOT EXISTS idx_wmi_issues_concept   ON wmi_review_issues (concept_slug);
