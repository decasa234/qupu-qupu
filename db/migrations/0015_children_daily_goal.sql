-- Plan 4 of the gamification track: per-child configurable daily goal.
-- Replaces the hardcoded "3 quizzes/day" default in dashboard.ts with a
-- column the parent can edit on the child profile.

BEGIN;

ALTER TABLE children
  ADD COLUMN IF NOT EXISTS daily_goal_quizzes INTEGER NOT NULL DEFAULT 3
    CHECK (daily_goal_quizzes BETWEEN 1 AND 20);

COMMIT;
