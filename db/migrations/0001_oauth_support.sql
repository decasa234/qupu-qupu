-- Migration 0001: OAuth support
-- Adds google_sub for Google OAuth user lookup, and relaxes password_hash + phone
-- to nullable so OAuth-only users (no password, no phone) can be created.
-- Safe to apply to a database that already has email/password users.

ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
ALTER TABLE users ALTER COLUMN phone DROP NOT NULL;

ALTER TABLE users ADD COLUMN IF NOT EXISTS google_sub VARCHAR(255) UNIQUE;

CREATE INDEX IF NOT EXISTS idx_users_google_sub ON users(google_sub);
