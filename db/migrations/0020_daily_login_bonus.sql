-- Daily login bonus: a once-per-WIB-day coin grant the kid claims from the
-- Home "Hadiah Login" card. This is the first coin SINK-free earn path that
-- is NOT tied to a quiz submission.
--
-- daily_login_claims: UNIQUE(child_id, claim_date) IS the idempotency guard —
-- a second claim on the same WIB day inserts nothing, so coins can't be
-- double-granted by a double-tap or an HTTP retry. claim_date is a WIB
-- calendar day (YYYY-MM-DD), computed by the service via lib/wib.ts, NOT a
-- Postgres NOW() so the day boundary matches streaks/quests.
--
-- The coin credit itself lands on gamification_profiles.coin_balance and is
-- mirrored to reward_ledger (reward_type LOGIN_BONUS_COIN) so the running
-- balance stays reconcilable against the ledger — same invariant as coins
-- v1 (migration 0018) and shop purchases (0019). Crucially, claiming does
-- NOT touch last_activity_date: a login bonus is not a learning activity and
-- must never advance or reset the streak.

BEGIN;

CREATE TABLE IF NOT EXISTS daily_login_claims (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id      UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  claim_date    DATE NOT NULL,
  coins_awarded INT  NOT NULL CHECK (coins_awarded >= 0),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (child_id, claim_date)
);
CREATE INDEX IF NOT EXISTS idx_daily_login_claims_child
  ON daily_login_claims (child_id, claim_date DESC);

COMMIT;
