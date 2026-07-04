-- WMI Claire — isolated warmup drill for a single WMI finalist. Temporary,
-- niche feature gated (in the app layer) to one parent account. Each row is a
-- 10-question round: the generated items (with their answers) are stored
-- server-side so answers never reach the client, alongside the child's
-- responses and final score for parent review. Deliberately isolated — it does
-- NOT write wmi_attempts / wmi_concept_progress / gamification.
CREATE TABLE IF NOT EXISTS claire_drill_rounds (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id     UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  items        JSONB NOT NULL,               -- [{concept_slug, params, body_*, answer_type, choices_*, answer, hint_*, breakdown}]
  responses    JSONB NOT NULL DEFAULT '{}',  -- { "<index>": { selected, is_correct } }
  total        INT  NOT NULL DEFAULT 10,
  score        INT,                          -- set once every item is answered
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_claire_rounds_child
  ON claire_drill_rounds (child_id, completed_at DESC);
