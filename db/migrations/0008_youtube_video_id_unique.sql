-- 0008_youtube_video_id_unique.sql
-- Enforce youtube_video_id uniqueness at the DB layer so concurrent bulk
-- imports and double-submits cannot create duplicate catalog rows. The
-- bulk-import service catches Postgres SQLSTATE 23505 against this index
-- and returns { status: "already_imported" } instead of a 5xx.
--
-- Pre-flight verification aborts the migration cleanly if the existing data
-- would violate the constraint, so the operator can backfill or dedupe before
-- the index is created.

DO $$
DECLARE
  null_or_empty_count INTEGER;
  duplicate_groups INTEGER;
BEGIN
  SELECT COUNT(*) INTO null_or_empty_count
    FROM videos
    WHERE youtube_video_id IS NULL OR youtube_video_id = '';

  IF null_or_empty_count > 0 THEN
    RAISE EXCEPTION
      'Migration 0008 aborted: % rows in videos have NULL or empty youtube_video_id. Backfill these rows before re-running.',
      null_or_empty_count;
  END IF;

  SELECT COUNT(*) INTO duplicate_groups
    FROM (
      SELECT youtube_video_id
      FROM videos
      GROUP BY youtube_video_id
      HAVING COUNT(*) > 1
    ) AS dups;

  IF duplicate_groups > 0 THEN
    RAISE EXCEPTION
      'Migration 0008 aborted: % distinct youtube_video_id values have duplicate rows in videos. Dedupe before re-running.',
      duplicate_groups;
  END IF;
END $$;

CREATE UNIQUE INDEX videos_youtube_video_id_unique
  ON videos (youtube_video_id);
