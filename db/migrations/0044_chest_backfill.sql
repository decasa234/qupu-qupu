-- 0044_chest_backfill.sql — one-time chapter-chest backfill (P2 review)
--
-- Chapter chests were only evaluated at konsep session commits, so a child
-- whose chapter crossed 50%/100% grown via the single-answer drill path
-- (POST /me/wmi/attempts, mode=concept) never received the chest.
-- api/services/wmi/attempts.ts now evaluates chests on drill-path Mahir
-- crossings; this migration heals every (child, subject) ALREADY past a
-- threshold (grown = best_tier >= 3 over the chapter's enabled concepts).
--
-- Reward amounts are literals and MUST stay in sync with
-- api/services/gamification/chapterChest.ts CHAPTER_CHEST_REWARD:
--   50%  threshold -> 15 coins,  0 XP
--   100% threshold -> 40 coins, 20 XP
--
-- Ledger keys are md5('chest:<childId>:<subjectKey>:<threshold>')::uuid —
-- byte-for-byte what api/lib/deterministicUuid.ts produces — so rows already
-- granted by the live path collide here (and future live grants collide with
-- these rows) on reward_ledger_unique.
--
-- Idempotent: the ledger INSERT is ON CONFLICT DO NOTHING and the profile
-- UPDATE sums ONLY the rows THIS run inserted (CTE), so a re-run credits 0.
-- current_level is intentionally not resynced: the +20 XP is small and the
-- cached level self-heals on the child's next grant (updateProfileWithDelta).

BEGIN;

-- Safety net: every child with concept progress should already have a
-- profile (ensureProfile runs before any grant), but guarantee the UPDATE
-- below can never silently drop a credit.
INSERT INTO gamification_profiles (child_id)
SELECT DISTINCT child_id FROM wmi_concept_progress
ON CONFLICT (child_id) DO NOTHING;

WITH totals AS (
  SELECT subject_key, COUNT(*)::int AS total
    FROM wmi_concepts
   WHERE enabled = TRUE AND subject_key IS NOT NULL
   GROUP BY subject_key
),
grown AS (
  SELECT p.child_id, c.subject_key, COUNT(*)::int AS grown
    FROM wmi_concept_progress p
    JOIN wmi_concepts c ON c.slug = p.concept_slug
   WHERE p.best_tier >= 3 -- Mahir (PROFICIENT_TIER)
     AND c.enabled = TRUE
     AND c.subject_key IS NOT NULL
   GROUP BY p.child_id, c.subject_key
),
due AS (
  -- Integer-only share check mirrors chestThresholdsToGrant:
  -- grown * 100 >= threshold * total.
  SELECT g.child_id, g.subject_key, t.threshold, t.xp_delta, t.coin_delta
    FROM grown g
    JOIN totals tt ON tt.subject_key = g.subject_key
    CROSS JOIN (VALUES (50, 0, 15), (100, 20, 40)) AS t(threshold, xp_delta, coin_delta)
   WHERE tt.total > 0
     AND g.grown * 100 >= t.threshold * tt.total
),
inserted AS (
  INSERT INTO reward_ledger
    (child_id, reward_type, source_type, source_id, xp_delta, coin_delta, metadata)
  SELECT d.child_id,
         'CHAPTER_CHEST_XP',
         'chapter_chest',
         md5('chest:' || d.child_id::text || ':' || d.subject_key || ':' || d.threshold::text)::uuid,
         d.xp_delta,
         d.coin_delta,
         jsonb_build_object('subjectKey', d.subject_key, 'threshold', d.threshold, 'backfill', TRUE)
    FROM due d
  ON CONFLICT (child_id, reward_type, source_type, source_id) DO NOTHING
  RETURNING child_id, xp_delta, coin_delta
)
UPDATE gamification_profiles gp
   SET total_xp = gp.total_xp + s.xp,
       coin_balance = gp.coin_balance + s.coins,
       updated_at = NOW()
  FROM (
    SELECT child_id, SUM(xp_delta)::int AS xp, SUM(coin_delta)::int AS coins
      FROM inserted
     GROUP BY child_id
  ) s
 WHERE gp.child_id = s.child_id;

COMMIT;
