-- 0046_child_grade.sql
--
-- School grade chosen at onboarding (0 = TK, 1-6 = SD Kelas 1-6).
-- Nullable: legacy rows keep NULL and fall back to age-group inference.
-- ADD COLUMN IF NOT EXISTS skips the whole clause (including the CHECK)
-- when the column already exists, so re-running is safe.

ALTER TABLE children
  ADD COLUMN IF NOT EXISTS grade SMALLINT
    CHECK (grade IS NULL OR (grade >= 0 AND grade <= 6));
