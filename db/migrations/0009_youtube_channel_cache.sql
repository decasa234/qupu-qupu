-- 0009_youtube_channel_cache.sql
-- Postgres-backed cache for the YouTube channel listing. The channel-listing
-- service stores a single annotated payload per uploads playlist with a
-- 10-minute TTL; eviction after a successful bulk-import is a single DELETE.
-- Putting this in Postgres (instead of in-process memory) gives consistent
-- behavior across all Vercel serverless instances.

CREATE TABLE IF NOT EXISTS youtube_channel_cache (
  playlist_id VARCHAR(64) PRIMARY KEY,
  payload JSONB NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_youtube_channel_cache_expires_at
  ON youtube_channel_cache(expires_at);
