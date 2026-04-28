-- One-time prefill for existing draft videos that were imported with NULL
-- subject/age/question/badge fields. Auto-publishes any draft that ends up
-- with all required fields populated AND at least one badge rule.
--
-- Safe to re-run: only touches drafts where subject_id IS NULL, so videos
-- already curated by an admin are never overwritten.
--
-- Title-keyword rules (case-insensitive, evaluated in priority order so a
-- title like "Aljabar Dasar Part 15 (Kuis Matematika Anak 5-8)" is
-- classified as Aljabar, not Matematika):
--   aljabar    -> Aljabar I,    Usia 5-8,   30 questions
--   matematika -> Matematika I, Usia 5-8,   20 questions
--   beda       -> Odd One Out,  Semua Usia, 60 questions
--
-- Badge ranges are taken from subjects.default_badge_ranges (JSONB) at
-- runtime, so editing those rows in the live DB is the source of truth.
-- Videos whose resolved subject has empty default_badge_ranges stay as
-- drafts — the videos_publish_required CHECK only covers the three NOT-NULL
-- columns, but publishing without badge rules would break the member UX.
--
-- Usage:
--   psql "$DATABASE_URL" -f db/scripts/prefill_existing_drafts.sql

BEGIN;

CREATE TEMP TABLE prefill_targets ON COMMIT DROP AS
SELECT
  v.id AS video_id,
  CASE
    WHEN v.title ~* 'aljabar'    THEN 'aljabar-1'
    WHEN v.title ~* 'matematika' THEN 'matematika-1'
    WHEN v.title ~* 'beda'       THEN 'odd-one-out'
  END AS subject_slug,
  CASE
    WHEN v.title ~* 'aljabar'    THEN 'Usia 5-8 ( TK-2SD )'
    WHEN v.title ~* 'matematika' THEN 'Usia 5-8 ( TK-2SD )'
    WHEN v.title ~* 'beda'       THEN 'Semua Usia'
  END AS age_group_name,
  CASE
    WHEN v.title ~* 'aljabar'    THEN 30
    WHEN v.title ~* 'matematika' THEN 20
    WHEN v.title ~* 'beda'       THEN 60
  END AS num_questions
FROM videos v
WHERE v.is_published = FALSE
  AND v.subject_id IS NULL
  AND v.title ~* '(aljabar|matematika|beda)';

-- Apply subject / age group / question count.
UPDATE videos v
SET
  subject_id          = s.id,
  age_group_id        = ag.id,
  number_of_questions = pt.num_questions,
  updated_at          = NOW()
FROM prefill_targets pt
JOIN subjects   s  ON s.slug  = pt.subject_slug
JOIN age_groups ag ON ag.name = pt.age_group_name
WHERE v.id = pt.video_id;

-- Replace any badge rules on these videos with the subject's defaults.
-- DELETE first so the script is idempotent within its own scope.
DELETE FROM video_badge_rules
WHERE video_id IN (SELECT video_id FROM prefill_targets);

INSERT INTO video_badge_rules (video_id, min_correct, max_correct, badge_count)
SELECT
  v.id,
  (br.value ->> 'minCorrect')::INT,
  (br.value ->> 'maxCorrect')::INT,
  (br.value ->> 'badgeCount')::INT
FROM videos v
JOIN subjects s ON s.id = v.subject_id
CROSS JOIN LATERAL jsonb_array_elements(s.default_badge_ranges) AS br(value)
WHERE v.id IN (SELECT video_id FROM prefill_targets);

-- Auto-publish ANY keyword-matching draft that has the three required columns
-- AND at least one badge rule — not just rows we touched in this run. This
-- catches drafts that were already prefilled at import time (the
-- youtubeChannelImport PREFILL_RULES path), which the `subject_id IS NULL`
-- filter above intentionally skips so admin-curated rows aren't overwritten.
UPDATE videos v
SET
  is_published = TRUE,
  published_at = COALESCE(v.published_at, NOW()),
  updated_at   = NOW()
WHERE v.is_published = FALSE
  AND v.subject_id IS NOT NULL
  AND v.age_group_id IS NOT NULL
  AND v.number_of_questions IS NOT NULL
  AND v.title ~* '(aljabar|matematika|beda)'
  AND EXISTS (SELECT 1 FROM video_badge_rules r WHERE r.video_id = v.id);

-- Summary 1: rows newly prefilled in this run (may be empty if drafts were
-- already prefilled at import time).
SELECT
  'prefilled-this-run'                       AS report,
  pt.subject_slug,
  COUNT(*)                                   AS videos_updated,
  COUNT(*) FILTER (WHERE v.is_published)     AS published,
  COUNT(*) FILTER (WHERE NOT v.is_published) AS left_as_draft
FROM prefill_targets pt
JOIN videos v ON v.id = pt.video_id
GROUP BY pt.subject_slug
ORDER BY pt.subject_slug;

-- Summary 2: every keyword-matching video currently in the catalog, grouped
-- by published state. Use this to verify the publish step did its job — if
-- you still see rows under is_published=false, inspect them for missing
-- badge rules or required columns.
SELECT
  'all-keyword-matches'      AS report,
  s.slug                     AS subject,
  v.is_published,
  COUNT(*)                   AS video_count
FROM videos v
LEFT JOIN subjects s ON s.id = v.subject_id
WHERE v.title ~* '(aljabar|matematika|beda)'
GROUP BY s.slug, v.is_published
ORDER BY s.slug, v.is_published;

COMMIT;
