-- Add a Paper A/B variant to wmi_papers so both papers of a year/grade/round
-- can coexist. Replaces the (year, grade, round) unique constraint with a
-- (year, grade, round, variant) one. Idempotent; safe to re-run.
BEGIN;

ALTER TABLE wmi_papers
  ADD COLUMN IF NOT EXISTS variant TEXT NOT NULL DEFAULT 'A' CHECK (variant IN ('A','B'));

ALTER TABLE wmi_papers DROP CONSTRAINT IF EXISTS wmi_papers_year_grade_round_unique;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'wmi_papers_year_grade_round_variant_unique'
  ) THEN
    ALTER TABLE wmi_papers
      ADD CONSTRAINT wmi_papers_year_grade_round_variant_unique UNIQUE (year, grade, round, variant);
  END IF;
END$$;

COMMIT;
