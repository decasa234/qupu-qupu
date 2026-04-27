-- 0007_video_drafts.sql
-- Allow video drafts (is_published = false) to persist with NULL QUPU-fields
-- (subject_id, age_group_id, number_of_questions). The publish-time invariant
-- is enforced via a CHECK constraint so a row can only set is_published=true
-- when all three are populated. Service-layer (`normalizeVideoInput`) and
-- frontend client-side validation are the primary gate; this CHECK is
-- defense-in-depth if those paths are ever bypassed.

ALTER TABLE videos ALTER COLUMN subject_id DROP NOT NULL;
ALTER TABLE videos ALTER COLUMN age_group_id DROP NOT NULL;
ALTER TABLE videos ALTER COLUMN number_of_questions DROP NOT NULL;

-- The pre-existing CHECK (number_of_questions > 0) already treats NULL as
-- passing under SQL three-valued logic, so it does not need to be rewritten.

ALTER TABLE videos
  ADD CONSTRAINT videos_publish_required
  CHECK (
    is_published = false OR (
      subject_id IS NOT NULL
      AND age_group_id IS NOT NULL
      AND number_of_questions IS NOT NULL
    )
  );
