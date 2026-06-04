-- Generalize the rate-limit table key from a UUID user_id to an opaque TEXT
-- key, so the limiter can also key on IP / email / pendingId for the
-- unauthenticated auth + analytics routes (not just admin user ids).
--
-- Safe to run on an existing DB: renames the column and widens its type
-- (UUID -> TEXT via an explicit cast). The composite primary key follows the
-- renamed column automatically. Existing UUID rows become their text form.

ALTER TABLE request_rate_limits
  RENAME COLUMN user_id TO limit_key;

ALTER TABLE request_rate_limits
  ALTER COLUMN limit_key TYPE TEXT USING limit_key::text;
