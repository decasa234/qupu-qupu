-- Dormant subscription-plan hook on users. V1 ships only 'free'; no gating logic
-- consumes this column yet. Idempotent.
BEGIN;
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free'
    CHECK (plan IN ('free','premium','pro'));
COMMIT;
