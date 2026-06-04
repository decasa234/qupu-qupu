-- Soft delete for videos. Admin "Hapus" sets deleted_at (and unpublishes)
-- instead of hard-deleting the row. This keeps the youtube_video_id on record
-- so the YouTube channel importer's "already imported" check still sees it and
-- the removed video never resurfaces in the import picker. Earned badges/scores
-- are preserved (the row stays). Public/member reads already filter
-- is_published = TRUE, so unpublishing hides it everywhere member-facing; admin
-- catalog reads add an explicit deleted_at IS NULL filter.
ALTER TABLE videos ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
