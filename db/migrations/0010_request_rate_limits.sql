-- 0010_request_rate_limits.sql
-- Postgres-backed sliding-window rate limiter, keyed by (user_id, route).
-- An atomic INSERT ... ON CONFLICT ... DO UPDATE ... RETURNING count UPSERT
-- increments the counter or resets it when the window has elapsed. Living in
-- Postgres (instead of an in-process Map) makes the limit honest across all
-- Vercel serverless instances.

CREATE TABLE IF NOT EXISTS request_rate_limits (
  user_id UUID NOT NULL,
  route VARCHAR(64) NOT NULL,
  window_started_at TIMESTAMPTZ NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, route)
);

CREATE INDEX IF NOT EXISTS idx_request_rate_limits_window
  ON request_rate_limits(window_started_at);
