-- 0043_notifications.sql — Parent notification channel (Mythos P2.5)
--
-- users.notify_email      opt-out flag for the parent email loop (streak-at-
--                         risk reminders + Monday weekly digest). Default ON;
--                         toggled from the Me page via PUT /api/users/me.
-- notification_log        idempotency ledger for the daily cron
--                         (GET /api/cron/notifications): one row per
--                         (parent, kind, WIB date). The dispatcher INSERTs
--                         ON CONFLICT DO NOTHING RETURNING and only sends
--                         when the row was actually appended, so a re-run of
--                         the cron on the same WIB day sends nothing.
--                         kind: 'streak_at_risk' | 'weekly_digest'.
--
-- Idempotent: ADD COLUMN IF NOT EXISTS / CREATE TABLE IF NOT EXISTS.

BEGIN;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS notify_email BOOLEAN NOT NULL DEFAULT TRUE;

CREATE TABLE IF NOT EXISTS notification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,            -- 'streak_at_risk' | 'weekly_digest'
  wib_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, kind, wib_date)
);

COMMIT;
