-- WMI Practice Area (v1).

BEGIN;

CREATE TABLE IF NOT EXISTS wmi_papers (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year                     SMALLINT NOT NULL CHECK (year BETWEEN 2019 AND 2099),
  grade                    SMALLINT NOT NULL CHECK (grade BETWEEN 0 AND 3),
  round                    TEXT NOT NULL CHECK (round IN ('semifinal','final')),
  title                    TEXT NOT NULL,
  source_url               TEXT,
  recommended_duration_min SMALLINT NOT NULL DEFAULT 60,
  question_count           SMALLINT NOT NULL DEFAULT 0,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT wmi_papers_year_grade_round_unique UNIQUE (year, grade, round)
);

CREATE TABLE IF NOT EXISTS wmi_questions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id    UUID NOT NULL REFERENCES wmi_papers(id) ON DELETE CASCADE,
  number      SMALLINT NOT NULL,
  body_en     TEXT NOT NULL,
  body_id     TEXT NOT NULL,
  answer_type TEXT NOT NULL CHECK (answer_type IN ('multiple_choice','fill_in')),
  choices_en  JSONB,
  choices_id  JSONB,
  answer      TEXT NOT NULL,
  figure_url  TEXT,
  hint_en     TEXT,
  hint_id     TEXT,
  difficulty  SMALLINT CHECK (difficulty IS NULL OR difficulty BETWEEN 1 AND 3),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT wmi_questions_paper_number_unique UNIQUE (paper_id, number)
);

CREATE TABLE IF NOT EXISTS wmi_glossary_terms (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT NOT NULL UNIQUE,
  term_en       TEXT NOT NULL,
  term_id       TEXT NOT NULL,
  definition_en TEXT NOT NULL,
  definition_id TEXT NOT NULL,
  example_en    TEXT,
  example_id    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wmi_exam_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id        UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  paper_id        UUID NOT NULL REFERENCES wmi_papers(id),
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  duration_ms     INTEGER,
  correct_count   SMALLINT,
  total_questions SMALLINT NOT NULL,
  abandoned       BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS wmi_attempts (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id                UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  question_id             UUID NOT NULL REFERENCES wmi_questions(id) ON DELETE CASCADE,
  mode                    TEXT NOT NULL CHECK (mode IN ('drill','exam')),
  session_id              UUID REFERENCES wmi_exam_sessions(id) ON DELETE CASCADE,
  selected_answer         TEXT NOT NULL,
  is_correct              BOOLEAN NOT NULL,
  time_taken_ms           INTEGER,
  revealed_id_translation BOOLEAN NOT NULL DEFAULT FALSE,
  looked_up_terms         TEXT[] NOT NULL DEFAULT '{}',
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wmi_attempts_child_question
  ON wmi_attempts(child_id, question_id);
CREATE INDEX IF NOT EXISTS idx_wmi_attempts_session
  ON wmi_attempts(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_wmi_questions_paper_number
  ON wmi_questions(paper_id, number);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_wmi_attempts_exam_per_question
  ON wmi_attempts(session_id, question_id)
  WHERE mode = 'exam' AND session_id IS NOT NULL;

COMMIT;
