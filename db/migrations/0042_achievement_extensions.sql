-- Achievement extensions (Mythos P2.4). Three new long-arc milestones:
--
--   streak_100        rides the existing streak_threshold evaluator type —
--                     the threshold comes from target_value, so this is
--                     seed-only (no evaluator change needed).
--   garden_10_mahir   rides concept_mahir_first (COUNT of
--                     wmi_concept_progress rows at best_tier >= Mahir >=
--                     target_value) — already generalized over target_value.
--   first_gold_chapter NEW evaluator type gold_chapter_first: number of
--                     chapters (wmi_subjects) where EVERY enabled concept of
--                     that subject is best_tier >= Mahir for the child —
--                     see achievementEvaluator.ts fetchAchievementState.
--
-- The level-gated avatar items shipped alongside this (src/lib/avatars.ts +
-- api/lib/avatarCatalog.ts) need no DDL.
--
-- Idempotent: ON CONFLICT (code) DO NOTHING.

BEGIN;

INSERT INTO achievement_templates
  (code, title, description, achievement_type, target_value, xp_reward, icon_key, sort_order, metadata)
VALUES
  ('streak_100',
   'Streak 100 Hari',
   'Seratus hari berturut-turut latihan tanpa putus. Legenda QUPU!',
   'streak_threshold', 100, 1000, 'fire', 15, '{}'::jsonb),

  ('garden_10_mahir',
   '10 Tanaman Mahir',
   'Sepuluh konsep di kebun belajarmu mencapai tingkat Mahir.',
   'concept_mahir_first', 10, 300, 'tree', 16, '{}'::jsonb),

  ('first_gold_chapter',
   'Bab Emas Pertama',
   'Bab pertamamu yang 100% tumbuh — semua tanaman di satu bab mencapai tingkat Mahir.',
   'gold_chapter_first', 1, 200, 'trophy', 17, '{}'::jsonb)
ON CONFLICT (code) DO NOTHING;

COMMIT;
