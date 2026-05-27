-- Coins v1: earn-only. A second currency that rides the existing
-- gamification engine alongside XP.
--   - reward_ledger.coin_delta    — coins granted on a reward row (audit)
--   - gamification_profiles.coin_balance — running total (cached read model)
--   - quest_templates.coin_reward — per-quest coin payout (mirrors xp_reward)
--
-- Earn-only for v1: there is no coin sink yet. The avatar shop (the spend
-- side) is deferred — see TODOS.md. From the 2026-05-20 eng review (T3, D5).

BEGIN;

ALTER TABLE reward_ledger
  ADD COLUMN IF NOT EXISTS coin_delta INTEGER NOT NULL DEFAULT 0;

ALTER TABLE gamification_profiles
  ADD COLUMN IF NOT EXISTS coin_balance INTEGER NOT NULL DEFAULT 0
    CHECK (coin_balance >= 0);

ALTER TABLE quest_templates
  ADD COLUMN IF NOT EXISTS coin_reward INTEGER NOT NULL DEFAULT 0
    CHECK (coin_reward >= 0);

-- Seed coin_reward for the existing daily quest templates. Values mirror
-- the relative xp_reward ordering; the coin earn-rate is a tuning question
-- (design doc OQ2) and these are deliberately round starting numbers.
UPDATE quest_templates SET coin_reward = 10 WHERE code = 'daily_completion_1';
UPDATE quest_templates SET coin_reward = 15 WHERE code = 'daily_high_score';
UPDATE quest_templates SET coin_reward = 20 WHERE code = 'daily_subject_focus';
UPDATE quest_templates SET coin_reward = 15 WHERE code = 'daily_improvement';
UPDATE quest_templates SET coin_reward = 5  WHERE code = 'daily_streak_keeper';

COMMIT;
