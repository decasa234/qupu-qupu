-- ─────────────────────────────────────────────────────────────────────
-- Fundamentals course (migration 0037)
--
-- A brand-agnostic, beginner-facing course that teaches competition-math
-- meta-skills (reading a question, vocabulary, breaking problems down,
-- scoring/penalty strategy, smart guessing, time & checking) as ordered
-- modules → lessons. A lesson is a list of typed content blocks stored as
-- JSONB (validated app-side by api/services/fundamentals/blocks.ts). Lessons
-- are universal (brand IS NULL); brand is nullable for forward-compat
-- per-brand lessons. Progress is per child, idempotent per (child, lesson).
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS fundamentals_modules (
  slug        TEXT PRIMARY KEY,
  title_en    TEXT NOT NULL,
  title_id    TEXT NOT NULL,
  summary_en  TEXT,
  summary_id  TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  status      TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fundamentals_lessons (
  slug         TEXT PRIMARY KEY,
  module_slug  TEXT NOT NULL REFERENCES fundamentals_modules(slug) ON DELETE CASCADE,
  brand        TEXT,                      -- NULL = universal; forward-compat per-brand
  title_en     TEXT NOT NULL,
  title_id     TEXT NOT NULL,
  summary_en   TEXT,
  summary_id   TEXT,
  est_minutes  SMALLINT,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  status       TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  blocks       JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_fundamentals_lessons_module
  ON fundamentals_lessons(module_slug, sort_order);

CREATE TABLE IF NOT EXISTS fundamentals_progress (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id      UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  lesson_slug   TEXT NOT NULL REFERENCES fundamentals_lessons(slug) ON DELETE CASCADE,
  completed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  check_correct SMALLINT NOT NULL DEFAULT 0,
  check_total   SMALLINT NOT NULL DEFAULT 0,
  CONSTRAINT fundamentals_progress_child_lesson_unique UNIQUE (child_id, lesson_slug)
);
CREATE INDEX IF NOT EXISTS idx_fundamentals_progress_child
  ON fundamentals_progress(child_id);
