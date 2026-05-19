-- Plan 3 of the gamification track: long-term milestone achievements.
-- Builds on Plan 1 (gamification_events, reward_ledger) and Plan 2
-- (streak state on gamification_profiles).
--
-- Achievement vs. quest: quests reset daily; achievements unlock once
-- per child and persist forever. Both grant XP via the reward_ledger.

BEGIN;

-- ─────────────────────────────────────────────────────────────────────
-- achievement_templates — seeded milestone definitions.
-- achievement_type is the discriminator the evaluator switches on.
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS achievement_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(80) NOT NULL UNIQUE,
  title VARCHAR(160) NOT NULL,
  description TEXT NOT NULL,
  achievement_type VARCHAR(80) NOT NULL,
  target_value INTEGER NOT NULL CHECK (target_value >= 1),
  xp_reward INTEGER NOT NULL DEFAULT 0 CHECK (xp_reward >= 0),
  icon_key VARCHAR(80),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed 9 V1 achievements per the gamification spec + CEO cherry-pick #2
-- (first-quiz activation moment — handled by xp_reward = 25, which stacks
-- with QUIZ_COMPLETION_XP = 25 to produce the "2x XP" feel on first quiz).
INSERT INTO achievement_templates
  (code, title, description, achievement_type, target_value, xp_reward, icon_key, sort_order, metadata)
VALUES
  ('first_quiz',
   'Quiz Pertama!',
   'Selamat! Kamu menyelesaikan quiz pertama di QUPU.',
   'first_quiz_completed', 1, 25, 'target', 1, '{}'::jsonb),

  ('streak_3_days',
   'Streak 3 Hari',
   'Tiga hari berturut-turut latihan. Konsistensi luar biasa!',
   'streak_threshold', 3, 30, 'fire', 2, '{}'::jsonb),

  ('streak_7_days',
   'Streak 7 Hari',
   'Seminggu penuh latihan tanpa putus!',
   'streak_threshold', 7, 75, 'fire', 3, '{}'::jsonb),

  ('first_high_score',
   'Skor Tinggi Pertama',
   'Skor minimal 80% di salah satu quiz untuk pertama kali.',
   'high_score_first', 1, 30, 'star', 4, '{}'::jsonb),

  ('perfect_score',
   'Skor Sempurna',
   'Jawab semua soal benar di salah satu video. 100%!',
   'perfect_score_first', 1, 50, 'crown', 5, '{}'::jsonb),

  ('videos_5_completed',
   '5 Video Selesai',
   'Selesaikan quiz di 5 video berbeda.',
   'videos_completed', 5, 40, 'check-circle', 6, '{}'::jsonb),

  ('subjects_3_tried',
   '3 Subject Dicoba',
   'Mencoba 3 subject berbeda di QUPU.',
   'subjects_tried', 3, 35, 'shapes', 7, '{}'::jsonb),

  ('first_improvement',
   'Memperbaiki Skor',
   'Buka quiz sebelumnya dan perbaiki skor untuk pertama kali.',
   'improvement_first', 1, 20, 'arrow-up', 8, '{}'::jsonb),

  ('badges_50_earned',
   '50 Lencana Video',
   'Kumpulkan 50 lencana total di trophy wall.',
   'badges_total', 50, 100, 'medal', 9, '{}'::jsonb)
ON CONFLICT (code) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────
-- child_achievements — unlocked rows. UNIQUE per (child, template) so
-- re-evaluation can't double-unlock.
-- ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS child_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  achievement_template_id UUID NOT NULL REFERENCES achievement_templates(id) ON DELETE RESTRICT,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source_event_id UUID REFERENCES gamification_events(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT child_achievement_unique
    UNIQUE (child_id, achievement_template_id)
);

CREATE INDEX IF NOT EXISTS idx_child_achievements_child_unlocked
  ON child_achievements (child_id, unlocked_at DESC);

COMMIT;
