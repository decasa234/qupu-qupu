-- Read-only check: confirms exactly what subject slugs and age group names
-- exist in the live DB so the prefill script's JOIN keys can be aligned.
--
-- Usage:
--   psql "$DATABASE_URL" -f db/scripts/debug_subject_age_names.sql

\echo
\echo '=== Subjects in DB ==='
SELECT id, slug, name, jsonb_array_length(default_badge_ranges) AS default_badge_count
FROM subjects
ORDER BY slug;

\echo
\echo '=== Age groups in DB ==='
SELECT id, name, min_age, max_age
FROM age_groups
ORDER BY name;

\echo
\echo '=== Slugs the prefill script LOOKS FOR ==='
SELECT unnest(ARRAY['aljabar-i', 'matematika-i', 'odd-one-out']) AS expected_slug;

\echo
\echo '=== Age-group names the prefill script LOOKS FOR ==='
SELECT unnest(ARRAY['Usia 5-8', 'Semua Usia']) AS expected_age_group;
