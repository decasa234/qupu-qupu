-- 0039_konsep_session_idempotency.sql — idempotent Konsep session commit (Mythos P1.5)
--
-- A re-POST of /me/wmi/konsep/commit (timeout retry, lost response) used to
-- re-run all 20 attempts: duplicate wmi_attempts, double comprehension counts,
-- inflated quest/session-event counters. The client now generates a UUID when
-- a session STARTS and sends it as session_id; the commit claims the id with
-- INSERT ... ON CONFLICT DO NOTHING inside the commit transaction. A retry
-- conflicts, reads the stored result JSON, and returns it verbatim — no new
-- attempts, events, or quest progress.
--
-- result is '{}'::jsonb while the owning transaction is in flight and is
-- UPDATEd to the full SessionResult before COMMIT, so a committed row always
-- carries the final result (the claim + work + result write are atomic).
--
-- Idempotent: CREATE TABLE IF NOT EXISTS.

BEGIN;

CREATE TABLE IF NOT EXISTS wmi_konsep_sessions (
  session_id  UUID PRIMARY KEY,
  child_id    UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  subject_key TEXT NOT NULL,
  result      JSONB NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMIT;
