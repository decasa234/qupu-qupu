-- 0034_wmi_subjects.sql — replace global themes with per-grade subjects.
-- A concept now has ONE subject; the subject carries the grade. Grade 0 dropped.

CREATE TABLE IF NOT EXISTS wmi_subjects (
  subject_key TEXT PRIMARY KEY,
  grade       SMALLINT NOT NULL CHECK (grade BETWEEN 1 AND 3),
  name_id     TEXT NOT NULL,
  name_en     TEXT NOT NULL,
  color_hex   VARCHAR(7)  NOT NULL,
  icon_key    VARCHAR(80) NOT NULL,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- wmi_concepts: theme_key -> subject_key
ALTER TABLE wmi_concepts ADD COLUMN IF NOT EXISTS subject_key TEXT REFERENCES wmi_subjects(subject_key);
ALTER TABLE wmi_concepts DROP COLUMN IF EXISTS theme_key;

-- wmi_chapter_tests: now keyed by subject (grade is derivable from the subject)
ALTER TABLE wmi_chapter_tests ADD COLUMN IF NOT EXISTS subject_key TEXT REFERENCES wmi_subjects(subject_key);
DROP INDEX IF EXISTS wmi_chapter_tests_pass_idx;
ALTER TABLE wmi_chapter_tests DROP COLUMN IF EXISTS theme_key;
ALTER TABLE wmi_chapter_tests DROP COLUMN IF EXISTS grade;
CREATE INDEX IF NOT EXISTS wmi_chapter_tests_pass_idx
  ON wmi_chapter_tests (child_id, subject_key) WHERE passed;

-- the old theme table is gone
DROP TABLE IF EXISTS wmi_themes;
