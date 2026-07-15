-- 0050: cold-start fast path for the WMI concept bootstrap.
--
-- ensureBootstrapped() used to replay ~1,700 sequential idempotent queries
-- (subject/concept upserts + 80 concepts x 20 seed inserts) on every
-- serverless cold start, making the first /me/wmi/* request of each
-- instance take tens of seconds (the Belajar page skeleton hang). This
-- single-row stamp records the fingerprint of the last completed pass so a
-- matching cold start skips straight to serving.

CREATE TABLE IF NOT EXISTS wmi_bootstrap_state (
  id             SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  fingerprint    TEXT NOT NULL,
  bootstrapped_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
