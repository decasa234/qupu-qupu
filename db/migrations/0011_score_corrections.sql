BEGIN;

ALTER TABLE score_attempts
  ADD COLUMN IF NOT EXISTS is_correction BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE user_badge_unlocks
  RENAME COLUMN best_correct_answers TO correct_answers;

COMMIT;
