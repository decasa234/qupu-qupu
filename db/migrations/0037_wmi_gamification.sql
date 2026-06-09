-- Wire the WMI garden into the gamification loop (Mythos P0 item 5).
--
-- New event types emitted by the backend (no DDL needed — the
-- gamification_events.event_type column is an unconstrained VARCHAR(80)):
--   KONSEP_SESSION_COMPLETED  one committed 20-question konsep session
--   KONSEP_QUESTION_ANSWERED  batch marker (metadata.count = graded answers)
--   KONSEP_CONCEPT_GROWN      batch marker (metadata.count = new-tier concepts)
--   CHAPTER_TEST_PASSED       Tes Bab >= 70%
--
-- Quest templates: the garden-first daily trio. Once these exist, the
-- generator (questGenerator.ts pickSlots) uses them as the 3 daily slots —
-- all completable in a single konsep session. quest_type 'konsep' has no
-- special evaluator constraint (falls through to plain target_metric match).
--
-- Achievement templates: garden milestones + the streak family extended to
-- 14 and 30 days. concept_mahir_first / chapter_test_passed_first /
-- konsep_sessions_completed are evaluated by achievementEvaluator.ts
-- against wmi_concept_progress, wmi_chapter_tests, and KONSEP_SESSION_
-- COMPLETED events respectively.
--
-- Idempotent: ON CONFLICT (code) DO NOTHING throughout.

BEGIN;

INSERT INTO quest_templates
  (code, title, description, quest_type, cadence, target_metric, target_value, xp_reward, coin_reward, metadata)
VALUES
  ('konsep_answers_10',
   'Jawab 10 soal konsep',
   'Jawab 10 soal latihan konsep di kebun belajarmu hari ini.',
   'konsep', 'daily', 'KONSEP_QUESTION_ANSWERED', 10, 15, 10,
   '{}'::jsonb),

  ('konsep_session_1',
   'Selesaikan 1 sesi latihan',
   'Selesaikan satu sesi latihan 20 soal sampai tuntas.',
   'konsep', 'daily', 'KONSEP_SESSION_COMPLETED', 1, 20, 10,
   '{}'::jsonb),

  ('konsep_grow_1',
   'Tumbuhkan 1 tanaman ke tingkat baru',
   'Buat satu tanaman konsep naik ke tingkat pemahaman baru.',
   'konsep', 'daily', 'KONSEP_CONCEPT_GROWN', 1, 20, 15,
   '{}'::jsonb)
ON CONFLICT (code) DO NOTHING;

INSERT INTO achievement_templates
  (code, title, description, achievement_type, target_value, xp_reward, icon_key, sort_order, metadata)
VALUES
  ('first_concept_mahir',
   'Tanaman Mahir Pertama',
   'Satu konsep di kebun belajarmu mencapai tingkat Mahir.',
   'concept_mahir_first', 1, 40, 'seedling', 10, '{}'::jsonb),

  ('first_chapter_test',
   'Lulus Tes Bab Pertama',
   'Lulus Tes Bab pertamamu dengan skor minimal 70%.',
   'chapter_test_passed_first', 1, 50, 'graduation-cap', 11, '{}'::jsonb),

  ('konsep_sessions_5',
   '5 Sesi Latihan',
   'Selesaikan 5 sesi latihan konsep sampai tuntas.',
   'konsep_sessions_completed', 5, 40, 'dumbbell', 12, '{}'::jsonb),

  ('streak_14_days',
   'Streak 14 Hari',
   'Dua minggu penuh latihan tanpa putus!',
   'streak_threshold', 14, 150, 'fire', 13, '{}'::jsonb),

  ('streak_30_days',
   'Streak 30 Hari',
   'Sebulan penuh latihan tanpa putus. Luar biasa!',
   'streak_threshold', 30, 300, 'fire', 14, '{}'::jsonb)
ON CONFLICT (code) DO NOTHING;

COMMIT;
