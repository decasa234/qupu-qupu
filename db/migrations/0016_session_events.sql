-- Plan 5a of the gamification track: session events.
--
-- Replaces the dashboard's questions-x-0.5 screen-time heuristic with
-- real measurements. The frontend logs video_open/close pairs with a
-- duration_ms, plus lightweight quiz_submit and dashboard_open events
-- for future activation analytics.
--
-- Volume estimate: 10 events per kid per day × 100 active kids = 1000
-- rows/day. Trivial for Postgres. The (child_id, occurred_at) index
-- supports the daily-window aggregation the dashboard runs.

BEGIN;

CREATE TABLE IF NOT EXISTS session_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  event_kind VARCHAR(40) NOT NULL
    CHECK (event_kind IN (
      'video_open',
      'video_close',
      'quiz_start',
      'quiz_submit',
      'dashboard_open'
    )),
  video_id UUID REFERENCES videos(id) ON DELETE SET NULL,
  duration_ms INTEGER CHECK (duration_ms IS NULL OR duration_ms >= 0),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_session_events_child_occurred
  ON session_events (child_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_session_events_kind_occurred
  ON session_events (event_kind, occurred_at DESC);

COMMIT;
