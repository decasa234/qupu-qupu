-- WMI Claire mock exams — isolated, niche feature (gated to Claire's account).
-- A mock final assembles real WMI Final/Semifinal Grade-2 questions (15 Paper-A
-- multiple-choice + 10 Paper-B fill-in) drawn round-robin so the kid works a
-- fresh set each time and only repeats a question once the pool is exhausted.
-- Phase 2 will point the same engine at generated variant questions instead.
-- Fully isolated: does NOT touch wmi_attempts / progress / gamification.

CREATE TABLE IF NOT EXISTS claire_mock_exams (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id      UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  round         TEXT NOT NULL,                 -- 'final' | 'semifinal'
  question_ids  JSONB NOT NULL,                -- ordered [uuid,…] (15 A then 10 B)
  responses     JSONB NOT NULL DEFAULT '{}',   -- { "<index>": { selected, is_correct } }
  total         INT  NOT NULL DEFAULT 25,
  score         INT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at  TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_claire_mock_exams_child
  ON claire_mock_exams (child_id, completed_at DESC);

-- Round-robin ledger: how many times each source question has been served to a
-- child. The assembler picks the least-used questions first (random tiebreak).
CREATE TABLE IF NOT EXISTS claire_mock_question_uses (
  child_id     UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  question_id  UUID NOT NULL REFERENCES wmi_questions(id) ON DELETE CASCADE,
  uses         INT  NOT NULL DEFAULT 0,
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (child_id, question_id)
);
