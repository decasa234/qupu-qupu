-- Migration 0006: email OTP register + separate auth providers
-- Drops the table-level UNIQUE on users.email so the same email string can
-- co-exist as both a password account and a Google account (no auto-linking).
-- Adds the pending_registrations staging table for the OTP flow.

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;

CREATE UNIQUE INDEX IF NOT EXISTS users_email_password_unique
  ON users(email)
  WHERE password_hash IS NOT NULL;

CREATE TABLE IF NOT EXISTS pending_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  name VARCHAR(100) NOT NULL,
  age INTEGER,
  password_hash VARCHAR(255) NOT NULL,
  otp_hash VARCHAR(255) NOT NULL,
  attempts_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  last_sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pending_registrations_email ON pending_registrations(email);
CREATE INDEX IF NOT EXISTS idx_pending_registrations_expires_at ON pending_registrations(expires_at);
