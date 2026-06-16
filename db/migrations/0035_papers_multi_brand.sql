-- db/migrations/0035_papers_multi_brand.sql
-- Make wmi_papers multi-brand: add a queryable brand + a generalized level
-- (code+sort) alongside the legacy WMI `grade` column (kept for the member flow).
-- Relax round/variant/grade CHECKs (validation moves to import-time vs the brand
-- registry) and re-key the uniqueness on (brand, year, level_code, round, variant).
-- Indexes power the admin selector filters and future per-child entitlements.
-- Idempotent; safe to re-run.
BEGIN;

ALTER TABLE wmi_papers ADD COLUMN IF NOT EXISTS brand TEXT NOT NULL DEFAULT 'wmi';
ALTER TABLE wmi_papers ADD COLUMN IF NOT EXISTS level_code TEXT;
ALTER TABLE wmi_papers ADD COLUMN IF NOT EXISTS level_sort SMALLINT;

-- Backfill WMI rows: level mirrors grade.
UPDATE wmi_papers SET level_code = 'g' || grade WHERE level_code IS NULL AND grade IS NOT NULL;
UPDATE wmi_papers SET level_sort = grade WHERE level_sort IS NULL AND grade IS NOT NULL;

ALTER TABLE wmi_papers ALTER COLUMN level_code SET NOT NULL;
ALTER TABLE wmi_papers ALTER COLUMN level_sort SET NOT NULL;

-- grade is now a WMI-only bridge: nullable, no range CHECK.
ALTER TABLE wmi_papers ALTER COLUMN grade DROP NOT NULL;
ALTER TABLE wmi_papers DROP CONSTRAINT IF EXISTS wmi_papers_grade_check;

-- round/variant validated at import-time against the registry, not by CHECK.
ALTER TABLE wmi_papers DROP CONSTRAINT IF EXISTS wmi_papers_round_check;
ALTER TABLE wmi_papers DROP CONSTRAINT IF EXISTS wmi_papers_variant_check;

-- Widen the year lower bound (older papers exist).
ALTER TABLE wmi_papers DROP CONSTRAINT IF EXISTS wmi_papers_year_check;
ALTER TABLE wmi_papers ADD CONSTRAINT wmi_papers_year_check CHECK (year BETWEEN 1990 AND 2099);

-- Re-key uniqueness to include brand + level_code.
ALTER TABLE wmi_papers DROP CONSTRAINT IF EXISTS wmi_papers_year_grade_round_variant_unique;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'wmi_papers_brand_year_level_round_variant_unique') THEN
    ALTER TABLE wmi_papers
      ADD CONSTRAINT wmi_papers_brand_year_level_round_variant_unique
      UNIQUE (brand, year, level_code, round, variant);
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_wmi_papers_brand ON wmi_papers(brand);
CREATE INDEX IF NOT EXISTS idx_wmi_papers_brand_level ON wmi_papers(brand, level_code);
CREATE INDEX IF NOT EXISTS idx_wmi_papers_brand_round ON wmi_papers(brand, round);
CREATE INDEX IF NOT EXISTS idx_wmi_papers_year ON wmi_papers(year);

COMMIT;
