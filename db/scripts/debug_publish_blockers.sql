-- Diagnostic: for every keyword-matching draft, show exactly which condition
-- of the publish step is failing.
--
-- Read-only — no UPDATEs, no transaction needed.
--
-- Usage:
--   psql "$DATABASE_URL" -f db/scripts/debug_publish_blockers.sql

\echo
\echo '=== 1. How many drafts match each title keyword? ==='
SELECT
  COUNT(*) FILTER (WHERE title ~* 'aljabar')    AS aljabar_drafts,
  COUNT(*) FILTER (WHERE title ~* 'matematika') AS matematika_drafts,
  COUNT(*) FILTER (WHERE title ~* 'beda')       AS beda_drafts,
  COUNT(*) FILTER (WHERE title ~* '(aljabar|matematika|beda)') AS any_match
FROM videos
WHERE is_published = FALSE;

\echo
\echo '=== 2. Per-row breakdown of every keyword-matching draft ==='
\echo '    has_subject / has_age / has_qcount / badge_rule_count'
\echo '    publishable = all four "yes"'
SELECT
  v.id,
  LEFT(v.title, 60) AS title_preview,
  CASE
    WHEN v.title ~* 'aljabar'    THEN 'aljabar'
    WHEN v.title ~* 'matematika' THEN 'matematika'
    WHEN v.title ~* 'beda'       THEN 'beda'
  END AS keyword_hit,
  (v.subject_id          IS NOT NULL) AS has_subject,
  (v.age_group_id        IS NOT NULL) AS has_age,
  (v.number_of_questions IS NOT NULL) AS has_qcount,
  (SELECT COUNT(*) FROM video_badge_rules r WHERE r.video_id = v.id) AS badge_rule_count,
  (
    v.subject_id IS NOT NULL
    AND v.age_group_id IS NOT NULL
    AND v.number_of_questions IS NOT NULL
    AND EXISTS (SELECT 1 FROM video_badge_rules r WHERE r.video_id = v.id)
  ) AS would_publish
FROM videos v
WHERE v.is_published = FALSE
  AND v.title ~* '(aljabar|matematika|beda)'
ORDER BY would_publish DESC, v.title;

\echo
\echo '=== 3. Summary: how many drafts WOULD publish vs are blocked? ==='
SELECT
  COUNT(*) FILTER (WHERE
    v.subject_id IS NOT NULL
    AND v.age_group_id IS NOT NULL
    AND v.number_of_questions IS NOT NULL
    AND EXISTS (SELECT 1 FROM video_badge_rules r WHERE r.video_id = v.id)
  ) AS would_publish,
  COUNT(*) FILTER (WHERE
    NOT (
      v.subject_id IS NOT NULL
      AND v.age_group_id IS NOT NULL
      AND v.number_of_questions IS NOT NULL
      AND EXISTS (SELECT 1 FROM video_badge_rules r WHERE r.video_id = v.id)
    )
  ) AS blocked,
  COUNT(*) AS total_keyword_drafts
FROM videos v
WHERE v.is_published = FALSE
  AND v.title ~* '(aljabar|matematika|beda)';

\echo
\echo '=== 4. Distinct blocker reasons (for the blocked rows) ==='
SELECT
  CASE
    WHEN v.subject_id IS NULL          THEN 'missing_subject'
    WHEN v.age_group_id IS NULL        THEN 'missing_age_group'
    WHEN v.number_of_questions IS NULL THEN 'missing_question_count'
    WHEN NOT EXISTS (SELECT 1 FROM video_badge_rules r WHERE r.video_id = v.id) THEN 'no_badge_rules'
    ELSE 'should_have_published'
  END AS blocker,
  COUNT(*) AS drafts_blocked
FROM videos v
WHERE v.is_published = FALSE
  AND v.title ~* '(aljabar|matematika|beda)'
  AND NOT (
    v.subject_id IS NOT NULL
    AND v.age_group_id IS NOT NULL
    AND v.number_of_questions IS NOT NULL
    AND EXISTS (SELECT 1 FROM video_badge_rules r WHERE r.video_id = v.id)
  )
GROUP BY blocker
ORDER BY drafts_blocked DESC;

\echo
\echo '=== 5. Schema sanity: is the publish CHECK constraint as expected? ==='
SELECT conname, pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conname = 'videos_publish_required';
