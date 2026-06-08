-- 0033_wmi_curriculum.sql — themed curriculum, per-concept comprehension, chapter tests

-- 1. Theme lookup (the 5 chapters)
CREATE TABLE IF NOT EXISTS wmi_themes (
  theme_key   TEXT PRIMARY KEY,
  name_id     TEXT NOT NULL,
  name_en     TEXT NOT NULL,
  color_hex   VARCHAR(7)  NOT NULL,
  icon_key    VARCHAR(80) NOT NULL,
  sort_order  INT  NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Concept curriculum metadata
ALTER TABLE wmi_concepts
  ADD COLUMN IF NOT EXISTS theme_key  TEXT REFERENCES wmi_themes(theme_key),
  ADD COLUMN IF NOT EXISTS difficulty SMALLINT CHECK (difficulty IS NULL OR difficulty BETWEEN 1 AND 3),
  ADD COLUMN IF NOT EXISTS sort_order INT NOT NULL DEFAULT 0;

-- 3. Materialized per-child per-concept comprehension
CREATE TABLE IF NOT EXISTS wmi_concept_progress (
  child_id          UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  concept_slug      TEXT NOT NULL REFERENCES wmi_concepts(slug) ON DELETE CASCADE,
  attempts          INT  NOT NULL DEFAULT 0,
  correct           INT  NOT NULL DEFAULT 0,
  current_streak    INT  NOT NULL DEFAULT 0,
  recent            JSONB NOT NULL DEFAULT '[]'::jsonb,
  best_tier         SMALLINT NOT NULL DEFAULT 0,
  comprehension_pct SMALLINT NOT NULL DEFAULT 0 CHECK (comprehension_pct BETWEEN 0 AND 100),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (child_id, concept_slug)
);

-- 4. Tes Bab (chapter test-out) results
CREATE TABLE IF NOT EXISTS wmi_chapter_tests (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id    UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  grade       SMALLINT NOT NULL CHECK (grade BETWEEN 0 AND 3),
  theme_key   TEXT NOT NULL REFERENCES wmi_themes(theme_key) ON DELETE CASCADE,
  score_pct   SMALLINT NOT NULL CHECK (score_pct BETWEEN 0 AND 100),
  passed      BOOLEAN NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS wmi_chapter_tests_pass_idx
  ON wmi_chapter_tests (child_id, grade, theme_key) WHERE passed;
