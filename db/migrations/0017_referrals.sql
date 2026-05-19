-- Plan 5c of the gamification track: parent-to-parent referral.
--
-- Each user gets at most one lifetime referral code (their share token).
-- Each NEW user can be marked as referred at most once. Uses are
-- recorded best-effort by the frontend post-registration (POST
-- /api/me/referrals/use); bad/missing codes are silently swallowed
-- so referrals never break registration.

BEGIN;

CREATE TABLE IF NOT EXISTS user_referral_codes (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  code VARCHAR(20) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- code is short, alphanumeric, URL-safe. The service generates it
-- via Postgres random + base-36 encoding (no client choice).
CREATE INDEX IF NOT EXISTS idx_user_referral_codes_code
  ON user_referral_codes (code);

CREATE TABLE IF NOT EXISTS referral_uses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Each referred user can only be credited to one referrer ever.
  CONSTRAINT referral_uses_referred_unique UNIQUE (referred_user_id)
);

CREATE INDEX IF NOT EXISTS idx_referral_uses_referrer
  ON referral_uses (referrer_user_id, used_at DESC);

COMMIT;
